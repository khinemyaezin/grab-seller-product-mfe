import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  PRODUCT_EXTENSION_SLOTS,
  type SlotHandle,
} from "@khinemyaezin/seller-contracts";
import {
  SlotProvider,
  useSlotProvider,
  useValidateAllSlots,
} from "@khinemyaezin/seller-ui";

function wrapper({ children }: { children: ReactNode }) {
  return <SlotProvider>{children}</SlotProvider>;
}

function useValidateHarness() {
  const { register } = useSlotProvider();
  const validation = useValidateAllSlots();
  return { register, ...validation };
}

function fakeHandle(
  result: Awaited<ReturnType<SlotHandle["validate"]>>,
): SlotHandle {
  return {
    validate: vi.fn(async () => result),
    getValues: () => result.value,
  };
}

describe("useValidateAllSlots", () => {
  it("calls registered handles and returns results without a timeout", async () => {
    const inventory = fakeHandle({
      valid: true,
      value: { sku: "SKU-1", locations: [] },
    });
    const pricing = fakeHandle({
      valid: false,
      errors: { amount: "required" },
    });

    const { result } = renderHook(() => useValidateHarness(), { wrapper });

    act(() => {
      result.current.register({
        groupId: "variant-1",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY,
        handle: inventory,
      });
      result.current.register({
        groupId: "variant-1",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
        handle: pricing,
      });
    });

    let results!: Awaited<ReturnType<typeof result.current.validate>>;
    await act(async () => {
      results = await result.current.validate();
    });

    expect(results).toEqual([
      {
        groupId: "variant-1",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY,
        valid: true,
        value: { sku: "SKU-1", locations: [] },
      },
      {
        groupId: "variant-1",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
        valid: false,
        errors: { amount: "required" },
      },
    ]);
    expect(inventory.validate).toHaveBeenCalledTimes(1);
    expect(pricing.validate).toHaveBeenCalledTimes(1);
    expect(result.current.results).toEqual(results);
    expect(result.current.errors).toEqual({
      "variant-1": { amount: "required" },
    });
  });

  it("fail-closes immediately when a slot has no handle", async () => {
    const { result } = renderHook(() => useValidateHarness(), { wrapper });

    act(() => {
      result.current.register({
        groupId: "variant-2",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY,
      });
    });

    let results!: Awaited<ReturnType<typeof result.current.validate>>;
    await act(async () => {
      results = await result.current.validate();
    });

    expect(results).toEqual([
      {
        groupId: "variant-2",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_INVENTORY,
        valid: false,
      },
    ]);
  });

  it("awaits an in-flight validate instead of returning empty success", async () => {
    let release!: (value: { valid: boolean; value: string }) => void;
    const handle: SlotHandle<string> = {
      validate: vi.fn(
        () =>
          new Promise<{ valid: boolean; value: string }>((resolve) => {
            release = resolve;
          }),
      ),
      getValues: () => "pending",
    };

    const { result } = renderHook(() => useValidateHarness(), { wrapper });

    act(() => {
      result.current.register({
        groupId: "variant-3",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
        handle,
      });
    });

    const first = result.current.validate();
    const second = result.current.validate();
    expect(second).toBe(first);
    expect(handle.validate).toHaveBeenCalledTimes(1);

    await act(async () => {
      release({ valid: true, value: "ok" });
      await first;
    });

    await expect(second).resolves.toEqual([
      {
        groupId: "variant-3",
        slotId: PRODUCT_EXTENSION_SLOTS.CREATE_PRICING,
        valid: true,
        value: "ok",
      },
    ]);
  });
});
