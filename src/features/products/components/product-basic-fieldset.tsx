
import { Input } from "@khinemyaezin/seller-ui/components/index";
import { FieldGroup, Field, FieldLabel, FieldError, FieldSet, FieldLegend, FieldDescription } from "@khinemyaezin/seller-ui/components/field";
import { useFormContext, Controller } from "react-hook-form";
import CategorySearch from "./category-search";
import { ProductFormValue } from "../types";

export default function ProductBasicFieldSet() {
    const { control } = useFormContext<ProductFormValue>();

    return (
        <FieldSet>
            <FieldLegend>Product Information</FieldLegend>
            <FieldDescription>
                Enter the product details and variations.
            </FieldDescription>
            <FieldGroup>
                <div className="grid grid-rows-1 lg:grid-cols-2 gap-4">
                    <Controller
                        control={control}
                        name="product.name"
                        rules={{
                            required: "Product name is required.",
                        }}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="prod-info-name">Title </FieldLabel>
                                <Input
                                    id="prod-info-name"
                                    placeholder="T-shirt"
                                    aria-invalid={fieldState.invalid}
                                    {...field}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Controller
                        control={control}
                        name="product.category"
                        rules={{
                            validate: (value: { id: string } | null) =>
                                value?.id ? true : "Category is required.",
                        }}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="category-search">Category</FieldLabel>
                                <CategorySearch
                                    value={field.value?.name || ""}
                                    onChange={field.onChange}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    </div>
            </FieldGroup>
        </FieldSet>
    );
}
