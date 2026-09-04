import {
  PricingEditContext,
  PricingEditPayloadSchema,
  PRODUCT_EXTENSION_SLOTS,
  type PricingEditPayload,
} from "@khinemyaezin/seller-contracts";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  ProductFormValue,
  UpdateSellableProductPricingLine,
} from "@/features/products/types";
import {
  pricingEditGroupId,
  STANDALONE_PRICING_EDIT_GROUP_ID,
} from "@/features/products/constants/pricing-instance-id";
import z from "zod";

const PRICING_EDIT_SLOT_IDS = new Set<string>([
  PRODUCT_EXTENSION_SLOTS.EDIT_PRICING,
  PRODUCT_EXTENSION_SLOTS.EDIT_PRICING_INLINE,
]);

const schema = z.fromJSONSchema(PricingEditPayloadSchema) as z.ZodType<PricingEditPayload, PricingEditPayload>;

export type PricingEditSlotDescriptor = {
  groupId: string;
  context: PricingEditContext;
  payload?: PricingEditPayload;
};

export function isPricingEditValidateResult(
  result: SlotValidateResult,
): result is SlotValidateResult & { value: PricingEditPayload } {
  return (
    result.valid &&
    PRICING_EDIT_SLOT_IDS.has(result.slotId) &&
    schema.safeParse(result.value).success);
}

export function buildPricingEditSlotDescriptors(
  values: ProductFormValue,
  byGroup?: ReadonlyMap<string, PricingEditPayload>,
): PricingEditSlotDescriptor[] {
  if ((values.variationTypes ?? []).length === 0) {
    const snapshot = byGroup?.get(STANDALONE_PRICING_EDIT_GROUP_ID);
    const context: PricingEditContext = { 
      sku: values.product.standaloneVariant.sku ?? "",
      variantId: values.product.standaloneVariant.id ?? "",
    };
    return [
      {
        groupId: STANDALONE_PRICING_EDIT_GROUP_ID,
        context,
        ...(snapshot ? { payload: snapshot } : {}),
      },
    ];
  }

  return (values.product.variants ?? [])
    .filter((variant) => variant.variations.length > 0)
    .map((variant) => {
      const groupId = pricingEditGroupId(variant.matrixKey);
      const snapshot = byGroup?.get(groupId);
      const context: PricingEditContext = { 
        sku: variant.sku ?? "",
        variantId: variant.id ?? "",
      };
      return {
        groupId,
        context,
        ...(snapshot ? { payload: snapshot } : {}),
      };
    });
}

export function projectPricingEditLines(
  descriptors: PricingEditSlotDescriptor[],
): UpdateSellableProductPricingLine[] {
  const lines: UpdateSellableProductPricingLine[] = [];

  for (const descriptor of descriptors) {
    if (!descriptor.payload) continue;

    const variantId = descriptor.context.variantId.trim();
    lines.push({
      sku: descriptor.payload.sku,
      ...(variantId ? { variantId } : {}),
      currencyCode: descriptor.payload.currencyCode,
      amount: descriptor.payload.amount,
    });
  }

  return lines;
}
