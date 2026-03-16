import { HeroBlock } from "./Blocks/HeroBlock";
import { SectionHeaderPublicBlock } from "./Blocks/SectionHeaderPublicBlock";
import { SplitPublicBlock } from "./Blocks/SplitPublicBlock";
import { TestimonialsPublicBlock } from "./Blocks/TestimonialsPublicBlock";
import { GalleryPublicBlock } from "./Blocks/GalleryPublicBlock";
import { TextBlock } from "./Blocks/TextBlock";
import { ImageBlock } from "./Blocks/ImageBlock";
import { ImageOverlayBlock } from "./Blocks/ImageOverlayBlock";
import { EmbedBlock } from "./Blocks/EmbedBlock";
import { CTACardsPublicBlock } from "./Blocks/CTACardsPublicBlock";
import { LinksPublicBlock } from "./Blocks/LinksPublicBlock";
import { FullBleed } from "./Blocks/FullBleed";

export function BlockRenderer({
  block,
  clubSlug,
  primaryColor,
  headingColor,
  bodyTextColor,
  headingFontClassName,
}) {
  const anchor = block?.data?.anchor;
  const wrap = (children) =>
    anchor ? <div id={anchor}>{children}</div> : children;

  const isFullBleed = block?.type === "hero";

  return (
    <div key={block.id} className="animate-fade-in">
      {wrap(
        isFullBleed ? (
          <FullBleed>
            <HeroBlock
              block={block}
              primaryColor={primaryColor}
              headingFontClassName={headingFontClassName}
            />
          </FullBleed>
        ) : (
          <>
            {block.type === "sectionHeader" && (
              <SectionHeaderPublicBlock
                block={block}
                primaryColor={primaryColor}
                headingColor={headingColor}
                bodyTextColor={bodyTextColor}
                headingFontClassName={headingFontClassName}
              />
            )}

            {block.type === "split" && (
              <SplitPublicBlock
                block={block}
                primaryColor={primaryColor}
                headingColor={headingColor}
                bodyTextColor={bodyTextColor}
                headingFontClassName={headingFontClassName}
              />
            )}

            {block.type === "testimonials" && (
              <TestimonialsPublicBlock
                block={block}
                primaryColor={primaryColor}
                headingColor={headingColor}
                bodyTextColor={bodyTextColor}
                headingFontClassName={headingFontClassName}
              />
            )}

            {block.type === "gallery" && (
              <GalleryPublicBlock block={block} primaryColor={primaryColor} />
            )}

            {block.type === "text" && (
              <TextBlock block={block} bodyTextColor={bodyTextColor} />
            )}

            {block.type === "image" && <ImageBlock block={block} />}

            {block.type === "imageOverlay" && (
              <ImageOverlayBlock block={block} />
            )}

            {block.type === "embed" && (
              <EmbedBlock block={block} clubSlug={clubSlug} />
            )}

            {block.type === "ctaCards" && (
              <CTACardsPublicBlock
                block={block}
                primaryColor={primaryColor}
                headingColor={headingColor}
                bodyTextColor={bodyTextColor}
                headingFontClassName={headingFontClassName}
              />
            )}

            {block.type === "links" && (
              <LinksPublicBlock
                block={block}
                primaryColor={primaryColor}
                headingColor={headingColor}
                bodyTextColor={bodyTextColor}
                headingFontClassName={headingFontClassName}
              />
            )}
          </>
        ),
      )}
    </div>
  );
}
