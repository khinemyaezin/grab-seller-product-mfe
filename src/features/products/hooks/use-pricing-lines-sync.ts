import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { PricingLineFormValue, ProductFormValue } from "@/features/products/types";
import { usePlatform } from "@khinemyaezin/seller-ui";
import { EventEnvelope, PricingPayload } from "@khinemyaezin/seller-contracts";

const PRICING_INSTANCE_PREFIX = "product.create.pricing:";

function pricingLinesEqual(
  a: PricingLineFormValue,
  b: PricingLineFormValue,
): boolean {
  return (
    a.sku === b.sku &&
    a.amount === b.amount &&
    a.currencyCode === b.currencyCode &&
    (a.title ?? "") === (b.title ?? "") &&
    (a.minQuantity ?? null) === (b.minQuantity ?? null) &&
    (a.maxQuantity ?? null) === (b.maxQuantity ?? null)
  );
}

function isStandaloneMode(variationTypes: unknown[] | undefined): boolean {
  return !variationTypes || variationTypes.length === 0;
}

function slotNameFromEvent(event: EventEnvelope<PricingPayload>): string | undefined {
  const id = event.instanceId?.trim();
  if (!id?.startsWith(PRICING_INSTANCE_PREFIX)) return undefined;
  return id.slice(PRICING_INSTANCE_PREFIX.length);
}

function resolveLineIndex(
  event: EventEnvelope<PricingPayload>,
  variationTypes: ProductFormValue["variationTypes"],
): number | null {
  if (isStandaloneMode(variationTypes)) {
    return 0;
  }

  const name = slotNameFromEvent(event);
  if (!name || name === "standalone") return null;

  const match = /^pricing\.(\d+)$/.exec(name);
  if (!match) return null;

  const index = Number(match[1]);
  return Number.isFinite(index) ? index : null;
}

function toFormLine(
  payload: PricingPayload,
  previous?: PricingLineFormValue,
): PricingLineFormValue {
  return {
    sku: payload.sku,
    currencyCode: payload.currencyCode,
    amount: payload.amount,
    title: previous?.title,
    minQuantity: previous?.minQuantity,
    maxQuantity: previous?.maxQuantity,
  };
}

function toHydratePayload(line: PricingLineFormValue): PricingPayload {
  return {
    sku: line.sku,
    currencyCode: line.currencyCode || "USD",
    amount: line.amount === "" || line.amount == null ? 0 : Number(line.amount),
  };
}

export function usePricingLinesSync() {
  const { control, getValues, setValue } = useFormContext<ProductFormValue>();
  const platform = usePlatform();
  const events = platform?.events;

  const pricingLines = useWatch({ control, name: "pricingLines" });
  const variationTypes = useWatch({ control, name: "variationTypes" });
  const standaloneSku = useWatch({
    control,
    name: "product.standaloneVariant.sku",
  });

  const { append } = useFieldArray({ control, name: "pricingLines" });
  const previousPricingLines = useRef<PricingLineFormValue[]>([]);

  useEffect(() => {
    if (!events) return;
    if (!isStandaloneMode(variationTypes)) return;

    const sku = standaloneSku?.trim() ?? "";
    if (!sku) return;

    const lines = getValues("pricingLines") ?? [];
    const current = lines[0];
    const next: PricingLineFormValue = current
      ? { ...current, sku }
      : { sku, currencyCode: "USD", amount: 0 };

    if (!current) {
      append(next);
    } else if (current.sku !== sku) {
      setValue("pricingLines.0", next, { shouldDirty: true });
    }

    events.setState("extension:pricing:hydrate:v1", {
      producerId: "host",
      instanceId: `${PRICING_INSTANCE_PREFIX}standalone`,
      payload: toHydratePayload(next),
    });
  }, [standaloneSku, variationTypes, events, getValues, setValue, append]);

  useEffect(() => {
    if (!events || !pricingLines) return;

    const standalone = isStandaloneMode(variationTypes);

    pricingLines.forEach((line, index) => {
      const prev = previousPricingLines.current[index];
      if (prev && pricingLinesEqual(prev, line)) return;
      if (!line.sku?.trim()) return;

      const instanceId = standalone ? "standalone" : `pricing.${index}`;

      events.setState("extension:pricing:hydrate:v1", {
        producerId: "host",
        instanceId: `${PRICING_INSTANCE_PREFIX}${instanceId}`,
        payload: toHydratePayload(line),
      });
    });

    previousPricingLines.current = pricingLines;
  }, [pricingLines, variationTypes, events]);

  useEffect(() => {
    if (!events) return;

    const unsub = events.subscribe( "extension:pricing:updated:v1", (event: EventEnvelope<PricingPayload>) => {
        const types = getValues("variationTypes") ?? [];
        const index = resolveLineIndex(event, types);
        if (index === null) return;

        const current = getValues("pricingLines") ?? [];
        const previous = current[index];
        const next = toFormLine(event.payload, previous);

        if (previous && pricingLinesEqual(previous, next)) return;

        if (previous) {
          setValue(`pricingLines.${index}`, next, {
            shouldDirty: true,
            shouldTouch: true,
          });
        } else if (index === current.length) {
          append(next);
        } else {
          const padded = [...current];
          while (padded.length < index) {
            padded.push({ sku: "", currencyCode: "USD", amount: 0 });
          }
          padded[index] = next;
          setValue("pricingLines", padded, { shouldDirty: true });
        }

        const slotName = isStandaloneMode(types)
          ? "standalone"
          : `pricing.${index}`;

        events.setState("extension:pricing:hydrate:v1", {
          producerId: "host",
          instanceId: `${PRICING_INSTANCE_PREFIX}${slotName}`,
          payload: toHydratePayload(next),
        });
      },
    );

    return () => unsub();
  }, [events, getValues, setValue, append]);
}