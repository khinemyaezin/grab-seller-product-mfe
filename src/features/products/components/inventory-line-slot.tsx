import { useCallback, useMemo } from "react";
import {
  useController,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";
import type { InventoryLineFormValue, ProductFormValue } from "@/features/products/types";
import { FieldDescription, FieldLegend, FieldSet } from "@khinemyaezin/seller-ui/components/field";

export type InventoryLineSlotProps = {
  sku: string;
  lineIndex: number;
};

function defaultInventoryLine(sku: string): InventoryLineFormValue {
  return {
    sku,
    locationId: "",
    initialQuantity: 0,
    safetyStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    maxStock: "",
  };
}

const locationRules = {
  required: "Location is required",
};

const quantityRules = {
  validate: (value: number | "") => {
    if (value === "" || value == null) return "Initial quantity is required";
    if (Number(value) < 0) return "Must be 0 or greater";
    return true;
  },
};

export function InventoryLineSlot({ sku, lineIndex }: InventoryLineSlotProps) {
  const { control, setValue, trigger } = useFormContext<ProductFormValue>();
  const watchedLine = useWatch({
    control,
    name: `inventoryLines.${lineIndex}`,
  });

  const locationField = useController({
    control,
    name: `inventoryLines.${lineIndex}.locationId`,
    rules: locationRules,
  });
  const quantityField = useController({
    control,
    name: `inventoryLines.${lineIndex}.initialQuantity`,
    rules: quantityRules,
  });

  const line = useMemo((): InventoryLineFormValue => {
    if (watchedLine) {
      return {
        ...watchedLine,
        sku: sku || watchedLine.sku || "",
      };
    }
    return defaultInventoryLine(sku);
  }, [watchedLine, sku]);

  const handleChange = useCallback(
    (next: InventoryLineFormValue) => {
      setValue(
        `inventoryLines.${lineIndex}`,
        {
          ...next,
          sku: sku || next.sku || "",
        },
        { shouldDirty: true, shouldValidate: true },
      );
      if (next.locationId) {
        setValue("inventoryLocationId", next.locationId, { shouldDirty: true });
      }
    },
    [lineIndex, setValue, sku],
  );

  const handleBlur = useCallback(
    (field: "locationId" | "initialQuantity" | "safetyStock") => {
      void trigger(`inventoryLines.${lineIndex}.${field}`);
    },
    [lineIndex, trigger],
  );

  const errors = useMemo(
    () => ({
      locationId: locationField.fieldState.error?.message,
      initialQuantity: quantityField.fieldState.error?.message,
    }),
    [
      locationField.fieldState.error?.message,
      quantityField.fieldState.error?.message,
    ],
  );

  return (
    <FieldSet>
      <FieldLegend>Inventory</FieldLegend>
      <FieldDescription>
        Choose a location and set initial stock for this SKU.
      </FieldDescription>

      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY}
        props={{
          sku,
          value: line,
          onChange: handleChange,
          errors,
          onBlur: handleBlur,
        }}
      />
    </FieldSet>
  );
}
