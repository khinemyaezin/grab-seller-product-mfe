import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@khinemyaezin/seller-ui/components/dialog";
import { PricingLineFullSlot } from "./pricing-full-slot";

export type VariantEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantName: string;
  lineIndex: number;
};

export function VariantEditDialog({
  open,
  onOpenChange,
  variantName,
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
            <PricingLineFullSlot
              instanceId={`product.create.pricing:${lineIndex}`}
              skuFieldName={`product.variants.${lineIndex}.sku`}
              pricingLineNum={lineIndex}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
