import type { Product, ProductStatus, VariationType } from "./catalog.model";

export type PricingLineFormValue = {
  sku: string;
  currencyCode: string;
  amount: number | ""
};

export type InventoryLineFormValue = {
  sku: string;
  locationId: string;
  initialQuantity: number | "";
  safetyStock?: number | "";
  reorderPoint?: number | "";
  reorderQuantity?: number | "";
  maxStock?: number | "";
};

export type ProductFormValue = {
  product: Product;
  variationTypes: VariationType[];
  pricingLines: PricingLineFormValue[];
  inventoryLines: InventoryLineFormValue[];
};

export type ProductFilterFormValue = {
  query: string;
  productStatus: ProductStatus | null;
  page: number;
  size: number;
};
