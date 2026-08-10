import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { ProductFormValue, Variant } from "../types";

export function usePricingLinesVariantSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const { remove } = useFieldArray({ control, name: "pricingLines" });

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const lastMatrixKeysRef = useRef<string[]>([]);

  useEffect(() => {
    const currentVariants = (variants ?? []).filter((variant): variant is Variant => variant != null);
    const matrixKeys = currentVariants.map((variant) => variant.matrixKey);
    const prevMatrixKeys = lastMatrixKeysRef.current;
    lastMatrixKeysRef.current = matrixKeys;

    if (matrixKeys.join("|") === prevMatrixKeys.join("|")) return;

    const keepSkus = new Set([
      ...currentVariants.map((variant) => variant.sku),
      getValues("product.standaloneVariant.sku"),
    ].filter(Boolean));

    const lines = getValues("pricingLines") ?? [];
    const staleIndices: number[] = [];
    
    lines.forEach((line, index) => {
      if (!line) return;
      if (line.sku && !keepSkus.has(line.sku)) staleIndices.push(index);
    });
    staleIndices.sort((a, b) => b - a);

    if (staleIndices.length > 0) remove(staleIndices);
  }, [variants, getValues, remove]);
}
