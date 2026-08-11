import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { ProductFormValue, Variant } from "../types";

function removeStaleLines(
  lines: ProductFormValue["pricingLines"],
  shouldRemove: (line: ProductFormValue["pricingLines"][number], index: number) => boolean,
  remove: (index: number | number[]) => void,
) {
  const staleIndices = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line, index }) => line && shouldRemove(line, index))
    .map(({ index }) => index);

  if (staleIndices.length > 0) {
    remove(staleIndices.sort((a, b) => b - a));
  }
}

export function usePricingLinesVariantSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const { remove } = useFieldArray({ control, name: "pricingLines" });

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });
  const lastMatrixKeysRef = useRef<string[]>([]);
  const lastVariationTypeCountRef = useRef(0);

  useEffect(() => {
    const lines = getValues("pricingLines") ?? [];
    const typeCount = (variationTypes ?? []).length;
    const wasStandalone = lastVariationTypeCountRef.current === 0;
    lastVariationTypeCountRef.current = typeCount;

    if (typeCount === 0) {
      lastMatrixKeysRef.current = [];

      const standaloneSku = getValues("product.standaloneVariant.sku") ?? "";
      removeStaleLines(
        lines,
        (line) => !!line.sku && line.sku !== standaloneSku,
        remove,
      );
      return;
    }

    const currentVariants = (variants ?? []).filter((variant): variant is Variant => variant != null);
    const matrixKeys = currentVariants.map((variant) => variant.matrixKey);
    const prevMatrixKeys = lastMatrixKeysRef.current;
    lastMatrixKeysRef.current = matrixKeys;

    const matrixChanged = matrixKeys.join("|") !== prevMatrixKeys.join("|");
    const enteredVariationMode = wasStandalone && typeCount > 0;

    if (!matrixChanged && !enteredVariationMode) return;

    const keepSkus = new Set(
      currentVariants.map((variant) => variant.sku).filter(Boolean),
    );

    removeStaleLines(
      lines,
      (line) => !!line.sku && !keepSkus.has(line.sku),
      remove,
    );
  }, [variants, variationTypes, getValues, remove]);
}
