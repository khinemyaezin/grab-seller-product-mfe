import { Control, UseFormReturn, useWatch } from "react-hook-form";
import { ProductFormValue, ProductLifecycleEvent } from "../types";
import { useEffect } from "react";

type UseProductNameWatchProps = {
    control: Control<ProductFormValue>;
    onLifecycleEvent?: (event: ProductLifecycleEvent) => void;
};
export default function useProductNameWatch({
    control,
    onLifecycleEvent,
}: UseProductNameWatchProps) {
    const name = useWatch({
        control,
        name: "product.name",
    });

    useEffect(() => {
        if (name !== undefined) {
            onLifecycleEvent?.({ type: "titleResolved", title: name });
        }
    }, [name, onLifecycleEvent]);
}