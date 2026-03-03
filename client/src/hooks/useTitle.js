// client/src/hooks/useTitle.ts
import { useEffect } from "react";
export function useTitle(left, right) {
  useEffect(() => {
    const pageTitle = right ? `${left} | ${right}` : left;
    document.title = pageTitle;
  }, [left, right]);
}
