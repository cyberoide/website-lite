import React from "react";
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Loader2,
  Images,
} from "lucide-react";
import { toast } from "sonner";

function safeList(value) {
  return Array.isArray(value) ? value : [];
}

export function TestimonialsBlock({
  data,
  onUpdate,
  upload,
  uploading,
  onChooseMedia,
}) {
  const testimonials = safeList(data.testimonials);
  const background = data.background || "dark";

  const updateTestimonial = (index, patch) => {
    const next = testimonials.map((t, i) =>
      i === index ? { ...t, ...patch } : t,
    );
    onUpdate({ testimonials: next });
  };

  const add = () => {
    onUpdate({
      testimonials: [
        ...testimonials,
        {
          quote: "A wonderful club experience.",
          name: "Member Name",
          title: "Member",
          imageUrl: "",
        },
      ],
    });
  };

  const remove = (index) => {
    const next = testimonials.filter((_, i) => i !== index);
    onUpdate({ testimonials: next });
  };

  const handleAvatarUpload = async (file, idx) => {
    if (!upload) {
      toast.error("Upload not available");
      return;
    }

    const result = await upload({
      file,
      folder: "website-assets",
      // Try ClubSoft S3 first, but allow fallback uploads so editing isn't blocked.
    });
    if (result?.error) {
      toast.error(result.error);
      return;
    }

    updateTestimonial(idx, { imageUrl: result.url });
    toast.success("Avatar uploaded");
  };

  const openLibraryForIndex = (idx) => {
    if (!onChooseMedia) return;
    onChooseMedia({
      title: `Select avatar image ${idx + 1}`,
      imagesOnly: true,
      defaultFolder: "website-assets",
      uploadFolder: "website-assets",
      onSelect: (url) => {
        updateTestimonial(idx, { imageUrl: url });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <MessageSquareQuote className="w-4 h-4" />
        Testimonials
      </div>

      <div
        className={`rounded-2xl border border-gray-100 p-6 md:p-8 ${
          background === "dark" ? "bg-[#111418] text-white" : "bg-gray-50"
        }`}
      >
        <div className="text-xl md:text-3xl font-black">
          {data.heading || "What members say"}
        </div>
        {testimonials[0]?.quote && (
          <div className="mt-4 opacity-85">“{testimonials[0].quote}”</div>
        )}
        {testimonials[0]?.name && (
          <div className="mt-4 font-semibold">
            {testimonials[0].name}
            {testimonials[0]?.title ? (
              <span className="opacity-60"> • {testimonials[0].title}</span>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.heading || ""}
          onChange={(e) => onUpdate({ heading: e.target.value })}
          placeholder="Section heading"
        />
        <select
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold"
          value={background}
          onChange={(e) => onUpdate({ background: e.target.value })}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-mono"
          value={data.anchor || ""}
          onChange={(e) => onUpdate({ anchor: e.target.value })}
          placeholder="Anchor ID (optional)"
        />
        <input
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
          value={data.navLabel || ""}
          onChange={(e) => onUpdate({ navLabel: e.target.value })}
          placeholder="Nav label (optional)"
        />
      </div>

      <div className="space-y-3">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="border border-gray-100 rounded-2xl p-4 bg-white"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="font-bold text-[#111418]">
                Testimonial {idx + 1}
              </div>
              <button
                onClick={() => remove(idx)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                aria-label="Remove testimonial"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <textarea
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm min-h-[90px]"
              value={t.quote || ""}
              onChange={(e) =>
                updateTestimonial(idx, { quote: e.target.value })
              }
              placeholder="Quote"
            />

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <input
                className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
                value={t.name || ""}
                onChange={(e) =>
                  updateTestimonial(idx, { name: e.target.value })
                }
                placeholder="Name"
              />
              <input
                className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
                value={t.title || ""}
                onChange={(e) =>
                  updateTestimonial(idx, { title: e.target.value })
                }
                placeholder="Title / Role"
              />
            </div>

            <div className="mt-3">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
                  value={t.imageUrl || ""}
                  onChange={(e) =>
                    updateTestimonial(idx, { imageUrl: e.target.value })
                  }
                  placeholder="Avatar image URL (optional)"
                />

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAvatarUpload(file, idx);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => openLibraryForIndex(idx)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
                    title="Choose from media library"
                  >
                    <Images className="w-4 h-4" />
                    Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>
    </div>
  );
}
