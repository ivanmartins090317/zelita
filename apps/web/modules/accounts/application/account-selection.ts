export const SELECTED_ACCOUNT_COOKIE = "zelita_selected_account";

/** Um ano — preferência neste aparelho. */
export const SELECTED_ACCOUNT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface SelectedAccountCookieOptions {
  secure: boolean;
  maxAge?: number;
}

/** Opções seguras para gravar a preferência de conta. */
export function buildSelectedAccountCookieOptions(
  isProduction: boolean,
): SelectedAccountCookieOptions {
  return {
    secure: isProduction,
    maxAge: SELECTED_ACCOUNT_MAX_AGE_SECONDS,
  };
}
