"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import useUpload from "@/utils/useUpload";
import useWebsiteLiteSession from "@/hooks/useWebsiteLiteSession";
import { usePageEditor } from "@/hooks/usePageEditor";
import { useMediaPicker } from "@/hooks/useMediaPicker";
import { useBlockDragAndDrop } from "@/hooks/useBlockDragAndDrop";
import { useBlockOperations } from "@/hooks/useBlockOperations";
import { getBlockLibrary, filterBlockLibrary } from "@/utils/blockHelpers";

import { EditorHeader } from "@/components/PageEditor/EditorHeader";
import { ReadOnlyBanner } from "@/components/PageEditor/ReadOnlyBanner";
import { SectionsSidebar } from "@/components/PageEditor/SectionsSidebar";
import { BlockCanvas } from "@/components/PageEditor/BlockCanvas";
import { PageSettingsPanel } from "@/components/PageEditor/PageSettingsPanel";
import { BlockLibraryPanel } from "@/components/PageEditor/BlockLibraryPanel";
import { LoadingState } from "@/components/PageEditor/LoadingState";
import { ErrorState } from "@/components/PageEditor/ErrorState";
import { NoClubState } from "@/components/PageEditor/NoClubState";
import MediaLibraryPicker from "@/components/PageEditor/MediaLibraryPicker";

export default function PageEditor({ params }) {
  const { id } = params;
  const [upload, { loading: uploading }] = useUpload();
  const {
    session,
    isLoading: sessionLoading,
    isClubSoftAdmin,
    isClubEditor,
    readOnly,
  } = useWebsiteLiteSession();
  const clubId = session?.club_id || null;

  const canEdit = !!isClubEditor && !readOnly;

  // If we have a session but no club, guide the user instead of defaulting to club #1.
  if (!sessionLoading && session && !clubId) {
    return <NoClubState isClubSoftAdmin={isClubSoftAdmin} />;
  }

  const {
    mediaPickerOpen,
    mediaPickerTitle,
    mediaPickerImagesOnly,
    mediaPickerDefaultFolder,
    mediaPickerUploadFolder,
    closeMediaPicker,
    openMediaPicker,
    handleMediaSelected,
  } = useMediaPicker(canEdit);

  const {
    page,
    isLoading,
    error,
    blocks,
    setBlocks,
    saveMutation,
    updatePageMutation,
    updateBlockData,
    removeBlock,
    moveBlock,
  } = usePageEditor(id);

  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const {
    containerRefs,
    collapsed,
    safeUpdateBlockData,
    safeRemoveBlock,
    safeMoveBlock,
    addBlock,
    uploadAndSet,
    onToggleCollapse,
  } = useBlockOperations(
    canEdit,
    safeBlocks,
    setBlocks,
    updateBlockData,
    removeBlock,
    moveBlock,
    upload,
  );

  const { data: website } = useQuery({
    queryKey: ["website", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const res = await fetch(`/api/website?clubId=${clubId}`);
      if (!res.ok) {
        throw new Error(
          `When fetching /api/website, the response was [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
  });

  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageEnabled, setPageEnabled] = useState(true);

  const [blockSearch, setBlockSearch] = useState("");

  useEffect(() => {
    setPageTitle(typeof page?.title === "string" ? page.title : "");
    setPageSlug(typeof page?.slug === "string" ? page.slug : "");
    setPageEnabled(
      typeof page?.is_enabled === "boolean" ? page.is_enabled : true,
    );
  }, [page?.title, page?.slug, page?.is_enabled]);

  const onSavePageSettings = () => {
    if (!canEdit) {
      toast.error("Read-only access");
      return;
    }
    updatePageMutation.mutate({
      title: pageTitle,
      slug: pageSlug,
      is_enabled: pageEnabled,
    });
  };

  const previewHref = useMemo(() => {
    const slug = website?.club_slug;
    if (!slug) return null;
    return `/s/${slug}?preview=1`;
  }, [website?.club_slug]);

  const blockLibrary = useMemo(() => {
    const library = getBlockLibrary();
    return filterBlockLibrary(library, blockSearch);
  }, [blockSearch]);

  const {
    draggingBlockId,
    dragOverBlockId,
    onBlockDragStart,
    onBlockDragOver,
    onBlockDrop,
    onBlockDragEnd,
  } = useBlockDragAndDrop(safeBlocks, setBlocks);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Could not load page";
    return <ErrorState message={message} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-20">
      <EditorHeader
        pageTitle={page?.title}
        previewHref={previewHref}
        canEdit={canEdit}
        saveMutation={saveMutation}
        onSave={() => (canEdit ? saveMutation.mutate(safeBlocks) : null)}
      />

      {readOnly ? <ReadOnlyBanner /> : null}

      {/* 3-column editor */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)_340px] gap-6">
          {/* Left: Sections */}
          <SectionsSidebar
            blocks={safeBlocks}
            containerRefs={containerRefs}
            dragOverBlockId={dragOverBlockId}
            onBlockDragOver={onBlockDragOver}
            onBlockDrop={onBlockDrop}
            onBlockDragStart={onBlockDragStart}
            onBlockDragEnd={onBlockDragEnd}
            safeMoveBlock={safeMoveBlock}
          />

          {/* Center: Canvas */}
          <BlockCanvas
            blocks={safeBlocks}
            collapsed={collapsed}
            containerRefs={containerRefs}
            onToggleCollapse={onToggleCollapse}
            safeMoveBlock={safeMoveBlock}
            safeRemoveBlock={safeRemoveBlock}
            safeUpdateBlockData={safeUpdateBlockData}
            uploadAndSet={uploadAndSet}
            openMediaPicker={openMediaPicker}
            upload={upload}
            uploading={uploading}
            canEdit={canEdit}
          />

          {/* Right: Page settings + block library */}
          <div className="min-w-0">
            <div className="sticky top-[92px] space-y-6">
              <PageSettingsPanel
                pageTitle={pageTitle}
                setPageTitle={setPageTitle}
                pageSlug={pageSlug}
                setPageSlug={setPageSlug}
                pageEnabled={pageEnabled}
                setPageEnabled={setPageEnabled}
                onSavePageSettings={onSavePageSettings}
                updatePageMutation={updatePageMutation}
                canEdit={canEdit}
              />

              <BlockLibraryPanel
                blockLibrary={blockLibrary}
                blockSearch={blockSearch}
                setBlockSearch={setBlockSearch}
                addBlock={addBlock}
              />
            </div>
          </div>
        </div>
      </div>

      <MediaLibraryPicker
        open={mediaPickerOpen}
        onClose={closeMediaPicker}
        onSelect={handleMediaSelected}
        title={mediaPickerTitle}
        clubId={clubId}
        imagesOnly={mediaPickerImagesOnly}
        defaultFolder={mediaPickerDefaultFolder}
        uploadFolder={mediaPickerUploadFolder}
        allowUpload={canEdit}
      />
    </div>
  );
}
