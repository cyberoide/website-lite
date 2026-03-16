"use client";

import React, { useEffect } from "react";

export default function ThemeRedirectPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/admin/themes");
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-sm text-gray-500">
      Redirecting…
    </div>
  );
}
