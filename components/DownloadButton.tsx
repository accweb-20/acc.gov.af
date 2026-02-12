// components/DownloadButton.tsx
"use client";

import React, { useState } from "react";

type Props = {
  url: string;
  filename?: string;
  children?: React.ReactNode;
};

/**
 * DownloadButton: fetches the provided URL as a blob and triggers a download.
 * This ensures the file downloads rather than opening in-browser.
 */
export default function DownloadButton({ url, filename = "file.pdf", children }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch (${resp.status})`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "download.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err: unknown) {
      console.error("download error", err);
      setError("Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        disabled={loading}
        aria-disabled={loading}
        style={{
          backgroundColor: "#F4BA00",
          color: "#1A1A1A",
          clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)",
        }}
        className="inline-flex items-center cursor-pointer justify-center px-4 py-2 font-bold shadow-sm hover:opacity-95"
      >
        {loading ? "Downloading…" : children ?? "Download"}
      </button>
      {error ? <div className="text-xs text-red-400 mt-1">{error}</div> : null}
    </>
  );
}
