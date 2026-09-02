import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import { STANDALONE_INVENTORY_EDIT_GROUP_ID } from "../constants/inventory-group-id";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@khinemyaezin/seller-ui/components/card";

export function InventoryEditStandalone() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                    Set stock by location. Confirm a stock operation, then save the product.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <ExtensionSlot
                    name={PRODUCT_EXTENSION_SLOTS.EDIT_INVENTORY}
                    fallback={(<p>Unable to load inventory</p>)}
                    props={{
                        STANDALONE_INVENTORY_EDIT_GROUP_ID,
                    }}
                />
            </CardContent>
        </Card>
    );
}