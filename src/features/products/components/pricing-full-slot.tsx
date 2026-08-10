import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@khinemyaezin/seller-ui/components/field";
import {
} from "@khinemyaezin/seller-contracts";
import { usePlatform } from "@khinemyaezin/seller-ui";
import { useEffect } from "react";
import { usePricingLinesSkuSync } from "../hooks/use-pricing-lines-sku-sync";

export type PricingLineSlotProps = {
  instanceId: string,
  skuFieldName: string,
  pricingLineNum: number
};

export function PricingLineFullSlot({ instanceId, skuFieldName, pricingLineNum }: PricingLineSlotProps) {
  const platform = usePlatform();
  const events = platform?.events;
  const { payload } = usePricingLinesSkuSync({ skuFiledName: skuFieldName, pricingLineNumber: pricingLineNum });

  useEffect(() => {
    if (!events) return;
    if (!payload) return;

    events.setState("extension:pricing:hydrate:v1", {
      producerId: "host",
      instanceId: instanceId,
      payload: payload,
    });
  }, [payload, instanceId, skuFieldName, pricingLineNum]);

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
            ...{},
          }}
        />
      </div>
    </FieldSet>
  );
}
