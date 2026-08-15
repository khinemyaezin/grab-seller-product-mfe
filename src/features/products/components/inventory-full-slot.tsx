import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@khinemyaezin/seller-ui/components/field";

export type InventoryLineSlotProps = {
  groupId: string
};

export function InventoryLineFullSlot({ groupId }: InventoryLineSlotProps) {
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
        }}
      />
    </FieldSet>
  );
}
