import { FormProvider, useForm, useFormContext } from "react-hook-form"
import ProductBasicFieldSet from "./product-basic-fieldset";
import ProductVariationFieldSet from "./product-variation-fieldset";
import { generateSlug } from "@/features/products/utils";
import { useCreateSellableProductMutation } from "@/features/products/hooks/use-products";
import { usePricingLinesSync } from "@/features/products/hooks/use-pricing-lines-sync";
import { Card, CardContent, CardFooter } from "@khinemyaezin/seller-ui/components/card";
import { Separator } from "@khinemyaezin/seller-ui/components/separator";
import { Button, ButtonStatus } from "@khinemyaezin/seller-ui/components/index";
import { ButtonGroup } from "@khinemyaezin/seller-ui/components/button-group";
import {
  ProductFormValue,
  CreateSellableProductRequest,
} from "../types";
import type { ProductLifecycleEvent } from "../types";

export type ProductNewFormProps = {
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
  inventoryLines: [],
  inventoryLocationId: "",
};

function buildCreatePayload(values: ProductFormValue): CreateSellableProductRequest {
  const mappedVariants = values.product.variants.length > 0
    ? values.product.variants.map((variant) => ({
      sku: variant.sku,
      variations: variant.variations.map((v) => ({
        typeId: v.typeId,
        optionId: v.optionId,
      })),
    }))
    : [{
      sku: values.product.standaloneVariant.sku ?? "",
      variations: [],
    }];

  const pricingLines = (values.pricingLines ?? [])
    .filter((line) => line.sku?.trim() && line.amount !== "" && line.currencyCode)
    .map((line) => ({
      sku: line.sku.trim(),
      title: line.title?.trim() || undefined,
      currencyCode: line.currencyCode,
      amount: Number(line.amount),
      minQuantity: line.minQuantity ?? undefined,
      maxQuantity: line.maxQuantity ?? undefined,
    }));

  const sharedLocationId = values.inventoryLocationId?.trim() ?? "";
  const inventoryLines = (values.inventoryLines ?? [])
    .filter((line) => line.sku?.trim())
    .map((line) => {
      const maxStockValue =
        line.maxStock === "" || line.maxStock == null
          ? undefined
          : Number(line.maxStock);
      return {
        sku: line.sku.trim(),
        locationId: (line.locationId || sharedLocationId).trim(),
        initialQuantity: Number(line.initialQuantity) || 0,
        safetyStock:
          line.safetyStock === "" || line.safetyStock == null
            ? undefined
            : Number(line.safetyStock),
        reorderPoint:
          line.reorderPoint === "" || line.reorderPoint == null
            ? undefined
            : Number(line.reorderPoint),
        reorderQuantity:
          line.reorderQuantity === "" || line.reorderQuantity == null
            ? undefined
            : Number(line.reorderQuantity),
        maxStock: Number.isFinite(maxStockValue) ? maxStockValue : undefined,
      };
    })
    .filter((line) => !!line.locationId);

  return {
    product: {
      name: values.product.name,
      categoryId: values.product.category?.id || "",
      condition: "NEW",
      slug: generateSlug(values.product.name),
      variants: mappedVariants,
    },
    variantTypes: values.variationTypes.map((type) => ({
      typeId: type.uuid,
      options: type.options
        .filter((option) => option.uuid !== "")
        .map((option) => ({
          optionId: option.uuid,
        })),
    })),
    pricingLines,
    inventoryLines,
  };
}

export default function ProductNewForm({
  onLifecycleEvent
}: ProductNewFormProps) {
  const form = useForm<ProductFormValue>({
    defaultValues: DEFAULT_PRODUCT_FORM_VALUE,
    mode: "onSubmit",
  });

  const { handleSubmit, reset, formState: { isDirty } } = form;
  const createSellableProductApi = useCreateSellableProductMutation();

  const handleFormSubmit = (values: ProductFormValue) => {
    const payload = buildCreatePayload(values);
    if (payload.pricingLines.length === 0 || payload.inventoryLines.length === 0) {
      onLifecycleEvent?.({ type: "createFailed" });
      return;
    }

    createSellableProductApi.mutate(
      { link: undefined!, request: payload },
      {
        onSuccess: () => {
          onLifecycleEvent?.({ type: "created" });
          createSellableProductApi.reset();
          reset();
        },
        onError: (error) => {
          console.error("Failed to create sellable product:", error);
          onLifecycleEvent?.({ type: "createFailed" });
          createSellableProductApi.reset();
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-6">
        <Card>
          <CardContent>
            <ProductBasicFieldSet />
            <Separator className="my-6" />
            <ProductVariationFieldSet />
          </CardContent>
          {isDirty && (
            <CardFooter className="flex justify-end">
              <ButtonGroup>
                <ButtonGroup>
                  <Button
                    type="submit"
                    disabled={createSellableProductApi.isPending}
                  >
                    <ButtonStatus
                      status={
                        createSellableProductApi.isPending
                          ? "pending"
                          : createSellableProductApi.isSuccess
                            ? "success"
                            : createSellableProductApi.isError
                              ? "failed"
                              : "idle"
                      }
                      pendingLabel="Saving…"
                      successLabel="Saved"
                    >
                      Save
                    </ButtonStatus>
                  </Button>
                </ButtonGroup>
              </ButtonGroup>
            </CardFooter>
          )}
        </Card>
      </form>
    </FormProvider>
  );
}
