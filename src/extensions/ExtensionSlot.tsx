import { Suspense, type ComponentType, type ReactNode } from "react";
import { useExtension } from "./extension-registry";
import type { ProductExtensionSlotName } from "./slots";

export type ExtensionSlotProps = {
  name: ProductExtensionSlotName | string;
  props?: Record<string, unknown>;
  fallback?: ReactNode;
};

export default function ExtensionSlot({
  name,
  props,
  fallback = null,
}: ExtensionSlotProps) {
  const Component = useExtension(name) as ComponentType<any> | undefined;
  if (!Component) return <>{fallback}</>;

  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}
