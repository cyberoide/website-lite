import { Columns3, Plus, Loader2, Images } from "lucide-react";
import { toast } from "sonner";

export function CTACardsBlock({
  data,
  onUpdate,
  upload,
  uploading,
  onChooseMedia,
}) {
  const handleCardUpdate = (idx, field, value) => {
    const nextCards = [...(data.cards || [])];
    nextCards[idx] = { ...nextCards[idx], [field]: value };
    onUpdate({ cards: nextCards });
  };

  const handleRemoveCard = (idx) => {
    const nextCards = [...(data.cards || [])];
    nextCards.splice(idx, 1);
    onUpdate({ cards: nextCards });
  };

  const handleAddCard = () => {
    const nextCards = [...(data.cards || [])];
    nextCards.push({
      title: "Card title",
      text: "Short description",
      linkText: "Learn more",
      linkHref: "#",
      imageUrl: "",
    });
    onUpdate({ cards: nextCards });
  };

  const handleImageUpload = async (file, idx) => {
    const result = await upload({
      file,
      folder: "website-assets",
      // Try ClubSoft S3 first, but allow fallback uploads so editing isn't blocked.
    });
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    const nextCards = [...(data.cards || [])];
    nextCards[idx] = { ...nextCards[idx], imageUrl: result.url };
    onUpdate({ cards: nextCards });
    toast.success("Image uploaded");
  };

  const openLibraryForCard = (idx) => {
    if (!onChooseMedia) return;
    onChooseMedia({
      title: `Select card image ${idx + 1}`,
      imagesOnly: true,
      defaultFolder: "website-assets",
      uploadFolder: "website-assets",
      onSelect: (url) => {
        const nextCards = [...(data.cards || [])];
        nextCards[idx] = { ...nextCards[idx], imageUrl: url };
        onUpdate({ cards: nextCards });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Columns3 className="w-4 h-4" />
        Feature Cards
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(data.cards || []).map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden border border-gray-100 bg-white"
          >
            <div className="relative h-28 bg-gray-100">
              {card.imageUrl && (
                <img
                  src={card.imageUrl}
                  alt={card.title || "Card"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
            <div className="p-4">
              <div className="font-bold text-[#111418]">
                {card.title || "Card title"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {card.text || ""}
              </div>
              <div className="mt-3 text-sm font-semibold text-[#0066FF]">
                {card.linkText || "Learn more"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {(data.cards || []).map((card, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-gray-50 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#111418]">Card {idx + 1}</div>
              <button
                onClick={() => handleRemoveCard(idx)}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <input
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
                value={card.title || ""}
                onChange={(e) => handleCardUpdate(idx, "title", e.target.value)}
                placeholder="Title"
              />
              <input
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
                value={card.linkText || ""}
                onChange={(e) =>
                  handleCardUpdate(idx, "linkText", e.target.value)
                }
                placeholder="Link text"
              />
            </div>

            <textarea
              className="mt-3 w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm min-h-[70px]"
              value={card.text || ""}
              onChange={(e) => handleCardUpdate(idx, "text", e.target.value)}
              placeholder="Description"
            />

            <div className="flex flex-col md:flex-row gap-3 mt-3">
              <input
                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
                value={card.imageUrl || ""}
                onChange={(e) =>
                  handleCardUpdate(idx, "imageUrl", e.target.value)
                }
                placeholder="Image URL"
              />
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer">
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
                        handleImageUpload(file, idx);
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => openLibraryForCard(idx)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                  title="Choose from media library"
                >
                  <Images className="w-4 h-4" />
                  Library
                </button>
              </div>
            </div>

            <input
              className="mt-3 w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
              value={card.linkHref || ""}
              onChange={(e) =>
                handleCardUpdate(idx, "linkHref", e.target.value)
              }
              placeholder="Link URL"
            />
          </div>
        ))}

        <button
          onClick={handleAddCard}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>
    </div>
  );
}
