import {
  PRODUCT_EXTENSION_SLOTS,
  type PricingCreateContext,
  type PricingPayload,
} from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@khinemyaezin/seller-ui/components/field";
import { useSlotDraft } from "../context/extension-sync-store";
import { PRICING_DOMAIN } from "../hooks/use-pricing-slots-sync";

export type PricingLineSlotProps = {
  groupId: string
  context: PricingCreateContext
};

export function PricingLineFullSlot({ groupId, context }: PricingLineSlotProps) {
  const { initialValue, onChange } = useSlotDraft<PricingPayload>(PRICING_DOMAIN, groupId);

  return (
    <FieldSet>
      <FieldLegend>Pricing</FieldLegend>
      <FieldDescription>
        Set the price buyers will pay for this product.
      </FieldDescription>

      <div className="max-w-sm">
        <ExtensionSlot
          name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING}
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
