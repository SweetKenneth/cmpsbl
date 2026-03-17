import { useCallback, useMemo, useState } from "react";
import { DownloadCeremonyOverlay } from "@/components/downloads/DownloadCeremonyOverlay";

interface DownloadCeremonyConfig {
  itemName: string;
  kindLabel?: string;
  note?: string;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function useDownloadCeremony() {
  const [overlay, setOverlay] = useState<DownloadCeremonyConfig | null>(null);

  const runWithCeremony = useCallback(async <T,>(config: DownloadCeremonyConfig, action: () => Promise<T>) => {
    setOverlay(config);
    await wait(1400);

    try {
      return await action();
    } finally {
      await wait(700);
      setOverlay(null);
    }
  }, []);

  const overlayElement = useMemo(
    () => (
      <DownloadCeremonyOverlay
        open={Boolean(overlay)}
        itemName={overlay?.itemName ?? ""}
        kindLabel={overlay?.kindLabel}
        note={overlay?.note}
      />
    ),
    [overlay]
  );

  return {
    runWithCeremony,
    overlayElement,
    isCeremonyActive: Boolean(overlay),
  };
}
