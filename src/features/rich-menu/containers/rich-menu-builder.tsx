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
  LayoutPicker,
  RichMenuCanvas,
} from "@/features/rich-menu/components";
import {
  createRichMenu,
  deleteRichMenu,
  fetchRichMenuById,
} from "@/features/rich-menu/lib/api";
import {
  createDefaultAreas,
  getLayoutById,
  getLayoutIdBySize,
  RICH_MENU_LAYOUTS,
} from "@/features/rich-menu/lib/layouts";
import {
  MENU_TYPE_OPTIONS,
  RichMenuAreaConfig,
  RichMenuMenuType,
} from "@/features/rich-menu/types";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

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
  const [layoutId, setLayoutId] = useState("large-2x3");
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(Boolean(menuId));

  const layout = useMemo(() => getLayoutById(layoutId), [layoutId]);

  const [areas, setAreas] = useState<RichMenuAreaConfig[]>(() =>
    createDefaultAreas(getLayoutById("large-2x3").cells.length, "large-2x3"),
  );

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

        setName(menu.name);
        setChatBarText(menu.chatBarText);
        setMenuType(menu.menuType);
        setLayoutId(resolvedLayoutId);
        setImagePreview(menu.imageUrl ?? null);
        setAreas(
          Array.isArray(menu.areas) && menu.areas.length > 0
            ? menu.areas
            : createDefaultAreas(
                getLayoutById(resolvedLayoutId).cells.length,
                resolvedLayoutId,
              ),
        );
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
    setLayoutId(nextLayoutId);
    setAreas(createDefaultAreas(nextLayout.cells.length, nextLayoutId));
    setSelectedAreaIndex(0);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a PNG or JPEG image");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("Image must be 1 MB or smaller");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const updateArea = (index: number, nextArea: RichMenuAreaConfig) => {
    setAreas((current) =>
      current.map((area, areaIndex) =>
        areaIndex === index ? nextArea : area,
      ),
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Menu name is required");
      return false;
    }

    if (!chatBarText.trim()) {
      toast.error("Chat bar text is required");
      return false;
    }

    if (chatBarText.length > 14) {
      toast.error("Chat bar text must be 14 characters or less");
      return false;
    }

    if (!imageFile && !imagePreview) {
      toast.error("Please upload a rich menu image");
      return false;
    }

    for (const [index, area] of areas.entries()) {
      if (!area.label.trim()) {
        toast.error(`Label is required for area ${index + 1}`);
        return false;
      }

      if (area.actionType === "uri" && !area.uri?.trim()) {
        toast.error(`URL is required for area ${index + 1}`);
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
              : "Build a LINE rich menu with clickable areas, similar to LINE Official Account Manager"}
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
                  className={inputClassName}
                  readOnly={isViewMode}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chat bar text * (max 14)
                </label>
                <Input
                  value={chatBarText}
                  maxLength={14}
                  onChange={(event) => setChatBarText(event.target.value)}
                  className={inputClassName}
                  readOnly={isViewMode}
                />
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
              Layout template
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Choose how the menu is divided into tap areas
            </p>
            <LayoutPicker
              layouts={RICH_MENU_LAYOUTS}
              selectedLayoutId={layoutId}
              onSelect={handleLayoutChange}
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
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
              {imagePreview ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Uploaded rich menu"
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
                    PNG or JPEG, max 1 MB. Recommended {layout.size.width}×
                    {layout.size.height}px
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
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Preview & area selection
            </h2>
            <RichMenuCanvas
              layout={layout}
              imagePreview={imagePreview}
              areas={areas}
              selectedIndex={selectedAreaIndex}
              onSelectArea={setSelectedAreaIndex}
            />
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Area action
            </h2>
            <AreaEditor
              areaIndex={selectedAreaIndex}
              area={areas[selectedAreaIndex]}
              onChange={(nextArea) =>
                updateArea(selectedAreaIndex, nextArea)
              }
              readOnly={isViewMode}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {areas.map((area, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAreaIndex(index)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedAreaIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {index + 1}. {area.label}
                </button>
              ))}
            </div>
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
    </div>
  );
}
