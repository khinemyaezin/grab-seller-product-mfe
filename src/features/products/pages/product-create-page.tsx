
import ProductNewForm from "@/features/products/components/product-new-form";
import { Header } from "@khinemyaezin/seller-ui/layout/header";
import { Button } from "@khinemyaezin/seller-ui/components/index";
import { ButtonGroup } from "@khinemyaezin/seller-ui/components/button-group";
import { usePlatform } from "@khinemyaezin/seller-ui";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import type { ProductLifecycleEvent } from "@/features/products/types";
import { useCatalogLink } from "../hooks/use-root";

export type ProductCreatePageProps = {};

export default function NewProductPage({ }: ProductCreatePageProps) {
  const platform = usePlatform();
  const canCreate = !!useCatalogLink("createProduct");

  const toast = (type: "success" | "error", message: string) =>
    platform?.events.publish("shell:toast:v1", { type, message, position: "top-center" });

  const handleEvent = (event: ProductLifecycleEvent) => {
    switch (event.type) {
      case "created":
        toast("success", "Product create started");
        break;
      case "createFailed":
        toast("error", "Failed to create product. Check pricing and inventory.");
        break;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Header
        title="Add Product"
        description="Add a new product to your seller catalog."
      >
        <ButtonGroup>
          <Button type="button" variant="secondary" asChild>
            <Link to="..">
              <ArrowLeftIcon />
            </Link>
          </Button>
        </ButtonGroup>
      </Header>
      {canCreate && (
        <ProductNewForm
          onLifecycleEvent={handleEvent}
        />
      )}
    </div>
  );
}
