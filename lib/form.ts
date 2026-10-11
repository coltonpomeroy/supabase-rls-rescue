/** What a Server Action hands back to its form. */
export type FormState = { error?: string; message?: string } | null;

export const GENERIC_ERROR = "Something went wrong. Please try again.";
