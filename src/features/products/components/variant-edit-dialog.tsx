import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@khinemyaezin/seller-ui/components/dialog";
import { PricingLineSlot } from "./pricing-line-slot";

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
          <PricingLineSlot
            key={`${lineIndex}:${sku}`}
            sku={sku}
            lineIndex={lineIndex}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
