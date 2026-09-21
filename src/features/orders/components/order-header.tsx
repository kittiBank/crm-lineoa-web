interface OrderHeaderProps {
  title?: string;
  description?: string;
}

export function OrderHeader({
  title = "Orders",
  description = "Track and fulfil orders placed through your LIFF shop",
}: OrderHeaderProps) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
        {description}
      </p>
    </div>
  );
}
