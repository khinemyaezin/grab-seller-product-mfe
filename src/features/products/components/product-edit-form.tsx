
import { Skeleton } from "@khinemyaezin/seller-ui/components/index"
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card"
import { FormProvider, useForm } from "react-hook-form"
import ProductBasicFieldSet from "./product-basic-fieldset"
import { useProductUpdateSubmit } from "@/features/products/hooks/use-product-update-submit"
import { useProductEdit, DEFAULT_PRODUCT_FORM_VALUE } from "@/features/products/hooks/use-product-edit"
import { ProductFormValue, ProductLifecycleEvent } from "../types"
import { ProductStatus } from "./product-status"
import ProductEditVariation from "./product-edit-variation"
import { PricingEditStandalone } from "./pricing-edit-standalone"
import { resolveLink } from "@khinemyaezin/seller-api"
import ActionButtonGroup from "./product-edit-actions"
import { useContextBar } from "@khinemyaezin/seller-ui"
import { useIsExtensionDirty } from "../context/extension-sync-store"

export type ProductEditFormProps = {
    productId: string,
    onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
}

export default function ProductEditForm({
    productId,
    onLifecycleEvent
}: ProductEditFormProps) {
    const form = useForm<ProductFormValue>({
        defaultValues: DEFAULT_PRODUCT_FORM_VALUE,
        mode: "onSubmit",
    });
    const { handleSubmit, formState: { isDirty } } = form;

    const { isLoading: isFetchingProductById, refetch, status: productStatus, actions } = useProductEdit({
        productId,
        onLifecycleEvent,
        form,
    });

    const { submit } = useProductUpdateSubmit({
        form,
        productId,
        onLifecycleEvent,
        refetch,
    });
    const [isExtensionDirty, resetExtensionDirty] = useIsExtensionDirty();

    useContextBar({
        dirty: isDirty || isExtensionDirty,
        onSave: handleSubmit(submit),
        onDiscard: () => {
            refetch();
            resetExtensionDirty();
        },
        groupId: "product-edit",
        label: "Edit Product",
    });

    const productPublishLink = resolveLink(actions, "publish-product");

    if (isFetchingProductById) {
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

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(submit)} className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-[60%] grid gap-6">
                    <Card>
                        <CardContent>
                            <ProductBasicFieldSet />
                        </CardContent>
                    </Card>
                    <PricingEditStandalone />
                    <ProductEditVariation />
                    <ActionButtonGroup links={actions} onLifecycleEvent={onLifecycleEvent} />
                </div>
                <div className="flex w-full md:flex-1 flex-col gap-6">
                    <ProductStatus
                        status={productStatus}
                        link={productPublishLink}
                        onLifecycleEvent={onLifecycleEvent} />
                </div>
            </form>
        </FormProvider>
    )

} 
