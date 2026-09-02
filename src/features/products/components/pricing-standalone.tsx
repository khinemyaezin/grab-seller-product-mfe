import { STANDALONE_PRICING_INSTANCE_ID } from "../constants/pricing-instance-id";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { PricingLineFullSlot } from "./pricing-full-slot";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValue } from "../types";

export function PricingStandalone() {
    const { control } = useFormContext<ProductFormValue>();
    const isStandalone = useWatch({
        control,
        name: "variationTypes",
        compute: (value) => value.length == 0
    })

    if (!isStandalone) return;
    
    return (
        <Card>
            <CardContent>
                <PricingLineFullSlot
                    groupId={STANDALONE_PRICING_INSTANCE_ID}
                />
            </CardContent>
        </Card>
    )
}