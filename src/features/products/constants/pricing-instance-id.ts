export const STANDALONE_PRICING_INSTANCE_ID = "product.create.pricing:standalone";

export function pricingInstanceId(index: number): string {
  return `product.create.pricing:${index}`;
}
