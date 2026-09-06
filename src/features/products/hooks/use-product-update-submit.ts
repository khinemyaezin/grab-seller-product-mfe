import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useValidateAllSlots } from "@khinemyaezin/seller-ui";
import {
  useUpdateSellableProductMutation,
  invalidateProductQueries,
} from "@/features/products/hooks/use-products";
import { buildUpdateSellableProductRequest } from "@/features/products/adapters/update-sellable-product-request";
import { determineUpdateIntent } from "@/features/products/adapters/update-product-request";
import { useUpdateExtensionSyncStore } from "@/features/products/context/extension-sync-store";
import type {
  ProductFormValue,
  ProductLifecycleEvent,
} from "@/features/products/types";
import { UPDATE_SELLABLE_PRODUCT_WORKFLOW } from "@/features/products/constants/create-sellable-product-workflow";
import {
  useWorkflowAwaiter,
  WorkflowTimeoutError,
} from "@/features/products/hooks/use-workflow-awaiter";
import { useCatalogLink } from "./use-root";

export type UseProductUpdateSubmitOptions = {
  productId: string;
  onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
  refetch?: () => void;
};

export type UseProductUpdateSubmitResult = {
  submit: () => Promise<void>;
};

export function useProductUpdateSubmit({
  productId,
  onLifecycleEvent,
  refetch,
}: UseProductUpdateSubmitOptions): UseProductUpdateSubmitResult {
  const queryClient = useQueryClient();
  const { getValues } = useFormContext<ProductFormValue>();
  const productUpdateLink = useCatalogLink("updateSellableProduct");

  const { validate } = useValidateAllSlots();
  const { runDomainSubmit } = useUpdateExtensionSyncStore();
  const mutation = useUpdateSellableProductMutation();
  const { mutateAsync, reset: resetMutation } = mutation;

  const { awaitWorkflow } = useWorkflowAwaiter({
    workflowName: UPDATE_SELLABLE_PRODUCT_WORKFLOW,
  });

  const submit = useCallback(async () => {
    if (!productUpdateLink) {
      throw new Error("Missing update link");
    }

    const results = await validate();
    const { contributions, errors } = runDomainSubmit(results);
    const hasSlotErrors = results.some((result) => !result.valid);
    const hasFieldErrors = Object.keys(errors).length > 0;

    if (hasSlotErrors || hasFieldErrors) {
      onLifecycleEvent?.({ type: "validationFailed", errors });
      throw new Error("Validation failed");
    }

    const values = getValues();
    const intent = determineUpdateIntent({
      hasVariationTypes: values.variationTypes.length > 0,
    });

    const payload = buildUpdateSellableProductRequest(productId, values, intent, {
      pricingLines: contributions.pricingLines,
      inventoryLines: contributions.inventoryLines,
    });

    try {
      await awaitWorkflow((idempotencyKey) =>
        mutateAsync({
          link: productUpdateLink,
          request: { ...payload, idempotencyKey },
        }),
      );

      void invalidateProductQueries(queryClient, productId);
      onLifecycleEvent?.({ type: "updated" });
      resetMutation();
      refetch?.();
    } catch (error) {
      resetMutation();
      if (error instanceof WorkflowTimeoutError) {
        onLifecycleEvent?.({ type: "updateTimedOut" });
      } else {
        onLifecycleEvent?.({ type: "updateFailed" });
      }
      throw error;
    }
  }, [
    awaitWorkflow,
    getValues,
    mutateAsync,
    onLifecycleEvent,
    productId,
    productUpdateLink,
    queryClient,
    refetch,
    resetMutation,
    runDomainSubmit,
    validate,
  ]);

  return {
    submit,
  };
}
