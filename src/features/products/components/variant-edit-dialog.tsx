import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@khinemyaezin/seller-ui/components/dialog";
import { PricingLineSlot } from "./pricing-line-slot";
import { InventoryLineSlot } from "./inventory-line-slot";

export type VariantEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantName: string;
  sku: string;
  lineIndex: number;
};

export function VariantEditDialog({
  open,
  onOpenChange,
  variantName,
  sku,
  lineIndex,
}: VariantEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{`Edit ${variantName}`}</DialogTitle>
        </DialogHeader>
        {open ? (
          <div className="flex flex-col gap-6">
            <PricingLineSlot
              key={`pricing:${lineIndex}:${sku}`}
              sku={sku}
              name={`pricingLines.${lineIndex}`}
            />
            <InventoryLineSlot
              key={`inventory:${lineIndex}:${sku}`}
              sku={sku}
              lineIndex={lineIndex}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
