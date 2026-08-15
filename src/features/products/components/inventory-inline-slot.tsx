import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";

export type InventoryLineSlotProps = {
  groupId: string
};

export function InventoryInlineSlot({ groupId }: InventoryLineSlotProps) {
  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY_INLINE}
        props={{
          groupId,
        }}
      />
    </div>
  );
}
