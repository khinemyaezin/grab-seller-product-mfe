import { useFieldArray, useFormContext } from "react-hook-form";
import { PricingLineFormValue, ProductFormValue } from "../types";
import { useEffect, useState } from "react";
import { usePlatform } from "@khinemyaezin/seller-ui";

export type PricingLineSkuSyncProps = {
    skuFiledName: string, pricingLineNumber: number
}

export function usePricingLinesSkuSync({ skuFiledName, pricingLineNumber }: PricingLineSkuSyncProps) {
    const { watch, control, getValues } = useFormContext<ProductFormValue>();
    const platform = usePlatform();
    const events = platform?.events;
    
    const skuWatch = watch(skuFiledName as any);
    const { update } = useFieldArray({ control, name: "pricingLines" });
    const [payload, setPayload] = useState<Partial<PricingLineFormValue>>();

    useEffect(() => {
        if (!events) return;
        if (!skuWatch) return;

        const lines = getValues("pricingLines") ?? [];
        const current = lines[pricingLineNumber];
        const next: PricingLineFormValue = { ...current, sku: skuWatch }

        if (current) {
            update(pricingLineNumber, next);
        }

        setPayload(next);
    }, [skuWatch, pricingLineNumber, update]);

    return {
        payload
    }
}