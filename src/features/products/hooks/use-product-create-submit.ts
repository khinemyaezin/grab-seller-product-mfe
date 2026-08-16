import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import { useValidateAllSlots } from "@khinemyaezin/seller-ui";
import type { ButtonStatusState } from "@khinemyaezin/seller-ui/components/index";
import { useCreateSellableProductMutation } from "@/features/products/hooks/use-products";
import { buildCreateSellableProductRequest } from "@/features/products/adapters/create-sellable-product-request";
import { useExtensionSyncStore } from "@/features/products/context/extension-sync-store";
import type {
  ProductFormValue,
  ProductLifecycleEvent,
} from "@/features/products/types";

export type UseProductCreateSubmitOptions = {
  form: UseFormReturn<ProductFormValue>;
  link: HateoasLink;
  onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
};

export type UseProductCreateSubmitResult = {
  submit: () => Promise<void>;
  isBusy: boolean;
  status: ButtonStatusState;
};

export function useProductCreateSubmit({
  form,
  link,
  onLifecycleEvent,
}: UseProductCreateSubmitOptions): UseProductCreateSubmitResult {
  const { validate, isValidating } = useValidateAllSlots();
  const { runDomainSubmit } = useExtensionSyncStore();
  const mutation = useCreateSellableProductMutation();
  const { mutate, reset: resetMutation } = mutation;

  const submit = useCallback(async () => {
    const results = await validate();
    const { contributions, errors } = runDomainSubmit(results);
    const hasSlotErrors = results.some((result) => !result.valid);
    const hasFieldErrors = Object.keys(errors).length > 0;

    if (hasSlotErrors || hasFieldErrors) {
      onLifecycleEvent?.({ type: "validationFailed", errors });
      return;
    }

    mutate(
      {
        link,
        request: buildCreateSellableProductRequest(form.getValues(), contributions),
      },
      {
        onSuccess: () => {
          onLifecycleEvent?.({ type: "created" });
          resetMutation();
          form.reset();
        },
        onError: () => {
          onLifecycleEvent?.({ type: "createFailed" });
          resetMutation();
        },
      },
    );
  }, [form, link, mutate, onLifecycleEvent, resetMutation, runDomainSubmit, validate]);

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
