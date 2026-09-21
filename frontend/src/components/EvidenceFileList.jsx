import React from "react";
import ProtectedImage from "./ProtectedImage";

export default function EvidenceFileList({ evidenceId, files }) {
  if (!files || files.length === 0) {
    return <div style={{ fontSize: 12, color: "var(--muted)" }}>No files.</div>;
  }

  return (
    <div>
      {files.map((f) => {
        const isImage = (f.mimeType || "").startsWith("image/");
        return (
          <div key={f.filename} className="list-item" style={{ cursor: "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{f.filename}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                {(f.byteSize / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="hash" style={{ marginTop: 4 }}>{f.fileHash}</div>
            {isImage && (
              <div style={{ marginTop: 8 }}>
                <ProtectedImage evidenceId={evidenceId} filename={f.filename} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
