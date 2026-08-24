import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import { useValidateAllSlots } from "@khinemyaezin/seller-ui";
import type { ButtonStatusState } from "@khinemyaezin/seller-ui/components/index";
import { useUpdateSellableProductMutation } from "@/features/products/hooks/use-products";
import { buildUpdateSellableProductRequest } from "@/features/products/adapters/update-sellable-product-request";
import { determineUpdateIntent } from "@/features/products/adapters/update-product-request";
import { useExtensionSyncStore } from "@/features/products/context/extension-sync-store";
import type {
  ProductFormValue,
  ProductLifecycleEvent,
} from "@/features/products/types";
import { useCatalogLink } from "./use-root";

export type UseProductUpdateSubmitOptions = {
  form: UseFormReturn<ProductFormValue>;
  productId: string;
  onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
  refetch?: () => void;
};

export type UseProductUpdateSubmitResult = {
  submit: () => Promise<void>;
  isBusy: boolean;
  status: ButtonStatusState;
};

export function useProductUpdateSubmit({
  form,
  productId,
  onLifecycleEvent,
  refetch,
}: UseProductUpdateSubmitOptions): UseProductUpdateSubmitResult {
  const productUpdateLink = useCatalogLink("updateSellableProduct");

  const { validate, isValidating } = useValidateAllSlots();
  const { runDomainSubmit } = useExtensionSyncStore();
  const mutation = useUpdateSellableProductMutation();
  const { mutate, reset: resetMutation } = mutation;

  const submit = useCallback(async () => {
    if (!productUpdateLink) return;

    const results = await validate();
    const { contributions, errors } = runDomainSubmit(results);
    const hasSlotErrors = results.some((result) => !result.valid);
    const hasFieldErrors = Object.keys(errors).length > 0;

    if (hasSlotErrors || hasFieldErrors) {
      onLifecycleEvent?.({ type: "validationFailed", errors });
      return;
    }

    const values = form.getValues();
    const intent = determineUpdateIntent({
      hasVariationTypes: values.variationTypes.length > 0,
      hasVariationTypeChanges: form.getFieldState("variationTypes").isDirty,
      hasVariantChanges: form.getFieldState("product.variants").isDirty,
      hasStandaloneChanges: form.getFieldState("product.standaloneVariant").isDirty,
    });

    mutate(
      {
        link: productUpdateLink,
        request: buildUpdateSellableProductRequest(productId, values, intent, {
          pricingLines: contributions.pricingLines,
        }),
      },
      {
        onSuccess: () => {
          onLifecycleEvent?.({ type: "updated" });
          resetMutation();
          refetch?.();
        },
        onError: () => {
          onLifecycleEvent?.({ type: "updateFailed" });
          resetMutation();
        },
      },
    );
  }, [form, productUpdateLink, mutate, onLifecycleEvent, productId, refetch, resetMutation, runDomainSubmit, validate]);

  const status: ButtonStatusState = mutation.isPending
    ? "pending"
    : mutation.isSuccess
      ? "success"
      : mutation.isError
        ? "failed"
        : "idle";

  return {
    submit,
    isBusy: mutation.isPending || isValidating,
    status,
  };
}
