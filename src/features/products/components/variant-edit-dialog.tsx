import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@khinemyaezin/seller-ui/components/dialog";
import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";

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
        <ExtensionSlot
          name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING}
          props={{ sku, lineIndex }}
        />
      </DialogContent>
    </Dialog>
  );
}
