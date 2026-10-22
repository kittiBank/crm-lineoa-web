import { UserPlus } from "lucide-react";

interface UserSettingsHeaderProps {
  /** Shows the Create User button (super admin only). */
  onCreate?: () => void;
}

export function UserSettingsHeader({ onCreate }: UserSettingsHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Manage users and the LINE OA each user works on
        </p>
      </div>

      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="flex shrink-0 items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Create User
        </button>
      )}
    </div>
  );
}
