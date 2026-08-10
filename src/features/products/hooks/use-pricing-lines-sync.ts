import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { PricingLineFormValue, ProductFormValue } from "@/features/products/types";
import { usePlatform } from "@khinemyaezin/seller-ui";
import { EventEnvelope, PricingPayload } from "@khinemyaezin/seller-contracts";

function toFormLine(
  payload: PricingPayload
): PricingLineFormValue {
  return {
    sku: payload.sku,
    currencyCode: payload.currencyCode,
    amount: payload.amount
  };
}

export function usePricingLinesSync() {
  const { control, getValues, setValue } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;
  const { append, update } = useFieldArray({ control, name: "pricingLines" });

  useEffect(() => {
    if (!events) return;

    const unsub = events.subscribe("extension:pricing:updated:v1", (event: EventEnvelope<PricingPayload>) => {
      if (!event.payload.sku) return;

      const current = getValues("pricingLines") ?? [];
      const index = current.findIndex(line => line.sku == event.payload.sku);
      const next = toFormLine(event.payload);

      if (index >= 0) {
        update(index, next)
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
  }, [events, getValues, setValue, append, update]);
}