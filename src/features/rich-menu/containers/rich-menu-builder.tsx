"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import type { FormActionFooterMode } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/useToast";
import {
  AreaEditor,
  ImageCropDialog,
  LayoutPicker,
  RichMenuCanvas,
} from "@/features/rich-menu/components";
import { errorInputClassName, FieldError } from "@/features/rich-menu/components/form-field";
import {
  createRichMenu,
  deleteRichMenu,
  fetchRichMenuById,
} from "@/features/rich-menu/lib/api";
import {
  createInitialAreas,
  DEFAULT_GRID_PRESET_BY_SIZE,
  getGridPresetsForSize,
  getLayoutById,
  getLayoutIdBySize,
  LINE_RICH_MENU_MAX_AREAS,
  normalizeAreasWithBounds,
  RICH_MENU_LAYOUTS,
} from "@/features/rich-menu/lib/layouts";
import {
  computeAreaErrors,
  computeBasicInfoErrors,
} from "@/features/rich-menu/lib/validate";
import {
  MENU_TYPE_OPTIONS,
  RichMenuAreaConfig,
  RichMenuMenuType,
  RichMenuSizeMode,
} from "@/features/rich-menu/types";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

// Sanity ceiling on the raw upload before cropping — the exported crop is
// what actually needs to fit LINE's 1 MB rich menu image limit.
const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024;

interface RichMenuBuilderContainerProps {
  menuId?: string;
  mode?: FormActionFooterMode;
}

async function resolveImageFile(
  imageFile: File | null,
  imagePreview: string | null,
): Promise<File | null> {
  if (imageFile) {
    return imageFile;
  }

  if (!imagePreview) {
    return null;
  }

  const response = await fetch(imagePreview);
  if (!response.ok) {
    throw new Error("Failed to load existing rich menu image");
  }

  const blob = await response.blob();
  const extension = blob.type === "image/jpeg" ? "jpg" : "png";

  return new File([blob], `rich-menu.${extension}`, {
    type: blob.type || "image/png",
  });
}

