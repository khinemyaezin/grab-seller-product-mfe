import type { FieldPathValue, UseFormReturn } from "react-hook-form";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import type { ProductFormValue } from "@/features/products/types";

export type SlotLineStoreKey = "pricingLines" | "inventoryLines";

type LineOf<K extends SlotLineStoreKey> = ProductFormValue[K][number];

/**
 * Contract an extension family implements so the host can turn its validated
 * slot payloads into form lines. Supporting a new family means adding another
 * contribution, not editing the merge below.
 */
export type SlotLineContribution<K extends SlotLineStoreKey> = {
  storeKey: K;
  ownsSlot: (slotId: string) => boolean;
  toLine: (value: unknown) => LineOf<K> | null;
  identityOf: (line: LineOf<K>) => string;
};

export function collectValidatedLines<K extends SlotLineStoreKey>(
  contribution: SlotLineContribution<K>,
  results: SlotValidateResult[],
): LineOf<K>[] {
  const lines: LineOf<K>[] = [];

  for (const result of results) {
    if (!result.valid) continue;
    if (!contribution.ownsSlot(result.slotId)) continue;

    const line = contribution.toLine(result.value);
    if (line) lines.push(line);
  }

  return lines;
}

export function upsertLines<K extends SlotLineStoreKey>(
  contribution: SlotLineContribution<K>,
  current: LineOf<K>[],
  incoming: LineOf<K>[],
): LineOf<K>[] {
  const merged = [...current];

  for (const line of incoming) {
    const identity = contribution.identityOf(line);
    const index = merged.findIndex(
      (existing) => contribution.identityOf(existing) === identity,
    );

    if (index >= 0) merged[index] = line;
    else merged.push(line);
  }

  return merged;
}

export function syncValidatedLines<K extends SlotLineStoreKey>(
  form: UseFormReturn<ProductFormValue>,
  contribution: SlotLineContribution<K>,
  results: SlotValidateResult[],
): void {
  const incoming = collectValidatedLines(contribution, results);
  if (incoming.length === 0) return;

  const current = (form.getValues(contribution.storeKey) ?? []) as LineOf<K>[];

  form.setValue(
    contribution.storeKey,
    upsertLines(contribution, current, incoming) as FieldPathValue<ProductFormValue, K>,
    { shouldDirty: true },
  );
}
