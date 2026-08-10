import { ExtensionSlot, PRODUCT_EXTENSION_SLOTS } from "@/extensions";

export type PricingLineSlotProps = {
  instanceId: string
};

export function PricingInlineSlot({ instanceId }: PricingLineSlotProps) {
  return (
    <div className="max-w-sm">
      <ExtensionSlot
        name={PRODUCT_EXTENSION_SLOTS.CREATE_PRICING_INLINE}
        props={{
          instanceId,
        }}
      />
    </div>
  );
}