export function RichMenuBuilderContainer({
  menuId,
  mode,
}: RichMenuBuilderContainerProps) {
  const router = useRouter();
  const toast = useToast();
  const resolvedMode = mode ?? (menuId ? "edit" : "create");
  const isViewMode = resolvedMode === "view";
  const isEditMode = resolvedMode === "edit";

  const [name, setName] = useState("Default Guest Menu");
  const [chatBarText, setChatBarText] = useState("Menu");
  const [menuType, setMenuType] = useState<RichMenuMenuType>("default");
  const [layoutId, setLayoutId] = useState("big");
  const [gridPresetId, setGridPresetId] = useState<string | null>(
    DEFAULT_GRID_PRESET_BY_SIZE.big,
  );
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(Boolean(menuId));
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const layout = useMemo(() => getLayoutById(layoutId), [layoutId]);
  const gridPresets = useMemo(
    () => getGridPresetsForSize(layoutId),
    [layoutId],
  );

  const [areas, setAreas] = useState<RichMenuAreaConfig[]>(() =>
    createInitialAreas("big", DEFAULT_GRID_PRESET_BY_SIZE.big),
  );

  const fieldErrors = hasAttemptedSubmit
    ? computeBasicInfoErrors(name, chatBarText, Boolean(imageFile || imagePreview))
    : {};
  const areaErrorsMap = hasAttemptedSubmit ? computeAreaErrors(areas) : {};

  useEffect(() => {
    if (!menuId) {
      return;
    }

    let isCancelled = false;

    const loadMenu = async () => {
      setIsLoadingMenu(true);
      try {
        const menu = await fetchRichMenuById(menuId);
        if (isCancelled) {
          return;
        }

        const resolvedLayoutId = getLayoutIdBySize(
          menu.sizeWidth,
          menu.sizeHeight,
        );
        const nextAreas = normalizeAreasWithBounds(menu.areas, {
          width: menu.sizeWidth,
          height: menu.sizeHeight,
        });

        setName(menu.name);
        setChatBarText(menu.chatBarText);
        setMenuType(menu.menuType);
        setLayoutId(resolvedLayoutId);
        setGridPresetId(
          resolvedLayoutId === "custom"
            ? null
            : DEFAULT_GRID_PRESET_BY_SIZE[
                resolvedLayoutId as Exclude<RichMenuSizeMode, "custom">
              ],
        );
        setImagePreview(menu.imageUrl ?? null);
        setAreas(nextAreas);
        setSelectedAreaIndex(0);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "Failed to load rich menu",
        );
        router.push("/rich-menu");
      } finally {
        if (!isCancelled) {
          setIsLoadingMenu(false);
        }
      }
    };

    loadMenu();

    return () => {
      isCancelled = true;
    };
  }, [menuId]);

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Rich Menu", href: "/rich-menu" },
    {
      label: isViewMode ? "View" : isEditMode ? "Edit" : "Create",
      isActive: true,
    },
  ];

  const handleLayoutChange = (nextLayoutId: string) => {
    const nextLayout = getLayoutById(nextLayoutId);
    const currentAspect = layout.size.width / layout.size.height;
    const nextAspect = nextLayout.size.width / nextLayout.size.height;

    setLayoutId(nextLayoutId);

    if (nextLayoutId === "custom") {
      setGridPresetId(null);
      setAreas(createInitialAreas("custom"));
    } else {
      const nextPreset =
        DEFAULT_GRID_PRESET_BY_SIZE[
          nextLayoutId as Exclude<RichMenuSizeMode, "custom">
        ];
      setGridPresetId(nextPreset);
      setAreas(createInitialAreas(nextLayoutId, nextPreset));
    }

    setSelectedAreaIndex(0);

    // The aspect ratio changed after an image was already cropped — reopen
    // the cropper on the original source so the image can be refit instead
    // of forcing a full re-upload.
    if (sourceUrl && Math.abs(currentAspect - nextAspect) > 0.001) {
      setIsCropDialogOpen(true);
    }
  };

  const handleGridPresetChange = (nextPresetId: string) => {
    setGridPresetId(nextPresetId);
    setAreas(createInitialAreas(layoutId, nextPresetId));
    setSelectedAreaIndex(0);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a PNG or JPEG image");
      return;
    }

    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      toast.error("Image must be 20 MB or smaller");
      return;
    }

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    setSourceUrl(URL.createObjectURL(file));
    setIsCropDialogOpen(true);
  };

  const handleCropApply = (file: File) => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsCropDialogOpen(false);
  };

  const handleCropCancel = () => {
    setIsCropDialogOpen(false);
  };

  const updateArea = (index: number, nextArea: RichMenuAreaConfig) => {
    setAreas((current) =>
      current.map((area, areaIndex) =>
        areaIndex === index ? nextArea : area,
      ),
    );
  };

  const validateForm = () => {
    setHasAttemptedSubmit(true);

    if (areas.length === 0) {
      toast.error("Draw at least one tap area on the preview");
      return false;
    }

    if (areas.length > LINE_RICH_MENU_MAX_AREAS) {
      toast.error(`Maximum ${LINE_RICH_MENU_MAX_AREAS} areas allowed`);
      return false;
    }

    const basicErrors = computeBasicInfoErrors(
      name,
      chatBarText,
      Boolean(imageFile || imagePreview),
    );
    const areaErrors = computeAreaErrors(areas);

    if (Object.keys(basicErrors).length > 0 || Object.keys(areaErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return false;
    }

    for (const [index, area] of areas.entries()) {
      if (!area.bounds || area.bounds.width < 1 || area.bounds.height < 1) {
        toast.error(`Invalid bounds for area ${index + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const resolvedImage = await resolveImageFile(imageFile, imagePreview);
      if (!resolvedImage) {
        toast.error("Please upload a rich menu image");
        return;
      }

      const result = await createRichMenu({
        name: name.trim(),
        menuType,
        chatBarText: chatBarText.trim(),
        layoutId,
        areas,
        image: resolvedImage,
      });

      if (isEditMode && menuId) {
        await deleteRichMenu(menuId);
      }

      toast.success(
        isEditMode
          ? "Rich menu updated successfully"
          : menuType === "default"
            ? "Default rich menu created and applied to guest users"
            : "Member rich menu created successfully",
      );

      router.push("/rich-menu");
      return result;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save rich menu",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMenuType = MENU_TYPE_OPTIONS.find(
    (option) => option.value === menuType,
  );
  const selectedArea = areas[selectedAreaIndex];

  if (isLoadingMenu) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading rich menu...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isViewMode
              ? "View Rich Menu"
              : isEditMode
                ? "Edit Rich Menu"
                : "Create Rich Menu"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isViewMode
              ? "Review rich menu settings and tap areas"
              : "Choose Big, Compact, or Custom size, then draw tap areas on the image"}
          </p>
        </div>
        <Badge
          variant={menuType === "default" ? "default" : "secondary"}
          className="w-fit"
        >
          {selectedMenuType?.label}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic settings
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Menu name *
                </label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={
                    fieldErrors.name
                      ? `${inputClassName} ${errorInputClassName}`
                      : inputClassName
                  }
                  readOnly={isViewMode}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                <FieldError message={fieldErrors.name} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chat bar text * (max 14)
                </label>
                <Input
                  value={chatBarText}
                  maxLength={14}
                  onChange={(event) => setChatBarText(event.target.value)}
                  className={
                    fieldErrors.chatBarText
                      ? `${inputClassName} ${errorInputClassName}`
                      : inputClassName
                  }
                  readOnly={isViewMode}
                  aria-invalid={Boolean(fieldErrors.chatBarText)}
                />
                <FieldError message={fieldErrors.chatBarText} />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Menu type *
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                {MENU_TYPE_OPTIONS.map((option) => {
                  if (isViewMode && menuType !== option.value) {
                    return null;
                  }

                  return (
                    <label
                      key={option.value}
                      className={`flex gap-3 rounded-lg border p-4 transition-colors ${
                        isViewMode ? "" : "cursor-pointer"
                      } ${
                        menuType === option.value
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {!isViewMode && (
                        <input
                          type="radio"
                          name="menuType"
                          value={option.value}
                          checked={menuType === option.value}
                          onChange={() => setMenuType(option.value)}
                          className="mt-1"
                        />
                      )}
                      <span>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Menu size
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Choose Big or Compact and a default grid, or Custom to draw areas
              freely.
            </p>
            <LayoutPicker
              layouts={RICH_MENU_LAYOUTS}
              selectedLayoutId={layoutId}
              onSelect={handleLayoutChange}
              gridPresets={gridPresets}
              selectedGridPresetId={gridPresetId}
              onSelectGridPreset={handleGridPresetChange}
              readOnly={isViewMode}
            />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Menu image
            </h2>
            {isViewMode ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-6 py-10 text-center dark:border-gray-700">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="Rich menu"
                    referrerPolicy="no-referrer"
                    className="mx-auto max-h-48 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <ImageIcon className="mb-3 h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No image
                    </p>
                  </>
                )}
              </div>
            ) : (
              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 ${
                  fieldErrors.image
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {imagePreview ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Uploaded rich menu"
                      referrerPolicy="no-referrer"
                      className="mx-auto max-h-48 rounded-lg object-contain"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {imageFile?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mb-3 h-10 w-10 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Upload rich menu image
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PNG or JPEG. You&apos;ll crop it to exactly{" "}
                      {layout.size.width}×{layout.size.height}px for LINE.
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  <Upload className="h-4 w-4" />
                  Choose image
                </span>
              </label>
            )}
            <FieldError message={fieldErrors.image} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Preview & draw areas
            </h2>
            <RichMenuCanvas
              layout={layout}
              imagePreview={imagePreview}
              areas={areas}
              selectedIndex={selectedAreaIndex}
              onSelectArea={setSelectedAreaIndex}
              onChangeAreas={setAreas}
              readOnly={isViewMode}
            />
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Area action
            </h2>
            {selectedArea ? (
              <AreaEditor
                areaIndex={selectedAreaIndex}
                area={selectedArea}
                onChange={(nextArea) =>
                  updateArea(selectedAreaIndex, nextArea)
                }
                readOnly={isViewMode}
                error={areaErrorsMap[selectedAreaIndex]}
              />
            ) : (
              <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                Draw an area on the preview to configure its action
              </p>
            )}

            {areas.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {areas.map((area, index) => {
                  const hasError = Boolean(areaErrorsMap[index]);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAreaIndex(index)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        selectedAreaIndex === index
                          ? "bg-blue-600 text-white"
                          : hasError
                            ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-500 dark:bg-red-950/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {index + 1}. {area.label}
                      {hasError && selectedAreaIndex !== index ? " ⚠" : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {!isViewMode && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Publish
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {menuType === "default"
                  ? "This menu will be set as the default rich menu for guest users on LINE."
                  : "This menu will be created on LINE. You can link it to members from the list page later."}
              </p>
            </section>
          )}
        </div>
      </div>

      <FormActionFooter
        mode={resolvedMode}
        cancelHref="/rich-menu"
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        createSaveLabel="Create Rich Menu"
        editSaveLabel="Save Changes"
        savingLabel={isEditMode ? "Saving..." : "Creating..."}
      />

      <ImageCropDialog
        open={isCropDialogOpen}
        imageSrc={sourceUrl}
        targetSize={layout.size}
        fileBaseName={name.trim() ? name.trim().toLowerCase().replace(/\s+/g, "-") : "rich-menu"}
        onCancel={handleCropCancel}
        onApply={handleCropApply}
      />
    </div>
  );
}
