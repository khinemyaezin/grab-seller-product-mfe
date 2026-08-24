import { HateoasLink, resolveLink } from "@khinemyaezin/seller-api";
import { useProductDeleteMutation, useProductRestoreMutation } from "../hooks/use-products";
import { ProductLifecycleEvent } from "../types";
import { Archive, RotateCcw } from "lucide-react";
import { Button, ButtonStatus } from "@khinemyaezin/seller-ui/components/index";

export type ActionButtonGroupProps = {
    links?: Record<string, HateoasLink>;
    onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
}

export default function ActionButtonGroup({ links, onLifecycleEvent }: ActionButtonGroupProps) {
    const productDeleteLink = resolveLink(links, "delete-product");
    const productRestoreLink = resolveLink(links, "restore-product");

    const deleteProductMutation = useProductDeleteMutation();
    const restoreProductMutation = useProductRestoreMutation();

    function handleArchive() {
        if (!productDeleteLink) return;
        deleteProductMutation.mutate(
            { link: productDeleteLink },
            {
                onSuccess: () => { onLifecycleEvent?.({ type: "archived" }); deleteProductMutation.reset() },
                onError: () => { onLifecycleEvent?.({ type: "archiveFailed" }); deleteProductMutation.reset() },
            },
        );
    }

    function handleOnRestore() {
        if (!productRestoreLink) return;
        restoreProductMutation.mutate(
            { link: productRestoreLink },
            {
                onSuccess: () => { onLifecycleEvent?.({ type: "restored" }); restoreProductMutation.reset() },
                onError: () => { onLifecycleEvent?.({ type: "restoreFailed" }); restoreProductMutation.reset() },
            },
        );
    }

    const actionButtons = [
        {
            show: productRestoreLink,
            onClick: handleOnRestore,
            mutation: restoreProductMutation,
            variant: "secondary" as const,
            pendingLabel: "Restoring",
            successLabel: "Restored",
            label: "Restore",
            Icon: RotateCcw
        },
        {
            show: productDeleteLink,
            onClick: handleArchive,
            mutation: deleteProductMutation,
            variant: "destructive" as const,
            pendingLabel: "Archiving",
            successLabel: "Archived",
            label: "Archive",
            Icon: Archive
        }
    ].reduce<React.ReactNode[]>((acc, btn, index) => {
        if (btn.show) {
            acc.push(
                <Button
                    key={index}
                    type="button"
                    variant={btn.variant}
                    disabled={btn.mutation.isPending || btn.mutation.isSuccess}
                    onClick={btn.onClick}>
                    <ButtonStatus
                        status={
                            btn.mutation.isPending
                                ? "pending"
                                : btn.mutation.isSuccess
                                    ? "success"
                                    : "idle"
                        }
                        pendingLabel={btn.pendingLabel}
                        successLabel={btn.successLabel}>
                        <btn.Icon className="mr-1 h-4 w-4" />
                        {btn.label}
                    </ButtonStatus>
                </Button>
            );
        }
        return acc;
    }, []);

    return (
        actionButtons.map(btn => btn)
    )
}