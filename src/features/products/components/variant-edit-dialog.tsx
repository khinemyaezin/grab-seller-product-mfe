import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@khinemyaezin/seller-ui/components/dialog";
import { PricingLineFullSlot } from "./pricing-full-slot";
import { pricingInstanceId } from "@/features/products/constants/pricing-instance-id";

export type VariantEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantName: string;
  matrixKey: string;
};

export function VariantEditDialog({
  open,
  onOpenChange,
  variantName,
  matrixKey,
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
              groupId={pricingInstanceId(matrixKey)}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
