"use server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";
import { z } from "zod";


const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  sku: z.string().optional(),
  lowStockAt: z.coerce.number().int().min(0).optional(),
});

export async function deleteProduct(formData: FormData) {
    const user = await getCurrentUser();
    const id = String(formData.get("id") || "");

    await prisma.product.deleteMany({
        where: {id: id, userId: user.id}
    });
}

export async function updateProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  const skuValue = formData.get("sku");
  const lowStockAtValue = formData.get("lowStockAt");

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: skuValue && String(skuValue).trim() !== "" ? skuValue : undefined,
    lowStockAt: lowStockAtValue && String(lowStockAtValue).trim() !== "" ? lowStockAtValue : undefined,
  });

  if (!parsed.success) {
    throw new Error("Validation failed");
  }

  try {
    await prisma.product.updateMany({
      where: { id: id, userId: user.id },
      data: {
        ...parsed.data,
      },
    });
  } catch (error) {
    console.error("Product update error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint") || error.message.includes("sku")) {
        throw new Error("A product with this SKU already exists.");
      }
      throw new Error(`Failed to update product: ${error.message}`);
    }
    throw new Error("Failed to update product.");
  }
}

export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();

  const skuValue = formData.get("sku");
  const lowStockAtValue = formData.get("lowStockAt");

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: skuValue && String(skuValue).trim() !== "" ? skuValue : undefined,
    lowStockAt: lowStockAtValue && String(lowStockAtValue).trim() !== "" ? lowStockAtValue : undefined,
  });

  if (!parsed.success) {
    throw new Error("Validation failed");
  }

  try {
    await prisma.product.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
    });
    redirect("/inventory?toast=success&message=Product%20added%20successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    
    console.error("Product creation error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint") || error.message.includes("sku")) {
        throw new Error("A product with this SKU already exists.");
      }
      throw new Error(`Failed to create product: ${error.message}`);
    }
    throw new Error("Failed to create product.");
  }
}