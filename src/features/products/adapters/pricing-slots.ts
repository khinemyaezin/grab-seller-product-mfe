import {
  PRODUCT_EXTENSION_SLOTS,
  type PricingPayload,
} from "@khinemyaezin/seller-contracts";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  PricingLineFormValue,
  ProductFormValue,
} from "@/features/products/types";
import {
  pricingInstanceId,
  STANDALONE_PRICING_INSTANCE_ID,
} from "@/features/products/constants/pricing-instance-id";

const PRICING_SLOT_IDS = new Set<string>([
  PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
  PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE,
]);

export type PricingSlotDescriptor = {
  instanceId: string;
  sku: string;
  matrixKey: string | null;
  payload?: PricingPayload;
};


export function buildPricingSlotDescriptors(
  values: ProductFormValue,
  byInstance?: ReadonlyMap<string, PricingPayload>,
): PricingSlotDescriptor[] {
  const withPayload = (descriptor: PricingSlotDescriptor): PricingSlotDescriptor => {
    const payload = byInstance?.get(descriptor.instanceId);
    return payload ? { ...descriptor, payload } : descriptor;
  };

  if ((values.variationTypes ?? []).length === 0) {
    return [
      withPayload({
        instanceId: STANDALONE_PRICING_INSTANCE_ID,
        sku: values.product.standaloneVariant?.sku ?? "",
        matrixKey: null,
      }),
    ];
  }

  return (values.product.variants ?? [])
    .filter((variant) => variant.variations.length > 0)
    .map((variant) => withPayload({
      instanceId: pricingInstanceId(variant.matrixKey),
      sku: variant.sku ?? "",
      matrixKey: variant.matrixKey,
    }));
}

export function toHydratePayload(descriptor: PricingSlotDescriptor): Partial<PricingPayload> {
  return { ...descriptor.payload, sku: descriptor.sku };
}

export function projectPricingLines(
  descriptors: PricingSlotDescriptor[],
): PricingLineFormValue[] {
  const lines: PricingLineFormValue[] = [];

  for (const descriptor of descriptors) {
    if (!descriptor.payload) continue;

    lines.push({
      sku: descriptor.sku,
      currencyCode: descriptor.payload.currencyCode,
      amount: descriptor.payload.amount,
    });
  }

  return lines;
}
