import type { VariationMatrixRequest, VariationMatrixResponse, Variant, VariationType } from "@/features/products/types";

export function buildMatrixRequest(
    types: VariationType[],
    existing: Variant[] | null,
): VariationMatrixRequest {
    return {
        variantTypes: types
            .filter((type) => !!type?.uuid)
            .map((type) => ({
                typeId: type.uuid,
                options: (type.options ?? [])
                    .filter((option) => !!option?.uuid)
                    .map((option) => ({
                        optionId: option.uuid,
                    })),
            }))
            .filter((type) => type.options.length > 0),
        variants: existing == null
            ? []
            : existing.filter(Boolean).map((v) => ({
                matrixKey: v.matrixKey,
                variations: (v.variations ?? []).map((vv) => ({
                    optionId: vv.optionId,
                    typeId: vv.typeId,
                })),
            })),
    };
}

export function responseToVariant(
    response: VariationMatrixResponse,
    existingVariants: Variant[],
    variationTypes: VariationType[]
): Variant[] {
    const oldData: Record<string, { sku?: string; price?: string }> = {};

    if (existingVariants && existingVariants.length > 0) {
        existingVariants.forEach((variant) => {
            if (variant) oldData[variant.matrixKey] = { sku: variant.sku };
        });
    }

    const nameMap = Object.fromEntries(variationTypes.flatMap((t) =>
        (t?.options ?? []).map((o) => [o?.uuid, o?.name])));

    return response.variants.map((v) => {
        const previous = oldData[v.matrixKey];
        const name = v.variations.map((v) =>
            nameMap[v.optionId] ?? "")
            .filter(Boolean).join(" / ") || "";

        return {
            name: name,
            matrixKey: v.matrixKey,
            sku: previous?.sku ?? "",
            price: previous?.price ?? "0.00",
            variations: v.variations.map((vv) => ({
                optionId: vv.optionId,
                typeId: vv.typeId,
            })),
        };
    });
}

export function getVariantName(v: { variations: { optionId: string }[] }, nameMap: Record<string, string>):string {
    return v.variations.map((v) =>
        nameMap[v.optionId] ?? "")
        .filter(Boolean).join(" / ") || "";

}

export function buildStructuralFingerprint(types: VariationType[]): string {
    return types
        .filter((t) => !!t?.uuid)
        .map((t) => {
            const optionIds = (t.options ?? [])
                .filter((o) => !!o?.uuid)
                .map((o) => o.uuid)
                .sort()
                .join(",");
            return `${t.uuid}:[${optionIds}]`;
        })
        .sort()
        .join("|");
}