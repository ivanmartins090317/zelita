import { serve } from "inngest/next";

import { inngest, reminderFunctions } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: reminderFunctions,
});
