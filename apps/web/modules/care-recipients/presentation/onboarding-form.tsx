"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cadastro");
  }, [router]);

  return null;
}
