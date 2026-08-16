import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { usePlatform } from "@khinemyaezin/seller-ui";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  EventEnvelope,
  InventoryPayload,
  StateEventPayloads,
} from "@khinemyaezin/seller-contracts";
import type { CreateSellableProductRequest, ProductFormValue } from "@/features/products/types";
import {
  collectDomainPayloads,
  useExtensionSyncStore,
} from "@/features/products/context/extension-sync-store";
import {
  buildInventorySlotDescriptors,
  isInventoryValidateResult,
  projectInventoryLines,
  type InventorySlotDescriptor,
} from "@/features/products/adapters/inventory-slots";

export const INVENTORY_DOMAIN = "inventory";

const INVENTORY_TOPICS: (keyof StateEventPayloads)[] = [
  "extension:inventory:new:hydrate:v1",
  "extension:inventory:new:updated:v1",
];

export function useInventorySlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const standaloneSku = useWatch({ control, name: "product.standaloneVariant.sku", defaultValue: "" });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): InventorySlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<InventoryPayload>(snapshot, INVENTORY_DOMAIN);
    return buildInventorySlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

  const hydrate = useCallback((descriptor: InventorySlotDescriptor) => {
    if (!events) return;

    events.setState("extension:inventory:new:hydrate:v1", {
      producerId: "host",
      groupId: descriptor.groupId,
      payload: descriptor.context,
    });
  }, [events]);

  const contract = useMemo<DomainSubmitContract<Pick<CreateSellableProductRequest, "inventoryLines">>>(() => ({
    sync: (results: SlotValidateResult[]) => {
      for (const result of results) {
        if (!isInventoryValidateResult(result)) continue;

        setPayload({
          domain: INVENTORY_DOMAIN,
          groupId: result.groupId,
          payload: result.value,
        });
      }
    },
    project: (): Pick<CreateSellableProductRequest, "inventoryLines"> => ({
      inventoryLines: projectInventoryLines(describe()),
    }),
    getErrors: (results: SlotValidateResult[]) => {
      const groupIds = new Set(describe().map((d) => d.groupId));
      return results.filter((result) => !result.valid && groupIds.has(result.groupId));
    }
  }), [describe, setPayload]);

  useEffect(() => {
    registerDomain(INVENTORY_DOMAIN, contract);
    return () => registerDomain(INVENTORY_DOMAIN, undefined);
  }, [registerDomain, contract]);

  useEffect(() => {
    const descriptors: InventorySlotDescriptor[] = describe();
    const live = new Set(descriptors.map((descriptor) => descriptor.groupId));

    for (const groupId of prune(INVENTORY_DOMAIN, live)) {
      events?.clear({ groupId });
    }

    for (const descriptor of descriptors) {
      hydrate(descriptor);
    }
  }, [variants, standaloneSku, variationTypes, events, describe, hydrate, prune]);

  useEffect(() => {
    if (!events) return;

    const unsubscribe = events.subscribe("extension:inventory:new:updated:v1", (event: EventEnvelope<InventoryPayload>) => {
      setPayload({
        domain: INVENTORY_DOMAIN,
        groupId: event.groupId,
        payload: event.payload,
      });
    });

    return () => unsubscribe();
  }, [events, setPayload]);

  useEffect(() => {
    if (!events) return;

    return () => {
      for (const topic of INVENTORY_TOPICS) {
        events.clear({ topic });
      }
      clearDomain(INVENTORY_DOMAIN);
    };
  }, [events, clearDomain]);
}
