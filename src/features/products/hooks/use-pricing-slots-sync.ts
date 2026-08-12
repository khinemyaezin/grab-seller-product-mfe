import { useCallback, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { usePlatform } from "@khinemyaezin/seller-ui";
import type {
  EventEnvelope,
  PricingPayload,
  StateEventPayloads,
} from "@khinemyaezin/seller-contracts";
import type { ProductFormValue } from "@/features/products/types";
import {
  buildPricingSlotDescriptors,
  projectPricingLines,
  toHydratePayload,
  type PricingSlotDescriptor,
} from "@/features/products/adapters/pricing-slots";

const PRICING_TOPICS: (keyof StateEventPayloads)[] = [
  "extension:pricing:hydrate:v1",
  "extension:pricing:updated:v1",
];

export function usePricingSlotsSync() {
  const { control, getValues, setValue } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;

  const valuesRef = useRef(new Map<string, PricingPayload>());
  const hydratedRef = useRef(new Map<string, Partial<PricingPayload>>());

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const standaloneSku = useWatch({ control, name: "product.standaloneVariant.sku", defaultValue: "" });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback(
    () => buildPricingSlotDescriptors(getValues(), valuesRef.current),
    [getValues],
  );

  const hydrate = useCallback((descriptor: PricingSlotDescriptor) => {
    if (!events) return;

    const payload = toHydratePayload(descriptor);
    hydratedRef.current.set(descriptor.instanceId, payload);

    events.setState("extension:pricing:hydrate:v1", {
      producerId: "host",
      instanceId: descriptor.instanceId,
      payload,
    });
  }, [events]);

  const project = useCallback((descriptors: PricingSlotDescriptor[]) => {
    const lines = projectPricingLines(descriptors);
    console.log(descriptors, lines)
    setValue("pricingLines", lines, { shouldDirty: true });
  }, []);

  useEffect(() => {
    const descriptors = describe();
    const live = new Set(descriptors.map((descriptor) => descriptor.instanceId));

    for (const instanceId of [...valuesRef.current.keys()]) {
      if (live.has(instanceId)) continue;

      valuesRef.current.delete(instanceId);
      hydratedRef.current.delete(instanceId);
      events?.clear({ instanceId });
    }

    for (const descriptor of descriptors) {
      if(!descriptor.sku) continue;
      hydrate(descriptor);
    }

    project(descriptors);
  }, [variants, standaloneSku, variationTypes, events, describe, hydrate, project]);

  useEffect(() => {
    if (!events) return;

    const unsubscribe = events.subscribe("extension:pricing:updated:v1", (event: EventEnvelope<PricingPayload>) => {
      valuesRef.current.set(event.instanceId, event.payload);

      const descriptors = describe();
      const target = descriptors.find(
        (descriptor) => descriptor.instanceId === event.instanceId,
      );
      if (!target) return;

      hydrate(target);
      project(descriptors);
    },
    );

    return () => unsubscribe();
  }, [events, describe, hydrate, project]);

  useEffect(() => {
    if (!events) return;

    return () => {
      for (const topic of PRICING_TOPICS) {
        events.clear({ topic });
      }
      hydratedRef.current.clear();
    };
  }, [events]);
}
