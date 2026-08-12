import { describe, expect, it } from "vitest";

import {
  buildSelectedAccountCookieOptions,
  SELECTED_ACCOUNT_MAX_AGE_SECONDS,
} from "./account-selection";

describe("buildSelectedAccountCookieOptions", () => {
  it("usa Secure em produção", () => {
    expect(buildSelectedAccountCookieOptions(true).secure).toBe(true);
    expect(buildSelectedAccountCookieOptions(false).secure).toBe(false);
  });

  it("define maxAge padrão de um ano", () => {
    expect(buildSelectedAccountCookieOptions(false).maxAge).toBe(
      SELECTED_ACCOUNT_MAX_AGE_SECONDS,
    );
  });
});
