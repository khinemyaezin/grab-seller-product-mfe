import { useCallback, useMemo } from "react";
import {
  useController,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";
import type { PricingLineFormValue, ProductFormValue } from "@/features/products/types";
import { FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@khinemyaezin/seller-ui/components/field";

const DEFAULT_CURRENCY = "USD";

export type PricingLineSlotProps = {
  sku: string;
  lineIndex: number;
};

function defaultPricingLine(sku: string): PricingLineFormValue {
  return {
    sku,
    title: "",
    currencyCode: DEFAULT_CURRENCY,
    amount: "",
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

export function PricingLineSlot({ sku, lineIndex }: PricingLineSlotProps) {
  const { control, setValue, trigger } = useFormContext<ProductFormValue>();
  const watchedLine = useWatch({
    control,
    name: `pricingLines.${lineIndex}`,
  });

  const amountField = useController({
    control,
    name: `pricingLines.${lineIndex}.amount`,
    rules: amountRules,
  });
  const currencyField = useController({
    control,
    name: `pricingLines.${lineIndex}.currencyCode`,
    rules: currencyRules,
  });

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
        `pricingLines.${lineIndex}`,
        {
          ...next,
          sku: sku || next.sku || "",
        },
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [lineIndex, setValue, sku],
  );

  const handleBlur = useCallback(
    (field: "amount" | "currencyCode") => {
      void trigger(`pricingLines.${lineIndex}.${field}`);
    },
    [lineIndex, trigger],
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
