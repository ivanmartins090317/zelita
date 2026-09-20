import type { Metadata } from "next";

import { legalContent } from "@/content/legal";

import { LegalDocument } from "../_components/legal-document";

export const metadata: Metadata = {
  title: "Termos de uso — Zelita",
  description:
    "Condições de uso da Zelita: trial, responsabilidades e o que o produto não substitui.",
};

export default function TermsPage() {
  return <LegalDocument page={legalContent.terms} />;
}
