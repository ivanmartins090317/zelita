import type { Metadata } from "next";

import { legalContent } from "@/content/legal";

import { LegalDocument } from "../_components/legal-document";

export const metadata: Metadata = {
  title: "Privacidade — Zelita",
  description:
    "Como a Zelita trata dados da família e da pessoa cuidada, à luz da LGPD.",
};

export default function PrivacyPage() {
  return <LegalDocument page={legalContent.privacy} />;
}
