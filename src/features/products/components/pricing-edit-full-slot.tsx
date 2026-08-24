import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@khinemyaezin/seller-ui/components/field";

export type PricingLineSlotProps = {
  groupId: string
};

export function PricingLineEditFullSlot({ groupId }: PricingLineSlotProps) {
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
          }}
        />
      </div>
    </FieldSet>
  );
}
