import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { usePlatform } from "@khinemyaezin/seller-ui";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  EventEnvelope,
  PricingPayload,
  StateEventPayloads,
} from "@khinemyaezin/seller-contracts";
import type { CreateSellableProductRequest, ProductFormValue } from "@/features/products/types";
import {
  collectDomainPayloads,
  useCreateExtensionSyncStore,
} from "@/features/products/context/extension-sync-store";
import {
  buildPricingSlotDescriptors,
  isPricingValidateResult,
  projectPricingLines,
  type PricingSlotDescriptor,
} from "@/features/products/adapters/pricing-slots";

export const PRICING_DOMAIN = "pricing";

const PRICING_TOPICS: (keyof StateEventPayloads)[] = [
  "extension:pricing:new:hydrate:v1",
  "extension:pricing:new:updated:v1",
];

export function usePricingSlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useCreateExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const standaloneSku = useWatch({ control, name: "product.standaloneVariant.sku", defaultValue: "" });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): PricingSlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<PricingPayload>(snapshot, PRICING_DOMAIN);
    return buildPricingSlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

  const hydrate = useCallback((descriptor: PricingSlotDescriptor) => {
    if (!events) return;

    events.setState("extension:pricing:new:hydrate:v1", {
      producerId: "host",
      groupId: descriptor.groupId,
      payload: descriptor.context,
    });
  }, [events]);

  const contract = useMemo<DomainSubmitContract<Pick<CreateSellableProductRequest, "pricingLines">>>(() => ({
    sync: (results: SlotValidateResult[]) => {
      for (const result of results) {
        if (!isPricingValidateResult(result)) continue;

        setPayload({
          domain: PRICING_DOMAIN,
          groupId: result.groupId,
          payload: result.value,
        });
      }
    },
    project: (): Pick<CreateSellableProductRequest, "pricingLines"> => ({
      pricingLines: projectPricingLines(describe()),
    }),
    getErrors: (results: SlotValidateResult[]) => {
      const groupIds = new Set(describe().map((d) => d.groupId));
      return results.filter(result => !result.valid && groupIds.has(result.groupId));
    }
  }), [describe, setPayload]);

  useEffect(() => {
    const descriptors: PricingSlotDescriptor[] = describe();
    const live = new Set(descriptors.map((descriptor) => descriptor.groupId));

    for (const groupId of prune(PRICING_DOMAIN, live)) {
      events?.clear({ groupId });
    }

    for (const descriptor of descriptors) {
      hydrate(descriptor);
    }
  }, [variants, standaloneSku, variationTypes, events, describe, hydrate, prune]);

  useEffect(() => {
    registerDomain(PRICING_DOMAIN, contract);
    return () => registerDomain(PRICING_DOMAIN, undefined);
  }, [registerDomain, contract]);

  useEffect(() => {
    if (!events) return;

    const unsubscribe = events.subscribe("extension:pricing:new:updated:v1", (event: EventEnvelope<PricingPayload>) => {
      setPayload({
        domain: PRICING_DOMAIN,
        groupId: event.groupId,
        payload: event.payload,
      });
    },
    );

    return () => unsubscribe();
  }, [events, setPayload]);

  useEffect(() => {
    if (!events) return;

    return () => {
      for (const topic of PRICING_TOPICS) {
        events.clear({ topic });
      }
      clearDomain(PRICING_DOMAIN);
    };
  }, [events, clearDomain]);
}
