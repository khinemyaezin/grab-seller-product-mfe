import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type RegisteredSlot = {
  instanceId: string;
  slotId: string;
};

export type SlotProviderApi = {
  register: (slot: RegisteredSlot) => () => void;
  list: () => RegisteredSlot[];
};

const noopUnregister = () => {};

const defaultApi: SlotProviderApi = {
  register: () => noopUnregister,
  list: () => [],
};

const SlotProviderContext = createContext<SlotProviderApi | null>(null);

export type SlotProviderProps = {
  children: ReactNode;
};

export function SlotProvider({ children }: SlotProviderProps) {
  const slotsRef = useRef(new Map<string, RegisteredSlot>());

  const register = useCallback((slot: RegisteredSlot) => {
    slotsRef.current.set(slot.instanceId, slot);
    return () => {
      slotsRef.current.delete(slot.instanceId);
    };
  }, []);

  const list = useCallback(() => Array.from(slotsRef.current.values()), []);

  const api = useMemo<SlotProviderApi>(() => ({ register, list }), [register, list]);

  return (
    <SlotProviderContext.Provider value={api}>
      {children}
    </SlotProviderContext.Provider>
  );
}

export function useSlotProvider(): SlotProviderApi {
  return useContext(SlotProviderContext) ?? defaultApi;
}
