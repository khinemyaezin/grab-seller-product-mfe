import { useCallback, useEffect, useMemo } from "react";
import {
  useController,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";
import type { PricingLineFormValue, ProductFormValue } from "@/features/products/types";
import { FieldDescription, FieldLegend, FieldSet } from "@khinemyaezin/seller-ui/components/field";

const DEFAULT_CURRENCY = "USD";

export type PricingLineSlotProps = {
  sku: string;
  name: string;
};

function defaultPricingLine(sku: string): PricingLineFormValue {
  return {
    sku,
    title: "",
    currencyCode: DEFAULT_CURRENCY,
    amount: 0,
    minQuantity: null,
    maxQuantity: null,
  };
}

const amountRules = {
  validate: (value: number | "") => {
    if (value === "" || value == null) return "Amount is required";
    if (Number(value) < 0) return "Must be 0 or greater";
    return true;
  },
};

const currencyRules = {
  required: "Currency is required",
};

export function PricingLineSlot({ sku, name }: PricingLineSlotProps) {
  const { control, setValue, trigger } = useFormContext<ProductFormValue>();
  const basePath = name;

  const watchedLine = useWatch({
    control,
    name: basePath as any,
  });

  const amountField = useController({
    control,
    name: `${basePath}.amount` as any,
    rules: amountRules,
  });
  const currencyField = useController({
    control,
    name: `${basePath}.currencyCode` as any,
    rules: currencyRules,
  });

  useEffect(() => {
    if (watchedLine && !watchedLine.currencyCode) {
      setValue(`${basePath}.currencyCode` as any,
        DEFAULT_CURRENCY,
        { shouldDirty: true, shouldValidate: true });
    }
  }, [watchedLine, basePath, setValue]);

  const line = useMemo((): PricingLineFormValue => {
    if (watchedLine) {
      return {
        ...watchedLine,
        sku: sku || watchedLine.sku || "",
      };
    }
    return defaultPricingLine(sku);
  }, [watchedLine, sku]);

  const handleChange = useCallback(
    (next: PricingLineFormValue) => {
      setValue(
        basePath as any,
        {
          ...next,
          sku: sku || next.sku || "",
        },
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [basePath, setValue, sku],
  );

  const handleBlur = useCallback(
    (field: "amount" | "currencyCode") => {
      void trigger(`${basePath}.${field}` as any);
    },
    [basePath, trigger],
  );

  const errors = useMemo(
    () => ({
      amount: amountField.fieldState.error?.message,
      currencyCode: currencyField.fieldState.error?.message,
    }),
    [amountField.fieldState.error?.message, currencyField.fieldState.error?.message],
  );

  return (
    <FieldSet>
      <FieldLegend>Pricing</FieldLegend>
      <FieldDescription>Set the price buyers will pay for this product.</FieldDescription>

      <div className="max-w-sm">
        <ExtensionSlot
          name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING}
          props={{
            sku,
            value: line,
            onChange: handleChange,
            errors,
            onBlur: handleBlur,
          }}
        />
      </div>
    </FieldSet>
  );
}
