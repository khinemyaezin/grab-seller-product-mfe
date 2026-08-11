import { useEffect, useMemo, useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { usePlatform } from "@khinemyaezin/seller-ui";
import { PricingLineFormValue, ProductFormValue } from "../types";
import { pricingInstanceId, STANDALONE_PRICING_INSTANCE_ID } from "../constants/pricing-instance-id";
import { EventEnvelope, PricingPayload } from "@khinemyaezin/seller-contracts";

type PricingSlotDescriptor = {
  instanceId: string;
  lineIndex: number;
  sku: string;
};

function findExistingLine(
  lines: PricingLineFormValue[],
  slot: PricingSlotDescriptor,
  prevSku?: string,
): PricingLineFormValue | undefined {
  return (
    lines.find((line) => line.sku === slot.sku)
    ?? lines.find((line) => line.sku === prevSku)
    ?? lines[slot.lineIndex]
  );
}

export function usePricingSlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;
  const { update, append } = useFieldArray({ control, name: "pricingLines" });

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const standaloneSku = useWatch({ control, name: "product.standaloneVariant.sku", defaultValue: "" });

  const slots = useMemo<PricingSlotDescriptor[]>(() => {
    const descriptors: PricingSlotDescriptor[] = [
      {
        instanceId: STANDALONE_PRICING_INSTANCE_ID,
        lineIndex: 0,
        sku: standaloneSku ?? ""
      },
    ];
    (variants ?? []).forEach((variant, index) => {
      descriptors.push({
        instanceId: pricingInstanceId(index),
        lineIndex: index,
        sku: variant.sku ?? "",
      });
    });
    return descriptors;
  }, [variants, standaloneSku]);

  const lastHydratedSkuRef = useRef(new Map<string, string>());

  useEffect(() => {
    if (!events) return;

    for (const slot of slots) {
      const lastHydratedSku = lastHydratedSkuRef.current.get(slot.instanceId);
      if (lastHydratedSku === slot.sku) continue;
      lastHydratedSkuRef.current.set(slot.instanceId, slot.sku);
      if (!slot.sku) continue;

      const lines = getValues("pricingLines") ?? [];

      const renamed = lastHydratedSku && lastHydratedSku !== slot.sku
        ? lines.find((line) => line?.sku === lastHydratedSku)
        : undefined;
      if (renamed) {
        const lineIndex = lines.indexOf(renamed);
        if (lineIndex >= 0) {
          update(lineIndex, { ...renamed, sku: slot.sku });
        }
      }

      const existing = findExistingLine(lines, slot, lastHydratedSku);
      const payload = existing ? { ...existing, sku: slot.sku } : { sku: slot.sku };

      events.setState("extension:pricing:hydrate:v1", {
        producerId: "host",
        instanceId: slot.instanceId,
        payload,
      });
    }
  }, [slots, events, getValues]);

  useEffect(() => {
    if (!events) return;

    const unsub = events.subscribe("extension:pricing:updated:v1", (event: EventEnvelope<PricingPayload>) => {
      if (!event.payload.sku) return;

      const current = getValues("pricingLines") ?? [];
      const next = {
        sku: event.payload.sku,
        currencyCode: event.payload.currencyCode,
        amount: event.payload.amount
      };
      const index = current.findIndex(line => line.sku == next.sku);

      if (index >= 0) {
        update(index, next);
      } else if (next.amount === 0) {
        return;
      } else {
        append(next);
      }

      events.setState("extension:pricing:hydrate:v1", {
        producerId: "host",
        instanceId: event.instanceId,
        payload: next,
      });
    },
    );

    return () => unsub();
  }, [events, getValues, append, update]);

}
