export type VariationMatrixRequestVariation = {
  typeId: string;
  optionId: string;
};

export type VariationMatrixRequestVariantType = {
  typeId: string;
  options: { optionId: string }[];
};

export type VariationMatrixRequest = {
  variantTypes: VariationMatrixRequestVariantType[];
  variants: {
    matrixKey: string;
    variations: VariationMatrixRequestVariation[];
  }[];
};

export type CreateProductRequestVariation = {
  typeId: string;
  optionId: string;
};

export type CreateProductRequestVariationType = {
  typeId: string;
  options: { optionId: string }[];
};

export type CreateProductRequestProduct = {
  name: string;
  categoryId: string;
  condition: string;
  slug: string;
  variants: {
    sku: string | undefined;
    variations: CreateProductRequestVariation[];
  }[];
};

export type CreateProductRequest = {
  product: CreateProductRequestProduct;
  variantTypes: CreateProductRequestVariationType[];
};

export type CreateSellableProductPricingLine = {
  sku: string;
  title?: string;
  currencyCode: string;
  amount: number;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  rules?: {
    attribute: string;
    value: string;
    operator?: string;
    priority?: number;
  }[];
};

export type CreateSellableProductInventoryLine = {
  sku: string;
  locationId: string;
  initialQuantity: number;
  safetyStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  maxStock?: number;
};

export type CreateSellableProductRequest = {
  product: CreateProductRequestProduct;
  variantTypes: CreateProductRequestVariationType[];
  pricingLines: CreateSellableProductPricingLine[];
  inventoryLines: CreateSellableProductInventoryLine[];
  idempotencyKey?: string;
};

export type UPDATE_INTENT = "LEAVE_AS_IS" | "FULL_SYNC" | "COLLAPSE_TO_STANDALONE";

export interface UpdateProductRequest {
  name: string;
  categoryId: string;
  condition: string;
  slug: string;
  variantSync: {
    intent: UPDATE_INTENT;
    overrides: {
      sku: string;
      matrixKey: string;
      variations: {
        typeId: string;
        optionId: string;
      }[];
    }[];
    variantTypes: {
      typeId: string;
      options: {
        optionId: string;
        optionName: string;
      }[];
    }[];
  };
}

export interface ProductSearchRequest {
  query?: string,
  variantStatus?: string,
  categoryId?: string,
  productStatus?: string
  page: number;
  size: number;
}
