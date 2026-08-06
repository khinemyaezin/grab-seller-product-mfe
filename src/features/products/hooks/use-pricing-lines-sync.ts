import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { PricingLineFormValue, ProductFormValue } from "@/features/products/types";

const DEFAULT_CURRENCY = "USD";

function defaultPricingLine(sku: string): PricingLineFormValue {
  return {
    sku,
    title: "",
    currencyCode: DEFAULT_CURRENCY,
    amount: 0,
    minQuantity: null,
    maxQuantity: null,
  };
}

function pricingLinesEqual(
  a: PricingLineFormValue[],
  b: PricingLineFormValue[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((line, index) => {
    const other = b[index];
    const { sku, amount, currencyCode, title, minQuantity, maxQuantity } = line;

    return (
      sku === other.sku &&
      amount === other.amount &&
      currencyCode === other.currencyCode &&
      (title ?? "") === (other.title ?? "") &&
      (minQuantity ?? null) === (other.minQuantity ?? null) &&
      (maxQuantity ?? null) === (other.maxQuantity ?? null)
    );
  });
}


export function usePricingLinesSync() {
  const { control, setValue, getValues } = useFormContext<ProductFormValue>();
  const variants = useWatch({ control, name: "product.variants" });
  const variationTypes = useWatch({ control, name: "variationTypes" });
  const standaloneSku = useWatch({
    control,
    name: "product.standaloneVariant.sku",
  });

  useEffect(() => {
    const existing = getValues("pricingLines") ?? [];
    const hasVariations = (variationTypes?.length ?? 0) > 0;

    let next: PricingLineFormValue[];

    if (hasVariations) {
      const activeVariants = (variants ?? []).filter(
        (variant) => variant.variations.length > 0,
      );
      next = activeVariants.map((variant, index) => {
        const sku = variant.sku ?? "";
        const bySku =
          sku.trim() !== ""
            ? existing.find((line) => line.sku === sku)
            : undefined;
        const fallback = defaultPricingLine(sku);
        const found = (bySku ?? existing[index] ?? {}) as Partial<PricingLineFormValue>;
        return {
          sku,
          title: found.title ?? fallback.title,
          currencyCode: found.currencyCode ?? fallback.currencyCode,
          amount: found.amount ?? fallback.amount,
          minQuantity: found.minQuantity ?? fallback.minQuantity,
          maxQuantity: found.maxQuantity ?? fallback.maxQuantity,
        };
      });
    } else {
      next = [];
    }

    if (!pricingLinesEqual(existing, next)) {
      setValue("pricingLines", next, { shouldDirty: true });
    }
  }, [variants, variationTypes, standaloneSku, getValues, setValue]);
}
