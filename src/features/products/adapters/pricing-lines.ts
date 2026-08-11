import {
  PRODUCT_EXTENSION_SLOTS,
  type PricingPayload,
} from "@khinemyaezin/seller-contracts";
import type {
  CreateSellableProductPricingLine,
  PricingLineFormValue,
} from "@/features/products/types";
import type { SlotLineContribution } from "./slot-lines";

const PRICING_SLOT_IDS = new Set<string>([
  PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
  PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE,
]);

function isPricingPayload(value: unknown): value is PricingPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as PricingPayload;
  return typeof payload.sku === "string"
    && typeof payload.currencyCode === "string"
    && typeof payload.amount === "number";
}

export const pricingLineContribution: SlotLineContribution<"pricingLines"> = {
  storeKey: "pricingLines",
  ownsSlot: (slotId) => PRICING_SLOT_IDS.has(slotId),
  toLine: (value) => {
    if (!isPricingPayload(value) || !value.sku) return null;

    return {
      sku: value.sku,
      currencyCode: value.currencyCode,
      amount: value.amount,
    };
  },
  identityOf: (line) => line.sku,
};

export function isSubmittablePricingLine(line: PricingLineFormValue): boolean {
  return !!line?.sku && !!line.currencyCode && line.amount !== "";
}

export function toCreatePricingLine(
  line: PricingLineFormValue,
): CreateSellableProductPricingLine {
  return {
    sku: line.sku,
    currencyCode: line.currencyCode,
    amount: Number(line.amount),
  };
}
