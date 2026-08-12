export const STANDALONE_PRICING_INSTANCE_ID = "product.create.pricing:standalone";

export function pricingInstanceId(matrixKey: string): string {
  return `product.create.pricing:${matrixKey}`;
}
