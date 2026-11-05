"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "../auth";
import { ADJUSTABLE_TYPES } from "../movements";
import { prisma } from "../prisma";

const AdjustSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(ADJUSTABLE_TYPES, { message: "Choose what happened" }),
  amount: z.coerce
    .number({ message: "Enter a quantity" })
    .int("Use a whole number")
    .min(1, "Enter at least 1")
    .max(1_000_000, "That's too many"),
  /** Sale price per unit (SOLD) or cost per unit (RECEIVED); optional. */
  unitAmount: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
    z.coerce
      .number({ message: "Enter a valid amount" })
      .nonnegative("Cannot be negative")
      .max(1_000_000_000, "That's too high")
      .nullable()
  ),
  note: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
    z.string().max(200, "Keep the note under 200 characters").nullable()
  ),
});

export type AdjustStockState = {
  error?: string;
  fieldErrors?: Partial<Record<"type" | "amount" | "unitAmount" | "note", string>>;
  quantityAfter?: number;
};

class StockError extends Error {}

/** Record a delivery, sale or loss and update the product's quantity atomically. */
export async function adjustStock(formData: FormData): Promise<AdjustStockState> {
  const user = await getCurrentUser();

  const parsed = AdjustSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    unitAmount: formData.get("unitAmount"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    const fieldErrors: AdjustStockState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<AdjustStockState["fieldErrors"]>;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Please check the details below.", fieldErrors };
  }

  const { productId, type, amount, unitAmount, note } = parsed.data;
  const change = type === "RECEIVED" ? amount : -amount;

  try {
    const quantityAfter = await prisma.$transaction(async (tx) => {
      // Conditional update so concurrent changes can never push stock below zero.
      const { count } = await tx.product.updateMany({
        where: {
          id: productId,
          userId: user.id,
          ...(change < 0 ? { quantity: { gte: amount } } : {}),
        },
        data: {
          quantity: { increment: change },
          // A delivery with a cost becomes the product's latest cost price.
          ...(type === "RECEIVED" && unitAmount != null ? { costPrice: unitAmount } : {}),
        },
      });

      if (count === 0) {
        const product = await tx.product.findFirst({
          where: { id: productId, userId: user.id },
          select: { quantity: true },
        });
        if (!product) throw new StockError("This product no longer exists.");
        throw new StockError(
          `Only ${product.quantity} in stock — you can't remove ${amount}.`
        );
      }

      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        select: { quantity: true, price: true, costPrice: true },
      });
      const quantity = product.quantity;

      // Snapshot prices so later price changes don't rewrite history.
      await tx.stockMovement.create({
        data: {
          userId: user.id,
          productId,
          type,
          change,
          quantityAfter: quantity,
          note,
          unitPrice: type === "SOLD" && unitAmount != null ? unitAmount : product.price,
          unitCost: type === "RECEIVED" && unitAmount != null ? unitAmount : product.costPrice,
        },
      });
      return quantity;
    });

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${productId}`);
    revalidatePath("/dashboard");
    return { quantityAfter };
  } catch (error) {
    if (error instanceof StockError) {
      return { error: error.message, fieldErrors: { amount: error.message } };
    }
    console.error("Stock adjustment error:", error);
    return { error: "Could not update stock. Please try again." };
  }
}
