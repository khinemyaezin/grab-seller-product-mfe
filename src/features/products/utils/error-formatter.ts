import type { ExtensionFieldErrors } from "@khinemyaezin/seller-contracts";

export interface FormattedErrorToast {
  message: string;
  description?: string;
}

export function formatExtensionErrorsForToast(
  errors?: ExtensionFieldErrors,
  fallbackMessage = "Validation failed. Please check the highlighted fields."
): FormattedErrorToast {
  if (!errors || Object.keys(errors).length === 0) {
    return { message: fallbackMessage };
  }

  const errorMessages = Object.values(errors).filter(Boolean);

  if (errorMessages.length === 0) {
    return { message: fallbackMessage };
  }

  if (errorMessages.length === 1) {
    return {
      message: "Validation Error",
      description: errorMessages[0],
    };
  }

  return {
    message: `Validation failed (${errorMessages.length} errors)`,
    description: errorMessages.map((msg) => `• ${msg}`).join("\n"),
  };
}
