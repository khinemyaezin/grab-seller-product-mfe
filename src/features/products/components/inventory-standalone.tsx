import { STANDALONE_INVENTORY_GROUP_ID } from "../constants/inventory-group-id";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { InventoryLineFullSlot } from "./inventory-full-slot";
import { ProductFormValue } from "../types";
import { useFormContext, useWatch } from "react-hook-form";

export function InventoryStandalone() {
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
                <InventoryLineFullSlot
                    groupId={STANDALONE_INVENTORY_GROUP_ID}
                />
            </CardContent>
        </Card>
    )
}
