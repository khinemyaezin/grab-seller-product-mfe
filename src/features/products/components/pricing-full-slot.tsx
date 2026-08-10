import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@khinemyaezin/seller-ui/components/field";

export type PricingLineSlotProps = {
  instanceId: string
};

export function PricingLineFullSlot({ instanceId }: PricingLineSlotProps) {
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
            instanceId,
          }}
        />
      </div>
    </FieldSet>
  );
}
