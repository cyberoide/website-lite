"use client";

import React from "react";
import PublicSiteShell from "@/components/PublicSite/PublicSiteShell";
import {
  Globe,
  MousePointer2,
  Zap,
  ShieldCheck,
  ChevronRight,
  Layout,
  LayoutTemplate,
  Palette,
  Plus,
} from "lucide-react";

function isMarketingHost(hostname) {
  if (typeof hostname !== "string") return true;
  const h = hostname.trim().toLowerCase();
  if (!h) return true;

  // Local/dev hosts should always show the marketing page.
  if (
    h === "localhost" ||
    h.endsWith(".createdevserver.com") ||
    h.endsWith(".ucr.io")
  ) {
    return true;
  }

  // Production marketing hosts
  if (h === "clubsoft.site" || h === "www.clubsoft.site") {
    return true;
  }

  return false;
}

export default function MarketingLandingPage() {
  const [siteHost, setSiteHost] = React.useState(() => {
    // Compute immediately on first client render so we don't show marketing first
    // and then swap to the club site a moment later.
    if (typeof window === "undefined") return null;

    const host = window.location.hostname || "";
    if (!isMarketingHost(host)) {
      return host;
    }

    return null;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const host = window.location.hostname || "";

    // If we already detected we are on a club/custom domain, do nothing here.
    if (!isMarketingHost(host)) {
      return;
    }

    // Marketing title
    document.title = "ClubSoft Website Lite";
  }, []);

  // If we're on a club subdomain (slug.clubsoft.site) or a custom domain,
  // render the club site *without* changing the URL.
  if (siteHost) {
    return <PublicSiteShell host={siteHost} />;
  }

  const clubsoftAppHref = "https://app.clubsoft.co/";

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Utility Bar */}
      <div className="w-full h-10 bg-[#FAFAFA] border-b border-gray-100 flex items-center justify-center px-4">
        <div className="text-xs font-medium text-gray-500 flex items-center gap-2">
          <span className="bg-[#FFD400] text-black px-2 py-0.5 rounded text-[10px] font-bold">
            NEW
          </span>
          <span>
            ClubSoft Website Lite is now available for all Yacht Clubs.
          </span>
          <a href="#" className="text-[#0066FF] hover:underline">
            Learn more
          </a>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-[#111418]">
              ClubSoft Website Lite
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-semibold text-gray-500 hover:text-[#111418]"
            >
              Features
            </a>
            <a
              href="#examples"
              className="text-sm font-semibold text-gray-500 hover:text-[#111418]"
            >
              Examples
            </a>
            <a
              href="#pricing"
              className="text-sm font-semibold text-gray-500 hover:text-[#111418]"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={clubsoftAppHref}
              className="text-sm font-bold text-gray-600 hover:text-[#111418]"
              rel="noreferrer"
            >
              Admin Login
            </a>
            <a
              href={clubsoftAppHref}
              className="bg-[#111418] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
              rel="noreferrer"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0066FF] rounded-full text-sm font-bold mb-8">
            <Zap className="w-4 h-4" />
            Build your club's website in minutes
          </div>

          <h1 className="text-5xl lg:text-8xl font-black text-[#111418] mb-8 leading-[1.1] tracking-tight">
            The simplest way to <br />
            <span className="relative inline-block text-[#0066FF]">
              build your club site.
              <svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 120 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2,8 Q30,4 60,7 T118,6"
                  stroke="#FFD400"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
            ClubSoft Website Lite is an opinionated, simple-to-use website
            builder designed specifically for yacht and boat clubs. Connected
            directly to your ClubSoft records.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={clubsoftAppHref}
              className="w-full sm:w-auto px-10 py-5 bg-[#0066FF] text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:scale-105 transition-all"
              rel="noreferrer"
            >
              Launch Your Site
            </a>
            <a
              href="#demo"
              className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
            >
              Watch Demo
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 -translate-x-1/4 w-[400px] h-[400px] bg-yellow-100/20 rounded-full blur-[100px] -z-10" />
      </section>

      {/* Product Preview */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Browser Chrome */}
            <div className="bg-gray-50 h-12 flex items-center px-6 border-b border-gray-100">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              </div>
              <div className="flex-1 text-center">
                <div className="bg-white px-8 py-1 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest inline-block border border-gray-100">
                  sitebuilder.clubsoft.co
                </div>
              </div>
            </div>
            {/* Interface Mock */}
            <div className="aspect-video bg-[#F8F9FC] p-8 grid grid-cols-[240px_1fr] gap-8">
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-10 rounded-xl flex items-center px-4 gap-3 ${i === 1 ? "bg-blue-50 text-[#0066FF]" : "bg-transparent text-gray-300"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded ${i === 1 ? "bg-[#0066FF]" : "bg-gray-100"}`}
                    />
                    <div
                      className={`h-2 rounded w-1/2 ${i === 1 ? "bg-[#0066FF]" : "bg-gray-100"}`}
                    />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="h-8 bg-gray-100 rounded w-1/3 mb-12" />
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3"
                    >
                      <Plus className="text-gray-200" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-[#111418] py-32 px-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center lg:text-left">
            <h2 className="text-4xl lg:text-6xl font-black mb-6">
              Engineered for Yacht Clubs.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              Don't waste time with complex CMS systems. ClubSoft Website Lite
              gives you exactly what you need to run your club online.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
                title: "One Login (SSO)",
                desc: "Your admins use their existing ClubSoft accounts. No new passwords to manage.",
              },
              {
                icon: <LayoutTemplate className="w-8 h-8 text-blue-400" />,
                title: "Opinionated Blocks",
                desc: "Choose from pre-designed blocks: Text, Image, and dynamic ClubSoft components.",
              },
              {
                icon: <Palette className="w-8 h-8 text-yellow-400" />,
                title: "Thematic Control",
                desc: "Simply set your club's primary colors and upload your logo. We handle the rest.",
              },
              {
                icon: <MousePointer2 className="w-8 h-8 text-purple-400" />,
                title: "Drag & Reorder",
                desc: "Organize your navigation and page content with a simple, visual interface.",
              },
              {
                icon: <Globe className="w-8 h-8 text-pink-400" />,
                title: "Instant Publishing",
                desc: "Go live with a single click on your club's dedicated clubsoft.co subdomain.",
              },
              {
                icon: <Zap className="w-8 h-8 text-orange-400" />,
                title: "Auto-Connected",
                desc: "Event data, member portals, and applications are automatically synced.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#0066FF]" />
            <span className="font-extrabold text-[#111418]">
              ClubSoft Website Lite
            </span>
          </div>
          <div className="text-sm text-gray-500">
            © 2026 ClubSoft. All rights reserved. Built for Yacht Clubs.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-[#111418]">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-[#111418]">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-[#111418]">
              Support
            </a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
