import type { ReactNode } from "react";
import {
  ExtensionRegistryContext,
  type ExtensionRegistry,
} from "./extension-registry";

export type ExtensionProviderProps = {
  extensions?: ExtensionRegistry;
  children: ReactNode;
};

export default function ExtensionProvider({
  extensions,
  children,
}: ExtensionProviderProps) {
  return (
    <ExtensionRegistryContext.Provider value={extensions ?? {}}>
      {children}
    </ExtensionRegistryContext.Provider>
  );
}
