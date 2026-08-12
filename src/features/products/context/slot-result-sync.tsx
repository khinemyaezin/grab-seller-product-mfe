import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";

export type SlotResultsSyncHandler = (results: SlotValidateResult[]) => void;

export type SlotResultSyncRegistry = {
  registerSync: (key: string, handler: SlotResultsSyncHandler | undefined) => void;
  syncValidated: (results: SlotValidateResult[]) => void;
};

const SlotResultSyncContext = createContext<SlotResultSyncRegistry | undefined>(
  undefined,
);

export function SlotResultSyncProvider({ children }: { children: ReactNode }) {
  const handlersRef = useRef(new Map<string, SlotResultsSyncHandler>());

  const registerSync = useCallback(
    (key: string, handler: SlotResultsSyncHandler | undefined) => {
      if (handler) {
        handlersRef.current.set(key, handler);
      } else {
        handlersRef.current.delete(key);
      }
    },
    [],
  );

  const syncValidated = useCallback((results: SlotValidateResult[]) => {
    for (const handler of handlersRef.current.values()) {
      handler(results);
    }
  }, []);

  const value = useMemo(
    () => ({ registerSync, syncValidated }),
    [registerSync, syncValidated],
  );

  return (
    <SlotResultSyncContext.Provider value={value}>
      {children}
    </SlotResultSyncContext.Provider>
  );
}

export function useSlotResultSync(): SlotResultSyncRegistry | undefined {
  return useContext(SlotResultSyncContext);
}
