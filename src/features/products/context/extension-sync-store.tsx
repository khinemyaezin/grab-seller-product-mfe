import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { SlotValidateResult } from "@khinemyaezin/seller-ui";
import { ProductContributions } from "../types/catalog.request";
import { DomainSubmitContract, DomainSubmitResult, ExtensionSyncStore, SlotEntry } from "@khinemyaezin/seller-contracts";

const EMPTY_ENTRIES: ReadonlyMap<string, SlotEntry> = new Map();

const inertStore: ExtensionSyncStore<ProductContributions> = {
  registerDomain: () => {},
  runDomainSubmit: () => ({ domains: [], contributions: {} }),
  subscribe: () => () => {},
  getSnapshot: () => EMPTY_ENTRIES,
  getEntry: () => undefined,
  setPayload: () => {},
  prune: () => [],
  clearDomain: () => {},
};

const ExtensionSyncContext = createContext<ExtensionSyncStore<ProductContributions>>(inertStore);

export function ExtensionSyncProvider({ children }: { children: ReactNode }) {
  const contractsRef = useRef(new Map<string, DomainSubmitContract<ProductContributions>>());
  const entriesRef = useRef<ReadonlyMap<string, SlotEntry>>(EMPTY_ENTRIES);
  const listenersRef = useRef(new Set<() => void>());

  const notify = useCallback(() => {
    for (const listener of listenersRef.current) listener();
  }, []);

  const registerDomain = useCallback(
    (domain: string, contract: DomainSubmitContract<ProductContributions> | undefined) => {
      if (contract) {
        contractsRef.current.set(domain, contract);
      } else {
        contractsRef.current.delete(domain);
      }
    },
    [],
  );

  const runDomainSubmit = useCallback(
    (results: SlotValidateResult[]): DomainSubmitResult<ProductContributions> => {
      const registered = [...contractsRef.current.entries()];

      for (const [, contract] of registered) {
        contract.absorb(results);
      }

      const contributions: ProductContributions = {};
      for (const [, contract] of registered) {
        for (const [slice, value] of Object.entries(contract.project())) {
          if (value === undefined) continue;
          Object.assign(contributions, { [slice]: value });
        }
      }

      return {
        domains: registered.map(([domain]) => domain),
        contributions,
      };
    },
    [],
  );

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => entriesRef.current, []);

  const getEntry = useCallback(
    (groupId: string) => entriesRef.current.get(groupId),
    [],
  );

  const setPayload = useCallback(
    (entry: SlotEntry) => {
      const current = entriesRef.current.get(entry.groupId);
      if (
        current &&
        current.domain === entry.domain &&
        Object.is(current.payload, entry.payload)
      ) {
        return;
      }

      const next = new Map(entriesRef.current);
      next.set(entry.groupId, entry);
      entriesRef.current = next;
      notify();
    },
    [notify],
  );

  const prune = useCallback(
    (domain: string, liveGroupIds: ReadonlySet<string>) => {
      const removed: string[] = [];
      for (const [groupId, entry] of entriesRef.current) {
        if (entry.domain !== domain) continue;
        if (liveGroupIds.has(groupId)) continue;
        removed.push(groupId);
      }

      if (removed.length === 0) return removed;

      const next = new Map(entriesRef.current);
      for (const groupId of removed) next.delete(groupId);
      entriesRef.current = next;
      notify();

      return removed;
    },
    [notify],
  );

  const clearDomain = useCallback(
    (domain: string) => {
      const next = new Map(entriesRef.current);
      let changed = false;

      for (const [groupId, entry] of entriesRef.current) {
        if (entry.domain !== domain) continue;
        next.delete(groupId);
        changed = true;
      }

      if (!changed) return;

      entriesRef.current = next;
      notify();
    },
    [notify],
  );

  const store = useMemo<ExtensionSyncStore<ProductContributions>>(
    () => ({
      registerDomain,
      runDomainSubmit,
      subscribe,
      getSnapshot,
      getEntry,
      setPayload,
      prune,
      clearDomain,
    }),
    [
      registerDomain,
      runDomainSubmit,
      subscribe,
      getSnapshot,
      getEntry,
      setPayload,
      prune,
      clearDomain,
    ],
  );

  return (
    <ExtensionSyncContext.Provider value={store}>
      {children}
    </ExtensionSyncContext.Provider>
  );
}

export function useExtensionSyncStore(): ExtensionSyncStore<ProductContributions> {
  return useContext(ExtensionSyncContext);
}

export function useSlotPayload<TPayload>(groupId: string): TPayload | undefined {
  const store = useExtensionSyncStore();

  const getSnapshot = useCallback(
    () => store.getEntry(groupId)?.payload as TPayload | undefined,
    [store, groupId],
  );

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useHasSlotEntries(): boolean {
  const store = useExtensionSyncStore();

  const getSnapshot = useCallback(() => store.getSnapshot().size > 0, [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useDomainSlotEntries<TPayload>(domain: string): SlotEntry<TPayload>[] {
  const store = useExtensionSyncStore();
  const cacheRef = useRef<{
    source: ReadonlyMap<string, SlotEntry>;
    domain: string;
    result: SlotEntry<TPayload>[];
  } | null>(null);

  const getSnapshot = useCallback(() => {
    const source = store.getSnapshot();
    const cached = cacheRef.current;
    if (cached && cached.source === source && cached.domain === domain) {
      return cached.result;
    }

    const result: SlotEntry<TPayload>[] = [];
    for (const entry of source.values()) {
      if (entry.domain !== domain) continue;
      result.push(entry as SlotEntry<TPayload>);
    }

    cacheRef.current = { source, domain, result };
    return result;
  }, [store, domain]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function collectDomainPayloads<TPayload>(
  entries: ReadonlyMap<string, SlotEntry>,
  domain: string,
): Map<string, TPayload> {
  const byGroup = new Map<string, TPayload>();

  for (const [groupId, entry] of entries) {
    if (entry.domain !== domain) continue;
    byGroup.set(groupId, entry.payload as TPayload);
  }

  return byGroup;
}
