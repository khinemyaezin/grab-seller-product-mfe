import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  InventoryEditPayload,
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

export function useInventoryEditSlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useUpdateExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): InventoryEditSlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<InventoryEditPayload>(snapshot, INVENTORY_EDIT_DOMAIN);
    return buildInventoryEditSlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

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
    const live = new Set(describe().map((descriptor) => descriptor.groupId));
    prune(INVENTORY_EDIT_DOMAIN, live);
  }, [variants, variationTypes, describe, prune]);

  useEffect(() => {
    return () => {
      clearDomain(INVENTORY_EDIT_DOMAIN);
    };
  }, [clearDomain]);
}
