import { useMemo, useState } from "react";
import { Input } from "@khinemyaezin/seller-ui/components/input";
import { Button } from "@khinemyaezin/seller-ui/components/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@khinemyaezin/seller-ui/components/table";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Checkbox } from "@khinemyaezin/seller-ui/components/checkbox";
import { Field, FieldError } from "@khinemyaezin/seller-ui/components/field";
import type { ProductFormValue } from "@/features/products/types";

type VariantTableProps = {
  onAllVariantsDeleted?: () => void;
}

export function VariantTable({ onAllVariantsDeleted }: VariantTableProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const { control } = useFormContext<ProductFormValue>();
  const { fields, remove } = useFieldArray({
    control,
    name: "product.variants",
  });

  const variantFields = useMemo(() =>
    fields
      .map((field, index) => ({ field, index }))
      .filter(({ field }) => field.variations.length > 0),
    [fields]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIndices(variantFields.map(({ index }) => index));
    } else {
      setSelectedIndices([]);
    }
  };

  function toggleSelection(index: number) {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  function handleDelete() {
    const isDeletingAll = selectedIndices.length === variantFields.length;
    remove(selectedIndices);
    setSelectedIndices([]);
    if (isDeletingAll) {
      onAllVariantsDeleted?.();
    }
  }

  return variantFields.length !== 0 && (
    <div className="mt-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Generated Variants ()
        </div>
        {selectedIndices.length > 0 && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Selected ({selectedIndices.length})
          </Button>
        )}
      </div>
      <Table>
        <TableCaption>List of generated product variants.</TableCaption>
        <TableHeader>
          <TableRow >
            <TableHead className="w-[100px]">
              <Checkbox
                checked={selectedIndices.length === variantFields.length && variantFields.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variantFields.map(({ field: variant, index }) => {
            return (
              <TableRow
                key={variant.matrixKey}
              >
                <TableCell className="px-4 py-2">
                  <Checkbox
                    checked={selectedIndices.includes(index)}
                    onCheckedChange={() => toggleSelection(index)}
                  />
                </TableCell>
                <TableCell>
                  <span>{variant.name}</span>
                </TableCell>
                <TableCell className="px-4 py-2">
                  <Controller
                    control={control}
                    name={`product.variants.${index}.sku`}
                    rules={{
                      required: "SKU is required.",
                    }}
                    render={({ field, fieldState }) => (
                      <Field>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Variant SKU"
                          className="w-full"
                        />
                        {fieldState.error && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
