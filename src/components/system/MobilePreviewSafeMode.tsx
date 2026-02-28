import React from "react";

const DEFAULT_PUBLISHED_URL = "https://cmpsbl.com";

function buildPreviewFullUrl(): string {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("previewFull", "1");
    url.searchParams.delete("previewSafe");
    return url.toString();
  } catch {
    return "?previewFull=1";
  }
}

export function MobilePreviewSafeMode({ publishedUrl = DEFAULT_PUBLISHED_URL }: { publishedUrl?: string }) {
  const previewFullUrl = buildPreviewFullUrl();

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold">Mobile Preview Safe Mode</h1>
          <p className="text-sm text-muted-foreground">
            The embedded mobile preview is skipping heavy initialization to prevent reload/crash loops.
            This does not change the published site.
          </p>
        </header>

        <div className="mt-4 flex flex-col gap-2">
          <a
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href={publishedUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open published site
          </a>

          <a
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium"
            href={previewFullUrl}
          >
            Try full preview (may crash)
          </a>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground">Published URL</div>
          <div className="mt-1 rounded-md border border-border bg-background p-3 font-mono text-xs break-all">
            {publishedUrl}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: remove <span className="font-mono">previewFull=1</span> to return to Safe Mode.
        </p>
      </section>
    </main>
  );
}
