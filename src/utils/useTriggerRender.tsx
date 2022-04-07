import { useCallback, useState } from "react";

export function useTriggerRender() {
  const [, setCount] = useState(0);

  const triggerRender = useCallback(() => {
    setCount(x => x + 1)
  }, []);

  return triggerRender;
}