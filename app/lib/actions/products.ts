"use server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
  z.string().max(64, "SKU must be 64 characters or fewer").nullable()
);

const optionalInt = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
  z.coerce
    .number({ message: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .nullable()
);

const optionalMoney = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
  z.coerce
    .number({ message: "Must be a number" })
    .nonnegative("Cannot be negative")
    .max(1_000_000_000, "That's too high")
    .nullable()
);

const ProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(120),
  price: z.coerce
    .number({ message: "Price must be a number" })
    .nonnegative("Price cannot be negative"),
  costPrice: optionalMoney,
  quantity: z.coerce
    .number({ message: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  sku: optionalText,
  lowStockAt: optionalInt,
});

export type ProductField = keyof z.infer<typeof ProductSchema>;

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<ProductField, string>>;
  values?: Partial<Record<ProductField, string>>;
};

function readForm(formData: FormData) {
  const get = (key: ProductField) => String(formData.get(key) ?? "");
  return {
    name: get("name"),
    price: get("price"),
    costPrice: get("costPrice"),
    quantity: get("quantity"),
    sku: get("sku"),
    lowStockAt: get("lowStockAt"),
  };
}

function validate(formData: FormData) {
  const values = readForm(formData);
  const parsed = ProductSchema.safeParse(values);
  if (parsed.success) return { values, data: parsed.data };

  const fieldErrors: ProductFormState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as ProductField;
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return {
    values,
    state: {
      error: "Please fix the highlighted fields.",
      fieldErrors,
      values,
    } satisfies ProductFormState,
  };
}

function dbErrorState(
  error: unknown,
  values: ProductFormState["values"],
  action: string
): ProductFormState {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { sku: "This SKU is already in use. Choose another one." },
      values,
    };
  }
  console.error(`Product ${action} error:`, error);
  return { error: `Could not ${action} the product. Please try again.`, values };
}

export async function deleteProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  await prisma.product.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

export async function updateProduct(
  formData: FormData
): Promise<ProductFormState> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  const result = validate(formData);
  if (result.state) return result.state;

  try {
    const found = await prisma.$transaction(async (tx) => {
      const before = await tx.product.findFirst({
        where: { id, userId: user.id },
        select: { quantity: true },
      });
      if (!before) return false;

      await tx.product.update({ where: { id }, data: result.data });

      // Editing the quantity directly is logged as a correction.
      const change = result.data.quantity - before.quantity;
      if (change !== 0) {
        await tx.stockMovement.create({
          data: {
            userId: user.id,
            productId: id,
            type: "ADJUSTED",
            change,
            quantityAfter: result.data.quantity,
            note: "Quantity edited",
            unitPrice: result.data.price,
            unitCost: result.data.costPrice,
          },
        });
      }
      return true;
    });
    if (!found) return { error: "This product no longer exists." };
  } catch (error) {
    return dbErrorState(error, result.values, "update");
  }

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath("/dashboard");
  return {};
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const user = await getCurrentUser();

  const result = validate(formData);
  if (result.state) return result.state;

  try {
    await prisma.product.create({
      data: {
        ...result.data,
        userId: user.id,
        movements: {
          create: {
            userId: user.id,
            type: "INITIAL",
            change: result.data.quantity,
            quantityAfter: result.data.quantity,
            note: "Opening stock",
            unitPrice: result.data.price,
            unitCost: result.data.costPrice,
          },
        },
      },
    });
  } catch (error) {
    return dbErrorState(error, result.values, "add");
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  redirect("/inventory?toast=success&message=Product%20added%20successfully");
}
