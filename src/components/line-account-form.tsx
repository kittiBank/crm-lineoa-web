"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/hooks/useToast";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  fetchLineAccount,
  testSavedLineAccount,
  verifyLineAccount,
} from "@/features/settings/lib/api";
import { LineOaInfo } from "@/features/settings/types";

interface LineAccountFormProps {
  onStatusChange?: (status: {
    loading: boolean;
    existing: boolean;
    verified: boolean;
    testing: boolean;
  }) => void;
  onOaInfoChange?: (info: LineOaInfo | null) => void;
}

interface FormData {
  name: string;
  channelAccessToken: string;
  channelSecret: string;
}

interface FormErrors {
  name?: string;
  channelAccessToken?: string;
  channelSecret?: string;
}

export function LineAccountForm({
  onStatusChange,
  onOaInfoChange,
}: LineAccountFormProps) {
  const toast = useToast();
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const [isConnectionVerified, setIsConnectionVerified] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    channelAccessToken: "",
    channelSecret: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const fieldsDisabled = isExistingAccount || loading || testingConnection;

  useEffect(() => {
    onStatusChange?.({
      loading: loadingAccount,
      existing: isExistingAccount,
      verified: isConnectionVerified,
      testing: testingConnection,
    });
  }, [
    loadingAccount,
    isExistingAccount,
    isConnectionVerified,
    testingConnection,
    onStatusChange,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const data = await fetchLineAccount();
        if (cancelled || !data.connected) {
          return;
        }

        setFormData({
          name: data.name ?? "",
          channelAccessToken: data.channelAccessToken ?? "",
          channelSecret: data.channelSecret ?? "",
        });
        setIsExistingAccount(true);
        onOaInfoChange?.(data.oaInfo ?? null);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load LINE account",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAccount(false);
        }
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
    // Load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isExistingAccount) {
      return;
    }

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setIsConnectionVerified(false);
    onOaInfoChange?.(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Account Name is required";
    }
    if (!formData.channelAccessToken.trim()) {
      newErrors.channelAccessToken = "Channel Access Token is required";
    }
    if (!formData.channelSecret.trim()) {
      newErrors.channelSecret = "Channel Secret is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!isExistingAccount) {
      const testErrors: FormErrors = {};

      if (!formData.channelAccessToken.trim()) {
        testErrors.channelAccessToken = "Channel Access Token is required";
      }
      if (!formData.channelSecret.trim()) {
        testErrors.channelSecret = "Channel Secret is required";
      }

      if (Object.keys(testErrors).length > 0) {
        setErrors(testErrors);
        return;
      }
    }

    setTestingConnection(true);
    try {
      const data = isExistingAccount
        ? await testSavedLineAccount()
        : await verifyLineAccount({
            channelAccessToken: formData.channelAccessToken,
            channelSecret: formData.channelSecret,
            saveToDb: false,
          });

      toast.success(`Connected successfully! Bot: ${data.botDisplayName}`);

      if (!isExistingAccount && data.botDisplayName) {
        setFormData((prev) => ({
          ...prev,
          name: data.botDisplayName || prev.name,
        }));
      }

      if (data.oaInfo) {
        onOaInfoChange?.(data.oaInfo);
      }

      setIsConnectionVerified(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Connection test failed",
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isExistingAccount) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!isConnectionVerified) {
      toast.error("Please test connection first");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyLineAccount({
        ...formData,
        saveToDb: true,
      });

      toast.success("LINE account saved successfully!");
      setIsExistingAccount(true);
      setIsConnectionVerified(true);
      if (data.oaInfo) {
        onOaInfoChange?.(data.oaInfo);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save account",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingAccount) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading LINE account...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isExistingAccount && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            LINE Official Account is already connected. Credentials are locked.
            You can still test the connection to refresh profile data.
          </p>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="My LINE OA"
          disabled={fieldsDisabled}
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">
            {errors.name}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Display name for your LINE Official Account
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Channel Access Token <span className="text-red-500">*</span>
        </label>
        <Input
          type="password"
          name="channelAccessToken"
          value={formData.channelAccessToken}
          onChange={handleInputChange}
          placeholder="Enter your channel access token"
          disabled={fieldsDisabled}
          aria-invalid={!!errors.channelAccessToken}
        />
        {errors.channelAccessToken ? (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">
            {errors.channelAccessToken}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Get this from LINE Developers console
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Channel Secret <span className="text-red-500">*</span>
        </label>
        <Input
          type="password"
          name="channelSecret"
          value={formData.channelSecret}
          onChange={handleInputChange}
          placeholder="Enter your channel secret"
          disabled={fieldsDisabled}
          aria-invalid={!!errors.channelSecret}
        />
        {errors.channelSecret ? (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">
            {errors.channelSecret}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Keep this secret safe
          </p>
        )}
      </div>

      {isConnectionVerified && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-200">
            {isExistingAccount
              ? "Connection verified. LINE OA profile on the right was refreshed."
              : "Connection verified. You can now save the account."}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testingConnection || loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {testingConnection && <Loader2 className="h-4 w-4 animate-spin" />}
          Test Connection
        </button>

        {!isExistingAccount && (
          <button
            type="submit"
            disabled={loading || testingConnection || !isConnectionVerified}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Account
          </button>
        )}
      </div>
    </form>
  );
}
