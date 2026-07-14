import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";

interface BroadcastParams {
  params: Promise<{ id: string }>;
}

/**
 * Broadcast detail/edit page
 * Allows editing a specific broadcast by ID
 */
export default async function BroadcastEditPage({ params }: BroadcastParams) {
  const { id } = await params;

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Broadcasts", href: "/broadcasts" },
    { label: "Edit", isActive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Broadcast
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Modify the details of broadcast {id}
        </p>
      </div>

      {/* Form Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Broadcast edit form will be implemented here
        </p>
      </div>
    </div>
  );
}
