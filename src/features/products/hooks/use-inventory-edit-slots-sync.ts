import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { usePlatform } from "@khinemyaezin/seller-ui";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  EventEnvelope,
  InventoryEditPayload,
  StateEventPayloads,
} from "@khinemyaezin/seller-contracts";
import type { ProductFormValue, UpdateSellableProductRequest } from "@/features/products/types";
import {
  collectDomainPayloads,
  useUpdateExtensionSyncStore,
} from "@/features/products/context/extension-sync-store";
import {
  buildInventoryEditSlotDescriptors,
  isInventoryEditValidateResult,
  projectInventoryEditLines,
  type InventoryEditSlotDescriptor,
} from "@/features/products/adapters/inventory-edit-slots";

export const INVENTORY_EDIT_DOMAIN = "inventory-edit";

const INVENTORY_EDIT_TOPICS: (keyof StateEventPayloads)[] = [
  "extension:inventory:edit:hydrate:v1",
  "extension:inventory:edit:updated:v1",
];

export function useInventoryEditSlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useUpdateExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const standaloneSku = useWatch({ control, name: "product.standaloneVariant.sku", defaultValue: "" });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): InventoryEditSlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<InventoryEditPayload>(snapshot, INVENTORY_EDIT_DOMAIN);
    return buildInventoryEditSlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

  const hydrate = useCallback((descriptor: InventoryEditSlotDescriptor) => {
    if (!events) return;

    events.setState("extension:inventory:edit:hydrate:v1", {
      producerId: "host",
      groupId: descriptor.groupId,
      payload: descriptor.context,
    });
  }, [events]);

  const contract = useMemo<DomainSubmitContract<Pick<UpdateSellableProductRequest, "inventoryLines">>>(() => ({
    sync: (results: SlotValidateResult[]) => {
      for (const result of results) {
        if (!isInventoryEditValidateResult(result)) continue;

        setPayload({
          domain: INVENTORY_EDIT_DOMAIN,
          groupId: result.groupId,
          payload: result.value,
        });
      }
    },
    project: (): Pick<UpdateSellableProductRequest, "inventoryLines"> => ({
      inventoryLines: projectInventoryEditLines(describe()),
    }),
    getErrors: (results: SlotValidateResult[]) => {
      const groupIds = new Set(describe().map((d) => d.groupId));
      return results.filter((result) => !result.valid && groupIds.has(result.groupId));
    }
  }), [describe, setPayload]);

  useEffect(() => {
    registerDomain(INVENTORY_EDIT_DOMAIN, contract);
    return () => registerDomain(INVENTORY_EDIT_DOMAIN, undefined);
  }, [registerDomain, contract]);

  useEffect(() => {
    const descriptors: InventoryEditSlotDescriptor[] = describe();
    const live = new Set(descriptors.map((descriptor) => descriptor.groupId));

    for (const groupId of prune(INVENTORY_EDIT_DOMAIN, live)) {
      events?.clear({ groupId });
    }

    for (const descriptor of descriptors) {
      hydrate(descriptor);
    }
  }, [variants, standaloneSku, variationTypes, events, describe, hydrate, prune]);

  useEffect(() => {
    if (!events) return;

    const unsubscribe = events.subscribe("extension:inventory:edit:updated:v1", (event: EventEnvelope<InventoryEditPayload>) => {
      setPayload({
        domain: INVENTORY_EDIT_DOMAIN,
        groupId: event.groupId,
        payload: event.payload,
      });
    });

    return () => unsubscribe();
  }, [events, setPayload]);

  useEffect(() => {
    if (!events) return;

    return () => {
      for (const topic of INVENTORY_EDIT_TOPICS) {
        events.clear({ topic });
      }
      clearDomain(INVENTORY_EDIT_DOMAIN);
    };
  }, [events, clearDomain]);
}
