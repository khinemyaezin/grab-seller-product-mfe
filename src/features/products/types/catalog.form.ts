import type { Product, ProductStatus, VariationType } from "./catalog.model";

export type InventoryLineFormValue = {
  sku: string;
  locationId: string;
  initialQuantity: number | "";
  safetyStock?: number | "";
  reorderPoint?: number | "";
  reorderQuantity?: number | "";
  maxStock?: number | "";
};

/**
 * Pricing lines are absent by design: they are projected from extension slot
 * payloads at submit time, not edited as form state.
 */
export type ProductFormValue = {
  product: Product;
  variationTypes: VariationType[];
  inventoryLines: InventoryLineFormValue[];
};

export type ProductFilterFormValue = {
  query: string;
  productStatus: ProductStatus | null;
  page: number;
  size: number;
};
