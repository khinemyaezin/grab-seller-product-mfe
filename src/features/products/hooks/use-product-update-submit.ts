import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useValidateAllSlots } from "@khinemyaezin/seller-ui";
import type { ButtonStatusState } from "@khinemyaezin/seller-ui/components/index";
import { useUpdateSellableProductMutation } from "@/features/products/hooks/use-products";
import { buildUpdateSellableProductRequest } from "@/features/products/adapters/update-sellable-product-request";
import { determineUpdateIntent } from "@/features/products/adapters/update-product-request";
import { useUpdateExtensionSyncStore } from "@/features/products/context/extension-sync-store";
import type {
  ProductFormValue,
  ProductLifecycleEvent,
} from "@/features/products/types";
import { useCatalogLink } from "./use-root";

export type UseProductUpdateSubmitOptions = {
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
  productId,
  onLifecycleEvent,
  refetch,
}: UseProductUpdateSubmitOptions): UseProductUpdateSubmitResult {
  const { getValues } = useFormContext<ProductFormValue>();
  const productUpdateLink = useCatalogLink("updateSellableProduct");

  const { validate, isValidating } = useValidateAllSlots();
  const { runDomainSubmit } = useUpdateExtensionSyncStore();
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

    const values = getValues();
    const intent = determineUpdateIntent({
      hasVariationTypes: values.variationTypes.length > 0
    });


    const payload = buildUpdateSellableProductRequest(productId, values, intent, {
      pricingLines: contributions.pricingLines,
      inventoryLines: contributions.inventoryLines,
    });

    console.log(payload)
    mutate(
      {
        link: productUpdateLink,
        request: payload,
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
  }, [getValues, productUpdateLink, validate, runDomainSubmit, mutate, productId, onLifecycleEvent, resetMutation, refetch]);

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
