import {
  PRODUCT_EXTENSION_SLOTS,
  type InventoryCreateContext,
  type InventoryEditContext,
  type InventoryEditPayload,
  type InventoryPayload,
} from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import { useSlotDraft } from "../context/extension-sync-store";
import { INVENTORY_DOMAIN } from "../hooks/use-inventory-slots-sync";
import { INVENTORY_EDIT_DOMAIN } from "../hooks/use-inventory-edit-slots-sync";

export type InventoryLineSlotProps = {
  groupId: string
  context: InventoryCreateContext | InventoryEditContext
  slotName?: typeof PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY_INLINE | typeof PRODUCT_EXTENSION_SLOTS.EDIT_INVENTORY_INLINE
};

export function InventoryInlineSlot({
  groupId,
  context,
  slotName = PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY_INLINE,
}: InventoryLineSlotProps) {
  const domain = slotName === PRODUCT_EXTENSION_SLOTS.EDIT_INVENTORY_INLINE
    ? INVENTORY_EDIT_DOMAIN
    : INVENTORY_DOMAIN;
  const { initialValue, onChange } = useSlotDraft<InventoryPayload | InventoryEditPayload>(
    domain,
    groupId,
  );

  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={slotName}
        props={{
          groupId,
          context,
          initialValue,
          onChange,
        }}
      />
    </div>
  );
}
