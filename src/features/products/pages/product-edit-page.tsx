import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import { ButtonGroup } from "@khinemyaezin/seller-ui/components/button-group";
import { Button } from "@khinemyaezin/seller-ui/components/button";
import { Header } from "@khinemyaezin/seller-ui/layout/header";
import { usePlatform, useShellBreadcrumb } from "@khinemyaezin/seller-ui";
import { useCatalogLink } from "@/features/products/hooks/use-root";
import ProductEditForm from "@/features/products/components/product-edit-form";
import type { ProductLifecycleEvent } from "@/features/products/types";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const canEdit = !!useCatalogLink("getProduct");
  const platform = usePlatform();
  const [title, setTitle] = useState<string | undefined>();

  useShellBreadcrumb(title);

  const toast = (type: "success" | "error", message: string) =>
    platform?.events.publish("shell:toast:v1", { type, message, position: "top-center" });

  const handleEvent = (event: ProductLifecycleEvent) => {
    switch (event.type) {
      case "titleResolved": setTitle(event.title); break;
      case "updated": toast("success", "Product updated successfully"); break;
      case "updateFailed": toast("error", "Failed to update product"); break;
      case "archived": toast("success", "Product archived successfully"); break;
      case "archiveFailed": toast("error", "Failed to archive product"); break;
      case "restored": toast("success", "Product restored successfully"); break;
      case "restoreFailed": toast("error", "Failed to restore product"); break;
      case "published": toast("success", "Product published successfully"); break;
      case "publishFailed": toast("error", event.name?? "Failed to publish product"); break;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <Header
        title="Edit Product"
        description="Update your product details."
      >
        <ButtonGroup>
          <Button type="button" variant="secondary" asChild>
            <Link to=".." className="flex gap-2 items-center">
              <ArrowLeftIcon />
            </Link>
          </Button>
        </ButtonGroup>
      </Header>
      {canEdit && <ProductEditForm productId={productId!} onLifecycleEvent={handleEvent} />}
    </div>
  );
}
