import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";

export type InventoryLineSlotProps = {
  groupId: string
  slotName?: typeof PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY_INLINE | typeof PRODUCT_EXTENSION_SLOTS.EDIT_INVENTORY_INLINE
};

export function InventoryInlineSlot({
  groupId,
  slotName = PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY_INLINE,
}: InventoryLineSlotProps) {
  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={slotName}
        props={{
          groupId,
        }}
      />
    </div>
  );
}
