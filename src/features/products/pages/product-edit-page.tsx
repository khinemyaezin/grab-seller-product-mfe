import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "@khinemyaezin/seller-ui/layout/header";
import { SlotProvider, usePlatform, useShellBreadcrumb } from "@khinemyaezin/seller-ui";
import { useCatalogLink } from "@/features/products/hooks/use-root";
import ProductEditForm from "@/features/products/components/product-edit-form";
import { ExtensionSyncProvider } from "@/features/products/context/extension-sync-store";
import { useProductEditEvents } from "@/features/products/hooks/use-product-edit-events";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const canEdit = !!useCatalogLink("getProduct");
  const platform = usePlatform();
  const { title, handleEvent } = useProductEditEvents();
  useShellBreadcrumb(title);

  useEffect(() => {
    if (!platform?.events) return;
    const unsubs = [
      platform?.events.subscribe("form:discard:v1", () => {
        navigate("..");
      }),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, [navigate, platform?.events]);

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <Header
        title="Edit Product"
        description="Update your product details."
      />
      <SlotProvider>
        <ExtensionSyncProvider>
          {canEdit && (
            <ProductEditForm productId={productId!} onLifecycleEvent={handleEvent} />
          )}
        </ExtensionSyncProvider>
      </SlotProvider>
    </div>
  );
}
