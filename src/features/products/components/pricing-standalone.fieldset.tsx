import { Field, FieldTitle } from "@khinemyaezin/seller-ui/components/field";
import { STANDALONE_PRICING_INSTANCE_ID } from "../constants/pricing-instance-id";
import { PricingInlineSlot } from "./pricing-inline-slot";

export function PricingStandaloneFieldSet() {
    return (
        <Field>
            <FieldTitle>Pricing</FieldTitle>
            <PricingInlineSlot
                instanceId={STANDALONE_PRICING_INSTANCE_ID}
            />
        </Field>

    )
}