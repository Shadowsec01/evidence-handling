import React, { useEffect, useState } from "react";
import client from "../api/client";

/**
 * Renders an image that lives behind JWT auth. A plain <img src="..."> can't
 * send an Authorization header, so this fetches the file as a blob using the
 * authenticated axios client, then renders it via an object URL.
 */
export default function ProtectedImage({ evidenceId, filename, alt }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    async function load() {
      setError(false);
      setSrc(null);
      try {
        const res = await client.get(
          `/evidence/${evidenceId}/files/${encodeURIComponent(filename)}`,
          { responseType: "blob" }
        );
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      } catch (err) {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [evidenceId, filename]);

  if (error) {
    return <div style={{ fontSize: 12, color: "var(--muted)" }}>Preview unavailable</div>;
  }
  if (!src) {
    return <div style={{ fontSize: 12, color: "var(--muted)" }}>Loading preview...</div>;
  }
  return (
    <img
      src={src}
      alt={alt || filename}
      style={{
        maxWidth: "100%",
        maxHeight: 240,
        borderRadius: 6,
        border: "1px solid var(--border)",
        display: "block"
      }}
    />
  );
}
