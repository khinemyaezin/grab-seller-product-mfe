import { STANDALONE_PRICING_EDIT_GROUP_ID } from "../constants/pricing-instance-id";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { PricingLineEditFullSlot } from "./pricing-edit-full-slot";

export function PricingEditStandalone() {
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