import type {
  CreateSellableProductPricingLine,
  PricingLineFormValue,
} from "@/features/products/types";


export function toCreatePricingLine(
  line: PricingLineFormValue,
): CreateSellableProductPricingLine {
  return {
    sku: line.sku,
    currencyCode: line.currencyCode,
    amount: Number(line.amount),
  };
}
