import { STANDALONE_PRICING_INSTANCE_ID } from "../constants/pricing-instance-id";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { PricingLineFullSlot } from "./pricing-full-slot";

export function PricingStandalone() {
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