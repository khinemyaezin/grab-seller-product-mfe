// Models
export type {
  Product,
  Category,
  Variant,
  Variation,
  VariationMatrix,
  VariationOption,
  VariationType,
  MatrixVariantVariation,
  CategoryLeaf,
  ProductLifecycleEvent
} from "./catalog.model";

// Request DTOs
export type {
  CreateProductRequest,
  CreateProductRequestProduct,
  CreateProductRequestVariation,
  CreateProductRequestVariationType,
  CreateSellableProductRequest,
  CreateSellableProductPricingLine,
  CreateSellableProductInventoryLine,
  UpdateProductRequest,
  UPDATE_INTENT,
  ProductSearchRequest,
  VariationMatrixRequest,
  VariationMatrixRequestVariation,
  VariationMatrixRequestVariantType,
} from "./catalog.request";

// Response DTOs
export type {
  CatalogRoot,
  CreateProductResponse,
  UpdateProductResponse,
  ProductResponse,
  ProductSearchResponse,
  GetFullProductResponse,
  VariationMatrixResponse,
  VariationMatrixResponseVariation,
  VariationMatrixResponseVariantType,
  CategoryLeavesResult,
  GetVariationTypeResult,
  GetVariationOptionResult,
  ProductModerationResponse,
  DeleteProductResponse,
  WorkflowsRoot,
  CreateSellableProductResponse,
} from "./catalog.response";

// Form Values
export type {
  ProductFormValue,
  ProductFilterFormValue,
  InventoryLineFormValue,
} from "./catalog.form";
