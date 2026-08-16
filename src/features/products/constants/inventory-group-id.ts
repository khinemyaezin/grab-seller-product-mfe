export const STANDALONE_INVENTORY_GROUP_ID = "product.create.inventory:standalone";

export function inventoryGroupId(matrixKey: string): string {
  return `product.create.inventory:${matrixKey}`;
}
