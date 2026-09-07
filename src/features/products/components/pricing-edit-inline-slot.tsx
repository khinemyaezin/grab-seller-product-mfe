import {
  PRODUCT_EXTENSION_SLOTS,
  type PricingEditContext,
  type PricingEditPayload,
} from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import { useSlotDraft } from "../context/extension-sync-store";
import { PRICING_EDIT_DOMAIN } from "../hooks/use-pricing-edit-slots-sync";

export type PricingEditInlineSlotProps = {
  groupId: string
  context: PricingEditContext
};

export function PricingEditInlineSlot({ groupId, context }: PricingEditInlineSlotProps) {
  const { initialValue, onChange } = useSlotDraft<PricingEditPayload>(PRICING_EDIT_DOMAIN, groupId);

  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.EDIT_PRICING_INLINE}
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
