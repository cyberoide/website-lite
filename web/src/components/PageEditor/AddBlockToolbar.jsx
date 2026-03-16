import {
  Type,
  Image as ImageIcon,
  Box,
  PanelTop,
  Layers,
  Link as LinkIcon,
  Columns3,
  Heading1,
  Columns2,
  MessageSquareQuote,
  Images,
} from "lucide-react";

export function AddBlockToolbar({ onAddBlock }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 flex-wrap">
      <button
        onClick={() => onAddBlock("hero")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <PanelTop className="w-5 h-5 text-[#0066FF]" />
        Add Hero
      </button>
      <button
        onClick={() => onAddBlock("text")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <Type className="w-5 h-5 text-[#0066FF]" />
        Add Text
      </button>
      <button
        onClick={() => onAddBlock("image")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <ImageIcon className="w-5 h-5 text-[#0066FF]" />
        Add Image
      </button>
      <button
        onClick={() => onAddBlock("imageOverlay")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <Layers className="w-5 h-5 text-[#0066FF]" />
        Text over Image
      </button>
      <button
        onClick={() => onAddBlock("sectionHeader")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <Heading1 className="w-5 h-5 text-[#0066FF]" />
        Section Header
      </button>
      <button
        onClick={() => onAddBlock("split")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <Columns2 className="w-5 h-5 text-[#0066FF]" />
        Split Section
      </button>
      <button
        onClick={() => onAddBlock("ctaCards")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <Columns3 className="w-5 h-5 text-[#0066FF]" />
        Feature Cards
      </button>
      <button
        onClick={() => onAddBlock("testimonials")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <MessageSquareQuote className="w-5 h-5 text-[#0066FF]" />
        Testimonials
      </button>
      <button
        onClick={() => onAddBlock("gallery")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <Images className="w-5 h-5 text-[#0066FF]" />
        Gallery
      </button>
      <button
        onClick={() => onAddBlock("embed")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <Box className="w-5 h-5 text-[#0066FF]" />
        ClubSoft Embed
      </button>
      <button
        onClick={() => onAddBlock("links")}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#0066FF] transition-all font-semibold text-gray-700"
      >
        <LinkIcon className="w-5 h-5 text-[#0066FF]" />
        Links
      </button>
    </div>
  );
}
