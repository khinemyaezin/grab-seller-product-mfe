import {
  PRODUCT_EXTENSION_SLOTS,
  type PricingEditContext,
  type PricingEditPayload,
} from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@khinemyaezin/seller-ui/components/field";
import { useSlotDraft } from "../context/extension-sync-store";
import { PRICING_EDIT_DOMAIN } from "../hooks/use-pricing-edit-slots-sync";

export type PricingLineSlotProps = {
  groupId: string
  context: PricingEditContext
};

export function PricingLineEditFullSlot({ groupId, context }: PricingLineSlotProps) {
  const { initialValue, onChange } = useSlotDraft<PricingEditPayload>(PRICING_EDIT_DOMAIN, groupId);

  return (
    <FieldSet>
      <FieldLegend>Pricing</FieldLegend>
      <FieldDescription>
        Set the price buyers will pay for this product.
      </FieldDescription>

      <div className="max-w-sm">
        <ExtensionSlot
          name={PRODUCT_EXTENSION_SLOTS.EDIT_PRICING}
          props={{
            groupId,
            context,
            initialValue,
            onChange,
          }}
        />
      </div>
    </FieldSet>
  );
}
