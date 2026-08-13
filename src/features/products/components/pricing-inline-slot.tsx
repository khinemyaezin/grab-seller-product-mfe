import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";

export type PricingLineSlotProps = {
  groupId: string
};

export function PricingInlineSlot({ groupId }: PricingLineSlotProps) {
  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE}
        props={{
          groupId,
        }}
      />
    </div>
  );
}
