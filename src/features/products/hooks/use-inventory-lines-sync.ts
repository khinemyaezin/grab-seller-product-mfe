import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { InventoryLineFormValue, ProductFormValue } from "@/features/products/types";

function defaultInventoryLine(
  sku: string,
  locationId = "",
): InventoryLineFormValue {
  return {
    sku,
    locationId,
    initialQuantity: 0,
    safetyStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    maxStock: "",
  };
}

function inventoryLinesEqual(
  a: InventoryLineFormValue[],
  b: InventoryLineFormValue[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((line, index) => {
    const other = b[index];
    return (
      line.sku === other.sku &&
      line.locationId === other.locationId &&
      line.initialQuantity === other.initialQuantity &&
      (line.safetyStock ?? "") === (other.safetyStock ?? "") &&
      (line.reorderPoint ?? "") === (other.reorderPoint ?? "") &&
      (line.reorderQuantity ?? "") === (other.reorderQuantity ?? "") &&
      (line.maxStock ?? "") === (other.maxStock ?? "")
    );
  });
}

export function useInventoryLinesSync() {
  const { control, setValue, getValues } = useFormContext<ProductFormValue>();
  const variants = useWatch({ control, name: "product.variants" });
  const variationTypes = useWatch({ control, name: "variationTypes" });
  const standaloneSku = useWatch({
    control,
    name: "product.standaloneVariant.sku",
  });
  const sharedLocationId = useWatch({ control, name: "inventoryLocationId" });

  useEffect(() => {
    const existing = getValues("inventoryLines") ?? [];
    const hasVariations = (variationTypes?.length ?? 0) > 0;
    const fallbackLocation =
      sharedLocationId?.trim() ||
      existing.find((line) => line.locationId?.trim())?.locationId ||
      "";

    let next: InventoryLineFormValue[];

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
        const base =
          bySku ??
          existing[index] ??
          defaultInventoryLine(sku, fallbackLocation);
        return {
          ...base,
          sku,
          locationId: base.locationId || fallbackLocation,
        };
      });
    } else {
      const sku = standaloneSku ?? "";
      const bySku =
        sku.trim() !== ""
          ? existing.find((line) => line.sku === sku)
          : undefined;
      const base =
        bySku ?? existing[0] ?? defaultInventoryLine(sku, fallbackLocation);
      next = [
        {
          ...base,
          sku,
          locationId: base.locationId || fallbackLocation,
        },
      ];
    }

    if (!inventoryLinesEqual(existing, next)) {
      setValue("inventoryLines", next, { shouldDirty: true });
    }
  }, [
    variants,
    variationTypes,
    standaloneSku,
    sharedLocationId,
    getValues,
    setValue,
  ]);
}
