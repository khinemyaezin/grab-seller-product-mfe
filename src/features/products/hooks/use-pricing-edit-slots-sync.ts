import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  PricingEditPayload,
} from "@khinemyaezin/seller-contracts";
import type { ProductFormValue, UpdateSellableProductRequest } from "@/features/products/types";
import {
  collectDomainPayloads,
  useUpdateExtensionSyncStore,
} from "@/features/products/context/extension-sync-store";
import {
  buildPricingEditSlotDescriptors,
  isPricingEditValidateResult,
  projectPricingEditLines,
  type PricingEditSlotDescriptor,
} from "@/features/products/adapters/pricing-edit-slots";

export const PRICING_EDIT_DOMAIN = "pricing-edit";

export function usePricingEditSlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useUpdateExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): PricingEditSlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<PricingEditPayload>(snapshot, PRICING_EDIT_DOMAIN);
    return buildPricingEditSlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

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
    const live = new Set(describe().map((descriptor) => descriptor.groupId));
    prune(PRICING_EDIT_DOMAIN, live);
  }, [variants, variationTypes, describe, prune]);

  useEffect(() => {
    return () => {
      clearDomain(PRICING_EDIT_DOMAIN);
    };
  }, [clearDomain]);
}
