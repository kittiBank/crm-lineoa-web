export const errorInputClassName =
  "border-red-500 focus:ring-red-500 dark:border-red-500";

export type MessageFieldErrors = {
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  altText?: string;
  contentsJson?: string;
};

export function RequiredMark() {
  return <span className="text-red-500">*</span>;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{message}</p>
  );
}
