import { PRODUCT_EXTENSION_SLOTS } from "@khinemyaezin/seller-contracts";
import { ExtensionSlot } from "@khinemyaezin/seller-ui";
import { FieldSet, FieldLegend, FieldDescription } from "@khinemyaezin/seller-ui/components/field";

export type InventoryFullEditSlotProps = {
    groupId: string
};

export function InventoryFullEditSlot({ groupId }: InventoryFullEditSlotProps) {
    return (
        <FieldSet>
            <FieldLegend>Inventory</FieldLegend>
            <FieldDescription>
                Set stock by location. Confirm a stock operation, then save the product.
            </FieldDescription>

            <ExtensionSlot
                name={PRODUCT_EXTENSION_SLOTS.EDIT_INVENTORY}
                fallback={(<p>Unable to load inventory</p>)}
                props={{
                    groupId,
                }}
            />
        </FieldSet>
    );
}