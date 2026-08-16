import {
  PricingCreateContext,
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
  groupId: string;
  context: PricingCreateContext;
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
  byGroup?: ReadonlyMap<string, PricingPayload>,
): PricingSlotDescriptor[] {

  if ((values.variationTypes ?? []).length === 0) {
    const snapshot = byGroup?.get(STANDALONE_PRICING_INSTANCE_ID);
    const context: PricingCreateContext = { sku: values.product.standaloneVariant.sku ?? "" };
    return [
      {
        groupId: STANDALONE_PRICING_INSTANCE_ID,
        context,
        ...(snapshot ? { payload: snapshot } : {}),
      },
    ];
  }

  return (values.product.variants ?? [])
    .filter((variant) => variant.variations.length > 0)
    .map((variant) => {
      const groupId = pricingInstanceId(variant.matrixKey);
      const snapshot = byGroup?.get(groupId);
      const context: PricingCreateContext = { sku: variant.sku ?? "" };
      return {
        groupId,
        context,
        ...(snapshot ? { payload: snapshot } : {}),
      };
    });
}

export function projectPricingLines(
  descriptors: PricingSlotDescriptor[],
): CreateSellableProductPricingLine[] {
  const lines: CreateSellableProductPricingLine[] = [];

  for (const descriptor of descriptors) {
    if (!descriptor.payload) continue;

    lines.push({
      sku: descriptor.payload.sku,
      currencyCode: descriptor.payload.currencyCode,
      amount: descriptor.payload.amount,
    });
  }

  return lines;
}
