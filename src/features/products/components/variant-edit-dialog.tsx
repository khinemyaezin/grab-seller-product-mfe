import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@khinemyaezin/seller-ui/components/dialog";
import { PricingLineFullSlot } from "./pricing-full-slot";
import { pricingInstanceId } from "@/features/products/constants/pricing-instance-id";
import { Separator } from "@khinemyaezin/seller-ui/components/separator";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValue } from "../types";

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
  const { control } = useFormContext<ProductFormValue>();
  const sku = useWatch({
    control,
    name: "product.variants",
    compute: (variants) =>
      (variants ?? []).find((variant) => variant.matrixKey === matrixKey)?.sku ?? "",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>{`Edit ${variantName}`}</DialogTitle>
        </DialogHeader>
        {open ? (
          <div className="flex flex-col gap-6">
            <PricingLineFullSlot
              groupId={pricingInstanceId(matrixKey)}
              context={{ sku }}
            />
          </div>
        ) : null}
        <Separator/>
        <div >
          <span className="text-muted-foreground">Save the product to edit more variant details.</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
