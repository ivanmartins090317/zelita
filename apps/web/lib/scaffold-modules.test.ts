import { describe, expect, it } from "vitest";

import {
  hasScaffoldModules,
  ZELITA_MODULE_IDS,
} from "@/lib/scaffold-modules";
import { isInngestConfigured } from "@/lib/inngest";
import { isSupabaseConfigured } from "@/lib/supabase";

describe("scaffold monorepo smoke", () => {
  it("expõe os 9 módulos verticais via API pública", () => {
    expect(ZELITA_MODULE_IDS).toHaveLength(9);
    expect(hasScaffoldModules()).toBe(true);
  });

  it("stubs de Supabase e Inngest ficam unconfigured sem env", () => {
    expect(isSupabaseConfigured({ url: undefined, anonKey: undefined })).toBe(
      false,
    );
    expect(isInngestConfigured({ eventKey: undefined })).toBe(false);
  });
});
