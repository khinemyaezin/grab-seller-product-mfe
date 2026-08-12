import {
  PricingPayloadSchema,
  PRODUCT_EXTENSION_SLOTS,
  type PricingPayload,
} from "@khinemyaezin/seller-contracts";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  CreateSellableProductPricingLine,
  ProductFormValue,
} from "@/features/products/types";
import {
  pricingInstanceId,
  STANDALONE_PRICING_INSTANCE_ID,
} from "@/features/products/constants/pricing-instance-id";
import z from "zod";

const PRICING_SLOT_IDS = new Set<string>([
  PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
  PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE,
]);

const schema = z.fromJSONSchema(PricingPayloadSchema) as z.ZodType<PricingPayload, PricingPayload>;

export type PricingSlotDescriptor = {
  instanceId: string;
  sku: string;
  matrixKey: string | null;
  payload?: PricingPayload;
};

export function isPricingValidateResult(
  result: SlotValidateResult,
): result is SlotValidateResult & { value: PricingPayload } {
  return (
    result.valid &&
    PRICING_SLOT_IDS.has(result.slotId) &&
    schema.safeParse(result.value).success);
}

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

export function toHydrateIdentity(
  descriptor: PricingSlotDescriptor,
): Partial<PricingPayload> {
  return { ...descriptor.payload };
}

export function projectPricingLines(
  descriptors: PricingSlotDescriptor[],
): CreateSellableProductPricingLine[] {
  const lines: CreateSellableProductPricingLine[] = [];

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
