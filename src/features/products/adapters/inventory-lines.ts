import type {
  CreateSellableProductInventoryLine,
  InventoryLineFormValue,
} from "@/features/products/types";

function optionalNumber(value: number | "" | undefined): number | undefined {
  return value === "" || value == null ? undefined : Number(value);
}

export function toCreateInventoryLine(
  line: InventoryLineFormValue,
): CreateSellableProductInventoryLine {
  return {
    sku: line.sku,
    locationId: line.locationId,
    initialQuantity: Number(line.initialQuantity),
    safetyStock: optionalNumber(line.safetyStock),
    reorderPoint: optionalNumber(line.reorderPoint),
    reorderQuantity: optionalNumber(line.reorderQuantity),
    maxStock: optionalNumber(line.maxStock),
  };
}
