import {
  PRODUCT_EXTENSION_SLOTS,
  type PricingCreateContext,
  type PricingPayload,
} from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import { useSlotDraft } from "../context/extension-sync-store";
import { PRICING_DOMAIN } from "../hooks/use-pricing-slots-sync";

export type PricingLineSlotProps = {
  groupId: string
  context: PricingCreateContext
};

export function PricingInlineSlot({ groupId, context }: PricingLineSlotProps) {
  const { initialValue, onChange } = useSlotDraft<PricingPayload>(PRICING_DOMAIN, groupId);

  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE}
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
