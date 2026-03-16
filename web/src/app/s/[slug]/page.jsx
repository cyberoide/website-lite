"use client";

import React from "react";
import PublicSiteShell from "@/components/PublicSite/PublicSiteShell";

export default function PublicSite({ params }) {
  const slug = params?.slug;
  return <PublicSiteShell slug={slug} />;
}
