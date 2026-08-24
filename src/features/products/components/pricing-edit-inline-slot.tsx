import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";

export type PricingEditInlineSlotProps = {
  groupId: string
};

export function PricingEditInlineSlot({ groupId }: PricingEditInlineSlotProps) {
  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.EDIT_PRICING_INLINE}
        props={{
          groupId,
        }}
      />
    </div>
  );
}
