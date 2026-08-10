import type {
  ExtensionFieldErrors,
  PlatformEvents,
} from "@khinemyaezin/seller-contracts";
import type { RegisteredSlot } from "./slot-provider";

const DEFAULT_VALIDATE_TIMEOUT_MS = 3000;

export type SlotValidateResult = {
  instanceId: string;
  slotId: string;
  valid: boolean;
  value?: unknown;
  errors?: ExtensionFieldErrors;
};

export function requestValidate(
  events: PlatformEvents,
  slot: RegisteredSlot,
  timeoutMs = DEFAULT_VALIDATE_TIMEOUT_MS,
): Promise<SlotValidateResult> {
  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe = () => {};

    const finish = (result: SlotValidateResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      unsubscribe();
      resolve(result);
    };

    const timer = window.setTimeout(() => {
      finish({
        instanceId: slot.instanceId,
        slotId: slot.slotId,
        valid: false,
      });
    }, timeoutMs);

    unsubscribe = events.subscribe("extension:validated:v1", (msg) => {
      if (msg.instanceId !== slot.instanceId) return;
      finish({
        instanceId: slot.instanceId,
        slotId: slot.slotId,
        valid: msg.valid,
        value: msg.payload,
        errors: msg.errors,
      });
    });

    // events.emit("extension:validate:v1", {
    //   instanceId: slot.instanceId,
    //   slotId: slot.slotId,
    // });
  });
}

export function validateAllSlots(
  events: PlatformEvents,
  slots: RegisteredSlot[],
  timeoutMs = DEFAULT_VALIDATE_TIMEOUT_MS,
): Promise<SlotValidateResult[]> {
  return Promise.all(
    slots.map((slot) => requestValidate(events, slot, timeoutMs)),
  );
}
