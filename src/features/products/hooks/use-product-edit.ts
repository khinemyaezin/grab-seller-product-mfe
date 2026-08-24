import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValue, GetFullProductResponse, ProductLifecycleEvent } from "../types";
import { useProductGet } from "./use-products";
import { useCatalogLink } from "./use-root";

export const DEFAULT_PRODUCT_FORM_VALUE: ProductFormValue = {
    product: {
        name: "",
        category: null,
        variants: [],
        standaloneVariant: {
            sku: ""
        }
    },
    variationTypes: [],
};

function normalizeForComparison(values: ProductFormValue): ProductFormValue {
    return {
        ...values,
        variationTypes: values.variationTypes.map((type) => ({
            ...type,
            options: type.options
                .filter((option) => option.uuid !== "")
                .map((option) => ({ uuid: option.uuid, name: option.name })),
        })),
    };
}

function getVariantName(v: { variations: { optionId: string }[] }, nameMap: Record<string, string>): string {
    return v.variations.map((v) =>
        nameMap[v.optionId] ?? "")
        .filter(Boolean).join(" / ") || "";

}

export function transformProductToFormValue(apiData: GetFullProductResponse): ProductFormValue {
    const nameMap = Object.fromEntries(apiData.variantTypes.flatMap((t) =>
        t.options.map((o) => [o.optionId, o.optionName])));

    const standaloneVariant = apiData.variantTypes.length == 0
        && apiData.variants.find(v => v.variations.length === 0);

    return {
        product: {
            name: apiData.name,
            category: apiData?.category ?? {
                id: apiData.category.id,
                name: apiData.category.name
            },
            variants: apiData.variants.map((v) => ({
                id: v.id,
                name: getVariantName(v, nameMap),
                matrixKey: v.matrixKey,
                sku: v.sku,
                price: "",
                variations: v.variations.map((r) => ({
                    typeId: r.typeId,
                    optionId: r.optionId,
                })),
            })),
            standaloneVariant: standaloneVariant ? standaloneVariant : {
                sku: ""
            },
        },
        variationTypes: apiData.variantTypes.map((vt) => ({
            uuid: vt.typeId,
            name: vt.typeName,
            options: [
                ...vt.options.map((o) => ({
                    uuid: o.optionId,
                    name: o.optionName,
                })),
                { uuid: "", name: "" }
            ]
        })),
    };
}

export type UseProductEditProps = {
    productId: string,
    onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
    form: UseFormReturn<ProductFormValue>;
};

export function useProductEdit({ productId, onLifecycleEvent, form }: UseProductEditProps) {
    const { reset } = form;
    const getProductLink = useCatalogLink("getProduct");
    const { data, isLoading, refetch } = useProductGet(getProductLink, productId);

    useEffect(() => {
        if (data?.name) {
            onLifecycleEvent?.({ type: "titleResolved", title: data.name });
        }
    }, [data?.name, onLifecycleEvent]);

    useEffect(() => {
        if (data) {
            const formValue = transformProductToFormValue(data);
            reset(formValue);
        }
    }, [data, reset]);

    return {  isLoading, refetch, status: data?.status, actions: data?._links };
}
