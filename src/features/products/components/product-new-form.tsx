import { FormProvider, useForm } from "react-hook-form"
import { ProductFormValue } from "../types";
import type { ProductLifecycleEvent } from "../types";
import { HateoasLink } from "@khinemyaezin/seller-api";
import { useProductCreateSubmit } from "@/features/products/hooks/use-product-create-submit";
import { useIsExtensionDirty } from "@/features/products/context/extension-sync-store";
import { useContextBar } from "@khinemyaezin/seller-ui";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { PricingStandalone } from "./pricing-standalone";
import { InventoryStandalone } from "./inventory-standalone";
import ProductBasicFieldSet from "./product-basic-fieldset";
import ProductVariationFieldSet from "./product-variation-fieldset";

export type ProductNewFormProps = {
  link: HateoasLink,
  onLifecycleEvent?: (event: ProductLifecycleEvent) => void
};

const DEFAULT_PRODUCT_FORM_VALUE: ProductFormValue = {
  product: {
    name: "",
    category: null,
    variants: [],
    standaloneVariant: {
      sku: "",
    },
  },
  variationTypes: [],
};

export default function ProductNewForm({ link, onLifecycleEvent }: ProductNewFormProps) {
  const form = useForm<ProductFormValue>({
    defaultValues: DEFAULT_PRODUCT_FORM_VALUE,
    mode: "onSubmit",
  });

  const { handleSubmit, formState: { isDirty } } = form;
  const [isExtensionDirty, resetExtensionDirty] = useIsExtensionDirty();
  const { submit } = useProductCreateSubmit({
    form,
    link,
    onLifecycleEvent,
  });

  useContextBar({
    dirty: isDirty || isExtensionDirty,
    onSave: handleSubmit(submit),
    onDiscard: () => {
      form.reset();
      resetExtensionDirty();
    },
    groupId: "product-new",
    label: "New Product",
  });

return (
  <FormProvider {...form}>
    <form onSubmit={handleSubmit(submit)}>
      <div className="flex flex-col gap-6">
        <Card className="flex-1 w-full">
          <CardContent>
            <ProductBasicFieldSet />
          </CardContent>
        </Card>
        <PricingStandalone />
        <InventoryStandalone />
        <Card>
          <CardContent>
            <ProductVariationFieldSet />
          </CardContent>
        </Card>
      </div>
    </form>
  </FormProvider>
);
}
