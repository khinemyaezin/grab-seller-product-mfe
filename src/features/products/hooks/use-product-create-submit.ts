import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import { useQueryClient } from "@tanstack/react-query";
import { useValidateAllSlots } from "@khinemyaezin/seller-ui";
import {
  useCreateSellableProductMutation,
  invalidateProductsQueries,
} from "@/features/products/hooks/use-products";
import { buildCreateSellableProductRequest } from "@/features/products/adapters/create-sellable-product-request";
import { useCreateExtensionSyncStore } from "@/features/products/context/extension-sync-store";
import type {
  ProductFormValue,
  ProductLifecycleEvent,
} from "@/features/products/types";
import { CREATE_SELLABLE_PRODUCT_WORKFLOW } from "@/features/products/constants/create-sellable-product-workflow";
import {
  useWorkflowAwaiter,
  WorkflowTimeoutError,
} from "@/features/products/hooks/use-workflow-awaiter";

export type UseProductCreateSubmitOptions = {
  form: UseFormReturn<ProductFormValue>;
  link: HateoasLink;
  onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
};

export type UseProductCreateSubmitResult = {
  submit: () => Promise<void>;
};

export function useProductCreateSubmit({
  form,
  link,
  onLifecycleEvent,
}: UseProductCreateSubmitOptions): UseProductCreateSubmitResult {
  const queryClient = useQueryClient();
  const { validate } = useValidateAllSlots();
  const { runDomainSubmit } = useCreateExtensionSyncStore();
  const mutation = useCreateSellableProductMutation();
  const { mutateAsync, reset: resetMutation } = mutation;

  const { awaitWorkflow } = useWorkflowAwaiter({
    workflowName: CREATE_SELLABLE_PRODUCT_WORKFLOW,
  });

  const submit = useCallback(async () => {
    const results = await validate();
    const { contributions, errors } = runDomainSubmit(results);
    const hasSlotErrors = results.some((result) => !result.valid);
    const hasFieldErrors = Object.keys(errors).length > 0;

    if (hasSlotErrors || hasFieldErrors) {
      onLifecycleEvent?.({ type: "validationFailed", errors });
      throw new Error("Validation failed");
    }

    const payload = buildCreateSellableProductRequest(form.getValues(), contributions);

    try {
      await awaitWorkflow((idempotencyKey) =>
        mutateAsync({
          link,
          request: { ...payload, idempotencyKey },
        }),
      );
      void invalidateProductsQueries(queryClient);
      onLifecycleEvent?.({ type: "created" });
      resetMutation();
      form.reset();
    } catch (error) {
      resetMutation();
      if (error instanceof WorkflowTimeoutError) {
        onLifecycleEvent?.({ type: "createTimedOut" });
      } else {
        onLifecycleEvent?.({ type: "createFailed" });
      }
      throw error;
    }
  }, [
    awaitWorkflow,
    form,
    link,
    mutateAsync,
    onLifecycleEvent,
    queryClient,
    resetMutation,
    runDomainSubmit,
    validate,
  ]);

  return {
    submit,
  };
}
