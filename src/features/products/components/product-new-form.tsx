import { FormProvider, useForm } from "react-hook-form"
import ProductBasicFieldSet from "./product-basic-fieldset";
import ProductVariationFieldSet from "./product-variation-fieldset";
import { useCreateSellableProductMutation } from "@/features/products/hooks/use-products";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { Separator } from "@khinemyaezin/seller-ui/components/separator";
import { Button, ButtonStatus, Item, ItemActions, ItemContent, ItemTitle } from "@khinemyaezin/seller-ui/components/index";
import { ButtonGroup } from "@khinemyaezin/seller-ui/components/button-group";
import {
  ProductFormValue,
} from "../types";
import type { ProductLifecycleEvent } from "../types";
import { PricingLineFullSlot } from "./pricing-full-slot";
import { HateoasLink } from "@khinemyaezin/seller-api";
import { usePlatform } from "@khinemyaezin/seller-ui";
import { useSlotProvider } from "@/extensions";

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

// const parseOptionalNumber = (val: string | number | null | undefined): number | undefined => {
//   if (val === "" || val == null) return undefined;
//   const num = Number(val);
//   return Number.isFinite(num) ? num : undefined;
// };

// function buildCreatePayload(values: ProductFormValue): CreateSellableProductRequest {
//   const hasVariations = values.product.variants.length > 0;
//   const sharedLocationId = values.inventoryLocationId?.trim() ?? "";

//   const mappedVariants = hasVariations
//     ? values.product.variants.map((variant) => ({
//       sku: variant.sku,
//       variations: variant.variations.map((v) => ({
//         typeId: v.typeId,
//         optionId: v.optionId,
//       })),
//     }))
//     : [{
//       sku: values.product.standaloneVariant.sku ?? "",
//       variations: [],
//     }];

//   const rawPricingLines = hasVariations
//     ? (values.pricingLines ?? [])
//     : (values.standalonePricingLine ? [{ ...values.standalonePricingLine, sku: values.product.standaloneVariant.sku ?? "" }] : []);

//   const pricingLines = rawPricingLines
//     .filter((line) => line.sku?.trim() && line.amount !== "" && line.currencyCode)
//     .map((line) => ({
//       sku: line.sku.trim(),
//       title: line.title?.trim() || undefined,
//       currencyCode: line.currencyCode,
//       amount: Number(line.amount),
//       minQuantity: parseOptionalNumber(line.minQuantity),
//       maxQuantity: parseOptionalNumber(line.maxQuantity),
//     }));

//   const rawInventoryLines = hasVariations
//     ? (values.inventoryLines ?? [])
//     : (values.standaloneInventoryLine ? [{ ...values.standaloneInventoryLine, sku: values.product.standaloneVariant.sku ?? "" }] : []);

//   const inventoryLines = rawInventoryLines
//     .filter((line) => line.sku?.trim())
//     .map((line) => ({
//       sku: line.sku.trim(),
//       locationId: (line.locationId || sharedLocationId).trim(),
//       initialQuantity: Number(line.initialQuantity) || 0,
//       safetyStock: parseOptionalNumber(line.safetyStock),
//       reorderPoint: parseOptionalNumber(line.reorderPoint),
//       reorderQuantity: parseOptionalNumber(line.reorderQuantity),
//       maxStock: parseOptionalNumber(line.maxStock),
//     }))
//     .filter((line) => !!line.locationId);

//   return {
//     product: {
//       name: values.product.name,
//       categoryId: values.product.category?.id || "",
//       condition: "NEW",
//       slug: generateSlug(values.product.name),
//       variants: mappedVariants,
//     },
//     variantTypes: values.variationTypes.map((type) => ({
//       typeId: type.uuid,
//       options: type.options
//         .filter((option) => option.uuid !== "")
//         .map((option) => ({
//           optionId: option.uuid,
//         })),
//     })),
//     pricingLines,
//     inventoryLines,
//   };
// }

export default function ProductNewForm({ }: ProductNewFormProps) {
  const form = useForm<ProductFormValue>({
    defaultValues: DEFAULT_PRODUCT_FORM_VALUE,
    mode: "onSubmit",
  });

  const { handleSubmit, watch, formState: { isDirty } } = form;
  const createSellableProductApi = useCreateSellableProductMutation();
  const { list } = useSlotProvider();
  const platform = usePlatform();

  const handleFormSubmit = async (_values: ProductFormValue) => {
    // const results = await validateAllSlots(events, list());
    // if (results.some((result) => !result.valid)) return;

    // const payload = buildCreatePayload(getValues());
    // createSellableProductApi.mutate(
    //   { link, request: payload },
    //   {
    //     onSuccess: () => {
    //       onLifecycleEvent?.({ type: "created" });
    //       createSellableProductApi.reset();
    //       reset();
    //     },
    //     onError: () => {
    //       onLifecycleEvent?.({ type: "createFailed" });
    //       createSellableProductApi.reset();
    //     },
    //   },
    // );
  };

  console.log(JSON.stringify(watch("pricingLines")))
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
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
          <div className="flex w-full flex-col gap-6 lg:max-w-sm">
            <Card>
              <CardContent>
                <PricingLineFullSlot
                  instanceId="product.create.pricing:standalone"
                  skuFieldName="product.standaloneVariant.sku"
                  pricingLineNum={0}
                />
              </CardContent>
            </Card>
          </div>
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
            </ItemActions>
          </Item>
        )}
      </form>
    </FormProvider>
  );
}
