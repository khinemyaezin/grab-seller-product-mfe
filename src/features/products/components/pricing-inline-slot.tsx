import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";
import {
} from "@khinemyaezin/seller-contracts";
import { usePlatform } from "@khinemyaezin/seller-ui";
import { usePricingLinesSkuSync } from "../hooks/use-pricing-lines-sku-sync";
import { PricingLineFormValue } from "../types";
import { useEffect } from "react";

export type PricingLineSlotProps = {
  instanceId: string,
  skuFieldName: string,
  pricingLineNum: number
};

export function PricingInlineSlot({ instanceId, skuFieldName, pricingLineNum }: PricingLineSlotProps) {
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
    <div className="max-w-sm">
      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE}
        props={{
          instanceId,
          ...{},
        }}
      />
    </div>
  );
}


