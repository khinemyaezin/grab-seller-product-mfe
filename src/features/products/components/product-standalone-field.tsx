import { Input } from "@khinemyaezin/seller-ui/components/index";
import { useController, UseControllerProps } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@khinemyaezin/seller-ui/components/field";
import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";

export default function ProductStandaloneVariantField({ ...props }: UseControllerProps) {
    const { field, fieldState } = useController(props);
    return (
        <div className="grid gap-4">
            <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="input-standalone-sku">SKU (Stock Keeping Unit)</FieldLabel>
                <Input
                    id="input-standalone-sku"
                    aria-invalid={fieldState.invalid}
                    {...field}
                />
                {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                )}
            </Field>
            <ExtensionSlot
                name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING}
                props={{ sku: field.value ?? "", lineIndex: 0 }}
            />
        </div>
    );
}
