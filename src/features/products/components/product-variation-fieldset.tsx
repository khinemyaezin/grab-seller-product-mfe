import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@khinemyaezin/seller-ui/components/field";
import { useFieldArray, useFormContext } from "react-hook-form";
import { VariantTable } from "./variant-table";
import { Plus } from "lucide-react";
import { Item, ItemActions, ItemContent, ItemTitle } from "@khinemyaezin/seller-ui/components/item";
import { useMatrixSync } from "@/features/products/hooks/use-matrix-sync";
import type { ProductFormValue } from "@/features/products/types";
import ProductStandaloneVariantField from "./product-standalone-field";
import { VariationTypeField } from "./product-variation-type-field";

export default function ProductVariationFieldSet() {
    const { control, getValues } = useFormContext<ProductFormValue>();
    const { fields, remove, append } = useFieldArray({
        control,
        name: "variationTypes"
    });

    useMatrixSync();

    const handleAddType = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        append({ uuid: "", name: "", options: [] });
    }

    return (
        <FieldSet>
            <FieldLegend>Variations</FieldLegend>
            <FieldDescription>Define variant types and their options, then generate all combinations.</FieldDescription>
            <div className="rounded-xl border overflow-hidden">
                {fields.length == 0 && (
                    <FieldGroup className="p-6 border-b">
                        <ProductStandaloneVariantField
                            name="product.standaloneVariant.sku"
                            rules={{
                                required: "SKU is required"
                            }} />
                    </FieldGroup>
                )}
                {fields.length !== 0 && (
                    <FieldGroup className="gap-0">
                        {fields.map((_field, typeIndex) =>
                            <VariationTypeField
                                key={_field.id}
                                index={typeIndex}
                                onRemove={() => remove(typeIndex)}
                                control={control}
                                name={`variationTypes.${typeIndex}`}
                                getValues={getValues}
                            />)}
                    </FieldGroup>
                )}
                <Item asChild size="sm" className="rounded-none cursor-pointer hover:bg-muted transition-colors">
                    <button type="button" onClick={handleAddType}>
                        <ItemActions>
                            <Plus />
                        </ItemActions>
                        <ItemContent>
                            <ItemTitle>
                                {fields.length == 0 ? "Add variation" : "Add another option"}
                            </ItemTitle>
                        </ItemContent>
                    </button>
                </Item>
            </div>
            {fields.length !== 0 && (
                <VariantTable onAllVariantsDeleted={() => remove()} />
            )}
        </FieldSet>
    );
}
