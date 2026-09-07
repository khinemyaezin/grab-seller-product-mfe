import {
  PRODUCT_EXTENSION_SLOTS,
  type InventoryCreateContext,
  type InventoryPayload,
} from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@khinemyaezin/seller-ui/components/field";
import { useSlotDraft } from "../context/extension-sync-store";
import { INVENTORY_DOMAIN } from "../hooks/use-inventory-slots-sync";

export type InventoryLineSlotProps = {
  groupId: string
  context: InventoryCreateContext
};

export function InventoryLineFullSlot({ groupId, context }: InventoryLineSlotProps) {
  const { initialValue, onChange } = useSlotDraft<InventoryPayload>(INVENTORY_DOMAIN, groupId);

  return (
    <FieldSet>
      <FieldLegend>Inventory</FieldLegend>
      <FieldDescription>
        Set initial stock and safety stock for each location.
      </FieldDescription>

      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY}
        fallback={(<p>Unable to load inventory</p>)}
        props={{
          groupId,
          context,
          initialValue,
          onChange,
        }}
      />
    </FieldSet>
  );
}
