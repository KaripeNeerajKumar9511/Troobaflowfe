"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Legacy URL: parameter-name editing was removed from the UI; full model settings live under `/dashboard/modelsettings`. */
export default function ParameterNamesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/modelsettings");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Redirecting" />
    </div>
  );
}
