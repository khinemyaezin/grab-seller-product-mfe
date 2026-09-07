import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  InventoryPayload,
} from "@khinemyaezin/seller-contracts";
import type { CreateSellableProductRequest, ProductFormValue } from "@/features/products/types";
import {
  collectDomainPayloads,
  useCreateExtensionSyncStore,
} from "@/features/products/context/extension-sync-store";
import {
  buildInventorySlotDescriptors,
  isInventoryValidateResult,
  projectInventoryLines,
  type InventorySlotDescriptor,
} from "@/features/products/adapters/inventory-slots";

export const INVENTORY_DOMAIN = "inventory";

export function useInventorySlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useCreateExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): InventorySlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<InventoryPayload>(snapshot, INVENTORY_DOMAIN);
    return buildInventorySlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

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
    const live = new Set(describe().map((descriptor) => descriptor.groupId));
    prune(INVENTORY_DOMAIN, live);
  }, [variants, variationTypes, describe, prune]);

  useEffect(() => {
    return () => {
      clearDomain(INVENTORY_DOMAIN);
    };
  }, [clearDomain]);
}
