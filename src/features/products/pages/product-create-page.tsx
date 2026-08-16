
import ProductNewForm from "@/features/products/components/product-new-form";
import { ExtensionSyncProvider } from "@/features/products/context/extension-sync-store";
import { Header } from "@khinemyaezin/seller-ui/layout/header";
import { SlotProvider, usePlatform } from "@khinemyaezin/seller-ui";
import { useNavigate } from "react-router";
import type { ProductLifecycleEvent } from "@/features/products/types";
import { formatExtensionErrorsForToast } from "@/features/products/utils/error-formatter";
import { useCatalogLink } from "../hooks/use-root";
import { useEffect } from "react";

export type ProductCreatePageProps = {};

export default function NewProductPage({ }: ProductCreatePageProps) {
  const platform = usePlatform();
  const negivate = useNavigate();
  const createSellableProductLink = useCatalogLink("createSellableProduct");

  const toast = (
    type: "success" | "error" | "info" | "warning",
    message: string,
    description?: string,
  ) =>
    platform?.events.emit("shell:toast:v1", {
      type,
      message,
      description,
      position: "top-center",
    });

  const handleEvent = (event: ProductLifecycleEvent) => {
    switch (event.type) {
      case "created":
        toast("success", "Product create started");
        break;
      case "createFailed":
        toast("error", "Failed to create product. Check pricing and inventory.");
        break;
      case "validationFailed": {
        const { message, description } = formatExtensionErrorsForToast(
          event.errors,
          event.name ?? "Validation failed",
        );
        toast("error", message, description);
        break;
      }
    }
  };

  useEffect(() => {
    if (!platform?.events) return;
    const unsubs = [
      platform?.events.subscribe("form:discard:v1", (msg) => {
        negivate("..")
      })
    ]
    return () => unsubs.forEach((unsub) => unsub());

  }, [platform?.events])

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Header
        title="Add Product"
        description="Add a new product to your seller catalog."
      >
      </Header>
      {createSellableProductLink && (
        <SlotProvider>
          <ExtensionSyncProvider>
            <ProductNewForm
              link={createSellableProductLink}
              onLifecycleEvent={handleEvent}
            />
          </ExtensionSyncProvider>
        </SlotProvider>
      )}
    </div>
  );
}
