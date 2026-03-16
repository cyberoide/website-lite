import React from "react";

export function usePreviewMode() {
  const [preview, setPreview] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const sp = new URLSearchParams(window.location.search);
    setPreview(sp.get("preview") === "1");
  }, []);

  return preview;
}
