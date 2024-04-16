import { useSearchParams } from "@remix-run/react";

function useRedirectUrl() {
  const [params] = useSearchParams();
  return params.get("redirect") || "/";
}

export { useRedirectUrl };
