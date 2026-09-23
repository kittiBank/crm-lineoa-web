"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import type { FormActionFooterMode } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import {
  ImagemapAreaEditor,
  ImagemapCanvas,
} from "@/features/rich-message/components";
import {
  errorInputClassName,
  FieldError,
  RequiredMark,
} from "@/features/rich-message/components/form-field";
import {
  createRichMessage,
  fetchRichMessageById,
  RichMessagePayload,
  updateRichMessage,
  uploadRichMessageImage,
} from "@/features/rich-message/lib/api";
import {
  computeBaseSize,
  createDefaultArea,
  createFullAreaBounds,
  IMAGEMAP_BASE_WIDTH,
  LINE_IMAGEMAP_MAX_AREAS,
  normalizeAreasWithBounds,
  rescaleAreas,
} from "@/features/rich-message/lib/imagemap-geometry";
import {
  computeAreaErrors,
  computeBasicInfoErrors,
} from "@/features/rich-message/lib/validate";
import { RichMessageAreaConfig } from "@/features/rich-message/types";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

// Backend caps the raw upload at 10 MB (templates.service.ts MAX_TEMPLATE_IMAGE_BYTES).
const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;

interface RichMessageBuilderContainerProps {
  messageId?: string;
  mode?: FormActionFooterMode;
}

function loadImageDimensions(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Failed to read image dimensions"));
    image.src = src;
  });
}

