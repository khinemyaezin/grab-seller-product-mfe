
import { Button, ButtonStatus, Skeleton } from "@khinemyaezin/seller-ui/components/index"
import { ButtonGroup } from "@khinemyaezin/seller-ui/components/button-group"
import { Card, CardContent, CardFooter } from "@khinemyaezin/seller-ui/components/card"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import ProductBasicFieldSet from "./product-basic-fieldset"
import ProductVariationFieldSet from "./product-variation-fieldset"
import { generateSlug } from "@/features/products/utils"
import { useProductGet, useProductUpdateMutation, useProductDeleteMutation, useProductRestoreMutation } from "@/features/products/hooks/use-products"
import { useCatalogLink } from "@/features/products/hooks/use-root"
import { getVariantName } from "@/features/products/adapters/variation-matrix"
import { isEqual } from "lodash"
import { useEffect, useMemo } from "react"
import { Separator } from "@khinemyaezin/seller-ui/components/separator"
import { resolveLink } from "@khinemyaezin/seller-api"
import { ProductFormValue, UPDATE_INTENT, UpdateProductRequest, GetFullProductResponse, ProductLifecycleEvent } from "../types"
import { ProductStatus } from "./product-status"
import { Archive, RotateCcw } from "lucide-react"

export type ProductEditFormProps = {
    productId: string,
    onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
}

