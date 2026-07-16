"use client";

import { useState } from "react";
import { useToast } from "@/lib/hooks/useToast";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api";

interface LineAccountFormProps {
  onSuccess?: () => void;
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

export function LineAccountForm({ onSuccess }: LineAccountFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isConnectionVerified, setIsConnectionVerified] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    channelAccessToken: "",
    channelSecret: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error and verified status when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setIsConnectionVerified(false);
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

    setTestingConnection(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.LINE.VERIFY, {
        method: "POST",
        headers,
        body: JSON.stringify({
          channelAccessToken: formData.channelAccessToken,
          channelSecret: formData.channelSecret,
          saveToDb: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Connection failed");
        return;
      }

      toast.success(
        `Connected successfully! Bot: ${data.botDisplayName}`
      );
      setFormData((prev) => ({
        ...prev,
        name: data.botDisplayName || prev.name,
      }));
      setIsConnectionVerified(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Connection test failed"
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isConnectionVerified) {
      toast.error("Please test connection first");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.LINE.VERIFY, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...formData,
          saveToDb: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to save LINE account");
        return;
      }

      toast.success("LINE account saved successfully!");
      setFormData({
        name: "",
        channelAccessToken: "",
        channelSecret: "",
      });
      setIsConnectionVerified(false);

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Account Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="My LINE OA"
          disabled={testingConnection}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            {errors.name}
          </p>
        )}
        {!errors.name && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Display name for your LINE Official Account
          </p>
        )}
      </div>

      {/* Channel Access Token */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Channel Access Token <span className="text-red-500">*</span>
        </label>
        <Input
          type="password"
          name="channelAccessToken"
          value={formData.channelAccessToken}
          onChange={handleInputChange}
          placeholder="Enter your channel access token"
          disabled={loading}
          aria-invalid={!!errors.channelAccessToken}
        />
        {errors.channelAccessToken && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            {errors.channelAccessToken}
          </p>
        )}
        {!errors.channelAccessToken && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Get this from LINE Developers console
          </p>
        )}
      </div>

      {/* Channel Secret */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Channel Secret <span className="text-red-500">*</span>
        </label>
        <Input
          type="password"
          name="channelSecret"
          value={formData.channelSecret}
          onChange={handleInputChange}
          placeholder="Enter your channel secret"
          disabled={loading}
          aria-invalid={!!errors.channelSecret}
        />
        {errors.channelSecret && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            {errors.channelSecret}
          </p>
        )}
        {!errors.channelSecret && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Keep this secret safe
          </p>
        )}
      </div>

      {/* Connection Status */}
      {isConnectionVerified && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-200">
            ✓ Connection verified. You can now save the account.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testingConnection || loading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {testingConnection && <Loader2 className="w-4 h-4 animate-spin" />}
          Test Connection
        </button>

        <button
          type="submit"
          disabled={loading || testingConnection || !isConnectionVerified}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Account
        </button>
      </div>
    </form>
  );
}
