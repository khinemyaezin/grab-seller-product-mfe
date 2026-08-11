import { FormProvider, useForm } from "react-hook-form"
import ProductBasicFieldSet from "./product-basic-fieldset";
import ProductVariationFieldSet from "./product-variation-fieldset";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { Separator } from "@khinemyaezin/seller-ui/components/separator";
import { Button, ButtonStatus, Item, ItemActions, ItemContent, ItemTitle } from "@khinemyaezin/seller-ui/components/index";
import { ButtonGroup } from "@khinemyaezin/seller-ui/components/button-group";
import { ProductFormValue } from "../types";
import type { ProductLifecycleEvent } from "../types";
import { HateoasLink } from "@khinemyaezin/seller-api";
import { useProductCreateSubmit } from "@/features/products/hooks/use-product-create-submit";

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
  pricingLines: [],
  inventoryLines: []
};

export default function ProductNewForm({ link, onLifecycleEvent }: ProductNewFormProps) {
  const form = useForm<ProductFormValue>({
    defaultValues: DEFAULT_PRODUCT_FORM_VALUE,
    mode: "onSubmit",
  });

  const { handleSubmit, formState: { isDirty } } = form;
  const { submit, isBusy, status } = useProductCreateSubmit({
    form,
    link,
    onLifecycleEvent,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Card className="flex-1 w-full">
            <CardContent>
              <ProductBasicFieldSet />
            </CardContent>
            <Separator />
            <CardContent>
              <ProductVariationFieldSet />
            </CardContent>
          </Card>
        </div>
        {isDirty && (
          <Item className="w-full">
            <ItemContent>
              <ItemTitle>Unsaved changes</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ButtonGroup>
                <ButtonGroup>
                  <Button
                    type="submit"
                    disabled={isBusy}
                  >
                    <ButtonStatus
                      status={status}
                      pendingLabel="Saving…"
                      successLabel="Saved"
                    >
                      Save
                    </ButtonStatus>
                  </Button>
                </ButtonGroup>
              </ButtonGroup>
            </ItemActions>
          </Item>
        )}
      </form>
    </FormProvider>
  );
}