const DEFAULT_PRODUCT_FORM_VALUE: ProductFormValue = {
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

function determineUpdateIntent({
    hasVariationTypes,
    hasVariantChanges,
    hasVariationTypeChanges,
    hasStandaloneChanges,
}: {
    hasVariationTypes: boolean;
    hasVariationTypeChanges: boolean;
    hasVariantChanges: boolean;
    hasStandaloneChanges: boolean;
}): UPDATE_INTENT {
    if (hasVariationTypes && hasVariantChanges || hasVariationTypeChanges) return "FULL_SYNC";
    if (hasStandaloneChanges) return "COLLAPSE_TO_STANDALONE";
    return "LEAVE_AS_IS";
}

function buildUpdatePayload(values: ProductFormValue, intent: UPDATE_INTENT): UpdateProductRequest {
    const mappedVariants: UpdateProductRequest["variantSync"]["overrides"] =
        values.variationTypes.length > 0
            ? values.product.variants.map((variant) => ({
                sku: variant.sku,
                matrixKey: variant.matrixKey,
                variations: variant.variations.map((v) => ({
                    typeId: v.typeId,
                    optionId: v.optionId,
                })),
            }))
            : [{
                sku: values.product.standaloneVariant.sku ?? "",
                matrixKey: "",
                variations: [],
            }];

    const types: UpdateProductRequest["variantSync"]["variantTypes"] =
        values.variationTypes.map((type) => ({
            typeId: type.uuid,
            options: type.options
                .filter((option) => option.uuid !== "")
                .map((option) => ({
                    optionId: option.uuid,
                    optionName: option.name,
                })),
        }));

    return {
        name: values.product.name,
        categoryId: values.product.category?.id || "",
        condition: "NEW",
        slug: generateSlug(values.product.name),

        variantSync: {
            intent: intent,
            overrides: mappedVariants,
            variantTypes: types,
        },
    };
}

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

function transformProductToFormValue(apiData: GetFullProductResponse): ProductFormValue {
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

export default function ProductEditForm({
    productId,
    onLifecycleEvent
}: ProductEditFormProps) {
    const getProductLink = useCatalogLink("getProduct");
    const form = useForm<ProductFormValue>({
        defaultValues: DEFAULT_PRODUCT_FORM_VALUE,
        mode: "onSubmit",
    });
    const { handleSubmit, control, reset, getFieldState, formState: { isDirty } } = form;
    const { data: productData, isLoading: isProductLoading, refetch } = useProductGet(getProductLink, productId);
    const productUpdateLink = resolveLink(productData?._links, "update-product");
    const productDeleteLink = resolveLink(productData?._links, "delete-product");
    const productRestoreLink = resolveLink(productData?._links, "restore-product");
    const productPublishLink = resolveLink(productData?._links, "publish-product")

    const updateProductMutation = useProductUpdateMutation();
    const deleteProductMutation = useProductDeleteMutation();
    const restoreProductMutation = useProductRestoreMutation();

    const watchedValues = useWatch({ control });

    const normalizedDefaults = useMemo(
        () => productData
            ? normalizeForComparison(transformProductToFormValue(productData))
            : normalizeForComparison(DEFAULT_PRODUCT_FORM_VALUE),
        [productData],
    );

    const isFormDirty = useMemo(
        () => !isEqual(normalizeForComparison(watchedValues as ProductFormValue), normalizedDefaults),
        [watchedValues, normalizedDefaults],
    );

    useEffect(() => {
        if (productData?.name) {
            onLifecycleEvent?.({ type: "titleResolved", title: productData.name });
        }
    }, [productData?.name, onLifecycleEvent]);

    useEffect(() => {
        if (productData) {
            const formValue = transformProductToFormValue(productData);
            reset(formValue);
        }
    }, [productData, reset]);



    function handleFormSubmit(values: ProductFormValue) {
        if (!productUpdateLink) return;
        const intent = determineUpdateIntent({
            hasVariationTypes: values.variationTypes.length > 0,
            hasVariationTypeChanges: getFieldState("variationTypes").isDirty,
            hasVariantChanges: getFieldState("product.variants").isDirty,
            hasStandaloneChanges: getFieldState("product.standaloneVariant").isDirty,
        });

        const payload = buildUpdatePayload(values, intent);
        updateProductMutation.mutate(
            { link: productUpdateLink, request: payload },
            {
                onSuccess: () => {
                    onLifecycleEvent?.({ type: "updated" });
                    refetch();
                    updateProductMutation.reset();
                },
                onError: () => {
                    onLifecycleEvent?.({ type: "updateFailed" });
                    updateProductMutation.reset();
                }
            }
        );
    }

    function handleArchive() {
        if (!productDeleteLink) return;
        deleteProductMutation.mutate(
            { link: productDeleteLink },
            {
                onSuccess: () => { onLifecycleEvent?.({ type: "archived" }); deleteProductMutation.reset() },
                onError: () => { onLifecycleEvent?.({ type: "archiveFailed" }); deleteProductMutation.reset() },
            },
        );
    }

    function handleOnRestore() {
        if (!productRestoreLink) return;
        restoreProductMutation.mutate(
            { link: productRestoreLink },
            {
                onSuccess: () => { onLifecycleEvent?.({ type: "restored" }); restoreProductMutation.reset() },
                onError: () => { onLifecycleEvent?.({ type: "restoreFailed" }); restoreProductMutation.reset() },
            },
        );
    }

    if (isProductLoading || !productData) {
        return (
            <div className="">
                <div className="flex w-full flex-col gap-7">
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
        );
    }

    const actionButtons = [
        {
            show: productRestoreLink,
            onClick: handleOnRestore,
            mutation: restoreProductMutation,
            variant: "secondary" as const,
            pendingLabel: "Restoring",
            successLabel: "Restored",
            label: "Restore",
            Icon: RotateCcw
        },
        {
            show: productDeleteLink,
            onClick: handleArchive,
            mutation: deleteProductMutation,
            variant: "destructive" as const,
            pendingLabel: "Archiving",
            successLabel: "Archived",
            label: "Archive",
            Icon: Archive
        }
    ].reduce<React.ReactNode[]>((acc, btn, index) => {
        if (btn.show) {
            acc.push(
                <Button
                    key={index}
                    type="button"
                    variant={btn.variant}
                    disabled={btn.mutation.isPending || btn.mutation.isSuccess}
                    onClick={btn.onClick}>
                    <ButtonStatus
                        status={
                            btn.mutation.isPending
                                ? "pending"
                                : btn.mutation.isSuccess
                                    ? "success"
                                    : "idle"
                        }
                        pendingLabel={btn.pendingLabel}
                        successLabel={btn.successLabel}>
                        <btn.Icon className="mr-1 h-4 w-4" />
                        {btn.label}
                    </ButtonStatus>
                </Button>
            );
        }
        return acc;
    }, []);

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col md:flex-row gap-6 items-start">
                <Card className="w-full md:w-[60%]">
                    <CardContent>
                        <ProductBasicFieldSet />
                        <Separator className="my-6" />
                        <ProductVariationFieldSet />
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <ButtonGroup>
                            <ButtonGroup>
                                {actionButtons}
                            </ButtonGroup>
                            {isFormDirty && (
                                <ButtonGroup>
                                    <Button type="submit" disabled={updateProductMutation.isPending || updateProductMutation.isSuccess}>
                                        <ButtonStatus
                                            status={
                                                updateProductMutation.isPending
                                                    ? "pending"
                                                    : updateProductMutation.isSuccess
                                                        ? "success"
                                                        : "idle"
                                            }
                                            pendingLabel="Saving…"
                                            successLabel="Saved">
                                            Save
                                        </ButtonStatus>
                                    </Button>
                                </ButtonGroup>
                            )}
                        </ButtonGroup>
                    </CardFooter>
                </Card>
                <div className="flex w-full md:flex-1 flex-col gap-6">
                    <ProductStatus
                        status={productData.status}
                        link={productPublishLink}
                        onLifecycleEvent={onLifecycleEvent} />
                </div>
            </form>

        </FormProvider>
    )

} 
