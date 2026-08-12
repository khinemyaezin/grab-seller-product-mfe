import type {
  CreateProductRequest,
  CreateSellableProductRequest,
  ProductFormValue,
} from "@/features/products/types";
import { generateSlug } from "@/features/products/utils";
import {
  toCreateInventoryLine,
} from "./inventory-lines";
import { buildCreatePricingLine } from "./pricing-lines";

export function buildCreateProductRequest(
  values: ProductFormValue,
): CreateProductRequest {
  const hasVariations = values.product.variants.length > 0;

  const mappedVariants = hasVariations
    ? values.product.variants.map((variant) => ({
      sku: variant.sku,
      variations: variant.variations.map((variation) => ({
        typeId: variation.typeId,
        optionId: variation.optionId,
      })),
    }))
    : [{
      sku: values.product.standaloneVariant.sku ?? "",
      variations: [],
    }];

  return {
    product: {
      name: values.product.name,
      categoryId: values.product.category?.id || "",
      condition: "NEW",
      slug: generateSlug(values.product.name),
      variants: mappedVariants,
    },
    variantTypes: values.variationTypes.map((type) => ({
      typeId: type.uuid,
      options: type.options
        .filter((option) => option.uuid !== "")
        .map((option) => ({
          optionId: option.uuid,
        })),
    })),
  };
}


export function buildCreateSellableProductRequest(
  values: ProductFormValue,
): CreateSellableProductRequest {
  return {
    ...buildCreateProductRequest(values),
    pricingLines: (values.pricingLines ?? [])
      .map(buildCreatePricingLine),
    inventoryLines: (values.inventoryLines ?? [])
      .map(toCreateInventoryLine),
  };
}
