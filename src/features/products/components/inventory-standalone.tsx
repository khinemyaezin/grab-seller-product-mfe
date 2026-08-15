import { STANDALONE_INVENTORY_GROUP_ID } from "../constants/inventory-group-id";
import { Card, CardContent } from "@khinemyaezin/seller-ui/components/card";
import { InventoryLineFullSlot } from "./inventory-full-slot";

export function InventoryStandalone() {
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
