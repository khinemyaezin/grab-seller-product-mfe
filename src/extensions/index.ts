export { PRODUCT_EXTENSION_SLOTS, type ProductExtensionSlotName } from "./slots";
export {
  ExtensionRegistryContext,
  useExtensionRegistry,
  useExtension,
  type ExtensionRegistry,
} from "./extension-registry";
export { default as ExtensionProvider } from "./ExtensionProvider";
export { default as ExtensionSlot } from "./ExtensionSlot";
export {
  SlotProvider,
  useSlotProvider,
  type RegisteredSlot,
  type SlotProviderApi,
  type SlotProviderProps,
} from "./slot-provider";
export {
  requestValidate,
  validateAllSlots,
  type SlotValidateResult,
} from "./validate-all-slots";