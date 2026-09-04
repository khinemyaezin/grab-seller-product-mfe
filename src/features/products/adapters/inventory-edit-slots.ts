import {
  InventoryEditContext,
  InventoryEditPayloadSchema,
  PRODUCT_EXTENSION_SLOTS,
  type InventoryEditPayload,
} from "@khinemyaezin/seller-contracts";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  ProductFormValue,
  UpdateSellableProductInventoryLine,
} from "@/features/products/types";
import {
  inventoryEditGroupId,
  STANDALONE_INVENTORY_EDIT_GROUP_ID,
} from "@/features/products/constants/inventory-group-id";
import z from "zod";

const INVENTORY_EDIT_SLOT_IDS = new Set<string>([
  PRODUCT_EXTENSION_SLOTS.EDIT_INVENTORY,
  PRODUCT_EXTENSION_SLOTS.EDIT_INVENTORY_INLINE,
]);

const schema = z.fromJSONSchema(InventoryEditPayloadSchema) as z.ZodType<
  InventoryEditPayload,
  InventoryEditPayload
>;

export type InventoryEditSlotDescriptor = {
  groupId: string;
  context: InventoryEditContext & { sku: string };
  payload?: InventoryEditPayload;
};

export function isInventoryEditValidateResult(
  result: SlotValidateResult,
): result is SlotValidateResult & { value: InventoryEditPayload } {
  return (
    result.valid &&
    INVENTORY_EDIT_SLOT_IDS.has(result.slotId) &&
    schema.safeParse(result.value).success
  );
}

export function buildInventoryEditSlotDescriptors(
  values: ProductFormValue,
  byGroup?: ReadonlyMap<string, InventoryEditPayload>,
): InventoryEditSlotDescriptor[] {
  if ((values.variationTypes ?? []).length === 0) {
    const snapshot = byGroup?.get(STANDALONE_INVENTORY_EDIT_GROUP_ID);
    const context: InventoryEditContext & { sku: string } = {
      sku: values.product.standaloneVariant.sku ?? "",
      variantId: values.product.standaloneVariant.id ?? "",
    };
    return [
      {
        groupId: STANDALONE_INVENTORY_EDIT_GROUP_ID,
        context,
        ...(snapshot ? { payload: snapshot } : {}),
      },
    ];
  }

  return (values.product.variants ?? [])
    .filter((variant) => variant.variations.length > 0)
    .map((variant) => {
      const groupId = inventoryEditGroupId(variant.matrixKey);
      const snapshot = byGroup?.get(groupId);
      const context: InventoryEditContext & { sku: string } = {
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

export function projectInventoryEditLines(
  descriptors: InventoryEditSlotDescriptor[],
): UpdateSellableProductInventoryLine[] {
  const lines: UpdateSellableProductInventoryLine[] = [];

  for (const descriptor of descriptors) {
    if (!descriptor.payload) continue;

    const sku = descriptor.payload.sku;

    for (const op of descriptor.payload.ops) {
      if (op.op === "CREATE") {
        lines.push({
          sku,
          locationId: op.locationId,
          op: "CREATE",
          create: op.create,
        });
        continue;
      }

      lines.push({
        sku,
        inventoryItemId: op.inventoryItemId,
        op: "ADJUST",
        adjust: op.adjust,
      });
    }
  }

  return lines;
}
