import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type {
  DomainSubmitContract,
  PricingPayload,
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

export function usePricingSlotsSync() {
  const { control, getValues } = useFormContext<ProductFormValue>();
  const { registerDomain, getSnapshot, setPayload, prune, clearDomain } =
    useCreateExtensionSyncStore();

  const variants = useWatch({ control, name: "product.variants", defaultValue: [] });
  const variationTypes = useWatch({ control, name: "variationTypes", defaultValue: [] });

  const describe = useCallback((): PricingSlotDescriptor[] => {
    const form = getValues();
    const snapshot = getSnapshot();
    const payload = collectDomainPayloads<PricingPayload>(snapshot, PRICING_DOMAIN);
    return buildPricingSlotDescriptors(form, payload);
  }, [getValues, getSnapshot]);

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
    registerDomain(PRICING_DOMAIN, contract);
    return () => registerDomain(PRICING_DOMAIN, undefined);
  }, [registerDomain, contract]);

  useEffect(() => {
    const live = new Set(describe().map((descriptor) => descriptor.groupId));
    prune(PRICING_DOMAIN, live);
  }, [variants, variationTypes, describe, prune]);

  useEffect(() => {
    return () => {
      clearDomain(PRICING_DOMAIN);
    };
  }, [clearDomain]);
}
