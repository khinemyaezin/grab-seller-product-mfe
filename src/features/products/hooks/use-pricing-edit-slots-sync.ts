import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { usePlatform } from "@khinemyaezin/seller-ui";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  EventEnvelope,
  PricingEditPayload,
  StateEventPayloads,
} from "@khinemyaezin/seller-contracts";
import type { ProductFormValue, UpdateSellableProductRequest } from "@/features/products/types";
import {
  collectDomainPayloads,
  useExtensionSyncStore,
} from "@/features/products/context/extension-sync-store";
import {
  buildPricingEditSlotDescriptors,
  isPricingEditValidateResult,
  projectPricingEditLines,
  type PricingEditSlotDescriptor,
} from "@/features/products/adapters/pricing-edit-slots";

export const PRICING_EDIT_DOMAIN = "pricing-edit";

const PRICING_EDIT_TOPICS: (keyof StateEventPayloads)[] = [
  "extension:pricing:edit:hydrate:v1",
  "extension:pricing:edit:updated:v1",
];

export function usePricingEditSlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const standaloneSku = useWatch({ control, name: "product.standaloneVariant.sku", defaultValue: "" });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): PricingEditSlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<PricingEditPayload>(snapshot, PRICING_EDIT_DOMAIN);
    return buildPricingEditSlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

  const hydrate = useCallback((descriptor: PricingEditSlotDescriptor) => {
    if (!events) return;

    events.setState("extension:pricing:edit:hydrate:v1", {
      producerId: "host",
      groupId: descriptor.groupId,
      payload: descriptor.context,
    });
  }, [events]);

  const contract = useMemo<DomainSubmitContract<Pick<UpdateSellableProductRequest, "pricingLines">>>(() => ({
    sync: (results: SlotValidateResult[]) => {
      for (const result of results) {
        if (!isPricingEditValidateResult(result)) continue;

        setPayload({
          domain: PRICING_EDIT_DOMAIN,
          groupId: result.groupId,
          payload: result.value,
        });
      }
    },
    project: (): Pick<UpdateSellableProductRequest, "pricingLines"> => ({
      pricingLines: projectPricingEditLines(describe()),
    }),
    getErrors: (results: SlotValidateResult[]) => {
      const groupIds = new Set(describe().map((d) => d.groupId));
      return results.filter(result => !result.valid && groupIds.has(result.groupId));
    }
  }), [describe, setPayload]);

  useEffect(() => {
    registerDomain(PRICING_EDIT_DOMAIN, contract);
    return () => registerDomain(PRICING_EDIT_DOMAIN, undefined);
  }, [registerDomain, contract]);

  useEffect(() => {
    const descriptors: PricingEditSlotDescriptor[] = describe();
    const live = new Set(descriptors.map((descriptor) => descriptor.groupId));

    for (const groupId of prune(PRICING_EDIT_DOMAIN, live)) {
      events?.clear({ groupId });
    }

    for (const descriptor of descriptors) {
      hydrate(descriptor);
    }
  }, [variants, standaloneSku, variationTypes, events, describe, hydrate, prune]);

  useEffect(() => {
    if (!events) return;

    const unsubscribe = events.subscribe("extension:pricing:edit:updated:v1", (event: EventEnvelope<PricingEditPayload>) => {
      setPayload({
        domain: PRICING_EDIT_DOMAIN,
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
      for (const topic of PRICING_EDIT_TOPICS) {
        events.clear({ topic });
      }
      clearDomain(PRICING_EDIT_DOMAIN);
    };
  }, [events, clearDomain]);
}
