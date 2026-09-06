import { useCallback, useState } from "react";
import { usePlatform } from "@khinemyaezin/seller-ui";
import type { ProductLifecycleEvent } from "@/features/products/types";
import { formatExtensionErrorsForToast } from "@/features/products/utils/error-formatter";

export function useProductEditEvents() {
  const platform = usePlatform();
  const [title, setTitle] = useState<string | undefined>();

  const toast = useCallback(
    (type: "success" | "error", message: string, description?: string) => {
      platform?.events.emit("shell:toast:v1", {
        type,
        message,
        description,
        position: "top-center",
      });
    },
    [platform?.events],
  );

  const handleEvent = useCallback(
    (event: ProductLifecycleEvent) => {
      switch (event.type) {
        case "titleResolved":
          setTitle(event.title);
          break;
        case "updated":
          toast("success", "Product updated");
          break;
        case "updateFailed":
          toast("error", "Failed to update product");
          break;
        case "updateTimedOut":
          toast("error", "Product update is still running. Check back shortly.");
          break;
        case "validationFailed": {
          const { message, description } = formatExtensionErrorsForToast(
            event.errors,
            event.name ?? "Validation failed",
          );
          toast("error", message, description);
          break;
        }
        case "archived":
          toast("success", "Product archived successfully");
          break;
        case "archiveFailed":
          toast("error", "Failed to archive product");
          break;
        case "restored":
          toast("success", "Product restored successfully");
          break;
        case "restoreFailed":
          toast("error", "Failed to restore product");
          break;
        case "published":
          toast("success", "Product published successfully");
          break;
        case "publishFailed":
          toast("error", event.name ?? "Failed to publish product");
          break;
      }
    },
    [toast],
  );

  return {
    title,
    handleEvent,
    toast,
  };
}
