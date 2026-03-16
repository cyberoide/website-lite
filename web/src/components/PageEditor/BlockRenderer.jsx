import { TextBlock } from "./Blocks/TextBlock";
import { ImageBlock } from "./Blocks/ImageBlock";
import { HeroBlock } from "./Blocks/HeroBlock";
import { ImageOverlayBlock } from "./Blocks/ImageOverlayBlock";
import { EmbedBlock } from "./Blocks/EmbedBlock";
import { CTACardsBlock } from "./Blocks/CTACardsBlock";
import { LinksBlock } from "./Blocks/LinksBlock";
import { SectionHeaderBlock } from "./Blocks/SectionHeaderBlock";
import { SplitBlock } from "./Blocks/SplitBlock";
import { TestimonialsBlock } from "./Blocks/TestimonialsBlock";
import { GalleryBlock } from "./Blocks/GalleryBlock";

export function BlockRenderer({
  block,
  onUpdate,
  onUpload,
  upload,
  uploading,
  onChooseMedia,
}) {
  switch (block.type) {
    case "text":
      return <TextBlock data={block.data} onUpdate={onUpdate} />;
    case "image":
      return (
        <ImageBlock
          data={block.data}
          onUpdate={onUpdate}
          onUpload={onUpload}
          uploading={uploading}
          onChooseMedia={onChooseMedia}
        />
      );
    case "hero":
      return (
        <HeroBlock
          data={block.data}
          onUpdate={onUpdate}
          onUpload={onUpload}
          uploading={uploading}
          onChooseMedia={onChooseMedia}
        />
      );
    case "imageOverlay":
      return (
        <ImageOverlayBlock
          data={block.data}
          onUpdate={onUpdate}
          onUpload={onUpload}
          uploading={uploading}
          onChooseMedia={onChooseMedia}
        />
      );
    case "embed":
      return <EmbedBlock data={block.data} onUpdate={onUpdate} />;
    case "ctaCards":
      return (
        <CTACardsBlock
          data={block.data}
          onUpdate={onUpdate}
          upload={upload}
          uploading={uploading}
          onChooseMedia={onChooseMedia}
        />
      );
    case "links":
      return <LinksBlock data={block.data} onUpdate={onUpdate} />;

    // New blocks for richer templates
    case "sectionHeader":
      return <SectionHeaderBlock data={block.data} onUpdate={onUpdate} />;
    case "split":
      return (
        <SplitBlock
          data={block.data}
          onUpdate={onUpdate}
          onUpload={onUpload}
          uploading={uploading}
          onChooseMedia={onChooseMedia}
        />
      );
    case "testimonials":
      return (
        <TestimonialsBlock
          data={block.data}
          onUpdate={onUpdate}
          upload={upload}
          uploading={uploading}
          onChooseMedia={onChooseMedia}
        />
      );
    case "gallery":
      return (
        <GalleryBlock
          data={block.data}
          onUpdate={onUpdate}
          onUpload={onUpload}
          uploading={uploading}
          onChooseMedia={onChooseMedia}
        />
      );
    default:
      return null;
  }
}