export function RichMessageBuilderContainer({
  messageId,
  mode,
}: RichMessageBuilderContainerProps) {
  const router = useRouter();
  const toast = useToast();
  const resolvedMode = mode ?? (messageId ? "edit" : "create");
  const isViewMode = resolvedMode === "view";
  const isEditMode = resolvedMode === "edit";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [baseSize, setBaseSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [areas, setAreas] = useState<RichMessageAreaConfig[]>([]);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(Boolean(messageId));
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const fieldErrors = hasAttemptedSubmit
    ? computeBasicInfoErrors(name, altText, Boolean(imageFile || imagePreview))
    : {};
  const areaErrorsMap = hasAttemptedSubmit ? computeAreaErrors(areas) : {};

  useEffect(() => {
    if (!messageId) {
      return;
    }

    let isCancelled = false;

    const loadMessage = async () => {
      setIsLoadingMessage(true);
      try {
        const record = await fetchRichMessageById(messageId);
        if (isCancelled) {
          return;
        }

        const block = record.messages[0];
        const size = block?.baseSize ?? {
          width: IMAGEMAP_BASE_WIDTH,
          height: IMAGEMAP_BASE_WIDTH,
        };

        setName(record.name);
        setDescription(record.description ?? "");
        setAltText(block?.altText ?? "");
        setImagePreview(block?.imageUrl ?? null);
        setBaseSize(size);
        setAreas(normalizeAreasWithBounds(block?.areas ?? [], size));
        setSelectedAreaIndex(0);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load rich message",
        );
        router.push("/rich-message");
      } finally {
        if (!isCancelled) {
          setIsLoadingMessage(false);
        }
      }
    };

    loadMessage();

    return () => {
      isCancelled = true;
    };
  }, [messageId]);

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Message", isActive: false },
    { label: "Rich Message", href: "/rich-message" },
    {
      label: isViewMode ? "View" : isEditMode ? "Edit" : "Create",
      isActive: true,
    },
  ];

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
      toast.error("Image must be 10 MB or smaller");
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    loadImageDimensions(objectUrl)
      .then(({ width, height }) => {
        const nextSize = computeBaseSize(width, height);

        setAreas((current) =>
          current.length > 0
            ? rescaleAreas(current, baseSize ?? nextSize, nextSize)
            : [createDefaultArea(createFullAreaBounds(nextSize))],
        );
        setBaseSize(nextSize);

        if (imagePreview?.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }
        setImageFile(file);
        setImagePreview(objectUrl);
        setSelectedAreaIndex(0);
      })
      .catch((error) => {
        URL.revokeObjectURL(objectUrl);
        toast.error(
          error instanceof Error ? error.message : "Failed to read image",
        );
      });
  };

  const updateArea = (index: number, nextArea: RichMessageAreaConfig) => {
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

    if (areas.length > LINE_IMAGEMAP_MAX_AREAS) {
      toast.error(`Maximum ${LINE_IMAGEMAP_MAX_AREAS} areas allowed`);
      return false;
    }

    const basicErrors = computeBasicInfoErrors(
      name,
      altText,
      Boolean(imageFile || imagePreview),
    );
    const areaErrors = computeAreaErrors(areas);

    if (Object.keys(basicErrors).length > 0 || Object.keys(areaErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !baseSize) {
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = imagePreview;
      if (imageFile) {
        const uploadResult = await uploadRichMessageImage(imageFile);
        finalImageUrl = uploadResult.url;
      }

      if (!finalImageUrl) {
        toast.error("Please upload a rich message image");
        return;
      }

      const payload: RichMessagePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        messages: [
          {
            type: "imagemap",
            imageUrl: finalImageUrl,
            altText: altText.trim(),
            baseSize,
            areas,
          },
        ],
      };

      if (isEditMode && messageId) {
        await updateRichMessage(messageId, payload);
        toast.success("Rich message updated successfully");
      } else {
        await createRichMessage(payload);
        toast.success("Rich message created successfully");
      }

      router.push("/rich-message");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save rich message",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedArea = areas[selectedAreaIndex];

  if (isLoadingMessage) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading rich message...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isViewMode
            ? "View Rich Message"
            : isEditMode
              ? "Edit Rich Message"
              : "Create Rich Message"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isViewMode
            ? "Review the rich message image and tap areas"
            : "Upload a broadcast image, then draw tappable areas that open a link or send a message"}
        </p>
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
                  Name <RequiredMark />
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
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={inputClassName}
                  readOnly={isViewMode}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Alt text <RequiredMark />
              </label>
              <p className="mb-1.5 text-xs text-gray-500 dark:text-gray-400">
                Max 400 characters, shown when the image can&apos;t load
              </p>
              <textarea
                value={altText}
                maxLength={400}
                onChange={(event) => setAltText(event.target.value)}
                rows={2}
                readOnly={isViewMode}
                className={`${inputClassName} resize-none ${
                  fieldErrors.altText ? errorInputClassName : ""
                }`}
                aria-invalid={Boolean(fieldErrors.altText)}
              />
              <FieldError message={fieldErrors.altText} />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Rich message image
            </h2>
            {isViewMode ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-6 py-10 text-center dark:border-gray-700">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="Rich message"
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
                      alt="Uploaded rich message"
                      referrerPolicy="no-referrer"
                      className="mx-auto max-h-48 rounded-lg object-contain"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {imageFile?.name ?? "Current image"}
                    </p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mb-3 h-10 w-10 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Upload rich message image
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PNG or JPEG, up to 10 MB. Any aspect ratio — LINE will
                      scale it to fit.
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

          {baseSize && imagePreview && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Preview & draw areas
              </h2>
              <ImagemapCanvas
                baseSize={baseSize}
                imagePreview={imagePreview}
                areas={areas}
                selectedIndex={selectedAreaIndex}
                onSelectArea={setSelectedAreaIndex}
                onChangeAreas={setAreas}
                readOnly={isViewMode}
              />
            </section>
          )}
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {baseSize && imagePreview && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Area action
              </h2>
              {selectedArea ? (
                <ImagemapAreaEditor
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
                        {index + 1}. {area.actionType === "uri" ? "Link" : "Message"}
                        {hasError && selectedAreaIndex !== index ? " ⚠" : ""}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {!isViewMode && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Publish
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Saving makes this rich message available to select when
                composing a broadcast or auto-reply.
              </p>
            </section>
          )}
        </div>
      </div>

      <FormActionFooter
        mode={resolvedMode}
        cancelHref="/rich-message"
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        createSaveLabel="Create Rich Message"
        editSaveLabel="Save Changes"
        savingLabel={isEditMode ? "Saving..." : "Creating..."}
      />
    </div>
  );
}
