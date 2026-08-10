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
  lineIndex?: number;
  fieldName?: string;
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

export function InventoryLineSlot({ sku, lineIndex, fieldName }: InventoryLineSlotProps) {
  const { control, setValue, trigger } = useFormContext<ProductFormValue>();
  const basePath = fieldName ?? `inventoryLines.${lineIndex}`;

  const watchedLine = useWatch({
    control,
    name: basePath as any,
  });

  const locationField = useController({
    control,
    name: `${basePath}.locationId` as any,
    rules: locationRules,
  });
  const quantityField = useController({
    control,
    name: `${basePath}.initialQuantity` as any,
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
        basePath as any,
        {
          ...next,
          sku: sku || next.sku || "",
        },
        { shouldDirty: true, shouldValidate: true },
      );
      if (next.locationId) {
        //setValue("inventoryLocationId", next.locationId, { shouldDirty: true });
      }
    },
    [basePath, setValue, sku],
  );

  const handleBlur = useCallback(
    (field: "locationId" | "initialQuantity" | "safetyStock") => {
      void trigger(`${basePath}.${field}` as any);
    },
    [basePath, trigger],
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
