import {
  InventoryCreateContext,
  InventoryPayloadSchema,
  PRODUCT_EXTENSION_SLOTS,
  type InventoryPayload,
} from "@khinemyaezin/seller-contracts";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  CreateSellableProductInventoryLine,
  ProductFormValue,
} from "@/features/products/types";
import {
  inventoryGroupId,
  STANDALONE_INVENTORY_GROUP_ID,
} from "@/features/products/constants/inventory-group-id";
import z from "zod";

const INVENTORY_SLOT_IDS = new Set<string>([
  PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY,
  PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY_INLINE,
]);

const schema = z.fromJSONSchema(InventoryPayloadSchema) as z.ZodType<
  InventoryPayload,
  InventoryPayload
>;

export type InventorySlotDescriptor = {
  groupId: string;
  context: InventoryCreateContext;
  payload?: InventoryPayload;
};

export function isInventoryValidateResult(
  result: SlotValidateResult,
): result is SlotValidateResult & { value: InventoryPayload } {
  return (
    result.valid &&
    INVENTORY_SLOT_IDS.has(result.slotId) &&
    schema.safeParse(result.value).success
  );
}

export function buildInventorySlotDescriptors(
  values: ProductFormValue,
  byGroup?: ReadonlyMap<string, InventoryPayload>,
): InventorySlotDescriptor[] {

  if ((values.variationTypes ?? []).length === 0) {
    const snapshot = byGroup?.get(STANDALONE_INVENTORY_GROUP_ID);
    const context: InventoryCreateContext = { sku: values.product.standaloneVariant.sku ?? "" }
    return [
      {
        groupId: STANDALONE_INVENTORY_GROUP_ID,
        context: context,
        ...(snapshot ? { payload: snapshot } : {}),
      }
    ];
  }

  return (values.product.variants ?? [])
    .filter((variant) => variant.variations.length > 0)
    .map((variant) => {
      const groupId = inventoryGroupId(variant.matrixKey);
      const snapshot = byGroup?.get(groupId);
      const context: InventoryCreateContext = { sku: variant.sku ?? "" };
      return {
        groupId,
        context,
        ...(snapshot ? { payload: snapshot } : {}),
      };
    });
}

export function projectInventoryLines(
  descriptors: InventorySlotDescriptor[],
): CreateSellableProductInventoryLine[] {
  const lines: CreateSellableProductInventoryLine[] = [];

  for (const descriptor of descriptors) {
    if (!descriptor.payload) continue;

    for (const location of descriptor.payload.locations) {
      lines.push({
        sku: descriptor.payload.sku,
        locationId: location.locationId,
        initialQuantity: location.initialQuantity,
        safetyStock: location.safetyStock,
      });
    }
  }

  return lines;
}
