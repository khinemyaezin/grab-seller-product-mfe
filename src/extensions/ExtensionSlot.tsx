import {
  Suspense,
  useEffect,
  type ComponentType,
  type ReactNode,
} from "react";
import { useExtension } from "./extension-registry";
import { useSlotProvider } from "./slot-provider";
import type { ProductExtensionSlotName } from "./slots";

export type ExtensionSlotProps = {
  name: ProductExtensionSlotName | string;
  props?: Record<string, unknown>;
  fallback?: ReactNode;
};

export default function ExtensionSlot({
  name,
  props,
  fallback,
}: ExtensionSlotProps) {
  const Component = useExtension(name) as ComponentType<any> | undefined;
  const { register } = useSlotProvider();

  const instanceId = props?.instanceId as string | undefined;
  const slotId = (props?.slotId as string | undefined) ?? String(name);

  useEffect(() => {
    if (!instanceId || !Component) return;
    return register({ instanceId, slotId });
  }, [register, instanceId, slotId, Component]);

  if (!Component) return <>{fallback}</>;

  return (
    <Suspense fallback={fallback}>
      <Component {...props} slotId={name} />
    </Suspense>
  );
}
