import { STANDALONE_PRICING_EDIT_GROUP_ID } from "../constants/pricing-instance-id";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { PricingLineEditFullSlot } from "./pricing-edit-full-slot";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValue } from "../types";

export function PricingEditStandalone() {
    const { control } = useFormContext<ProductFormValue>();
    const isStandalone = useWatch({
        control,
        name: "variationTypes",
        compute: (value) => value.length == 0
    })

    if(!isStandalone) return;

    return (
        <Card>
            <CardContent>
                <PricingLineEditFullSlot
                    groupId={STANDALONE_PRICING_EDIT_GROUP_ID}
                />
            </CardContent>
        </Card>
    )
}