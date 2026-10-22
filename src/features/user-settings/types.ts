export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  lineAccount: {
    id: string;
    name: string;
    displayName: string | null;
  } | null;
};

export type PaginatedUsers = {
  data: AdminUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateUserInput = {
  email: string;
  name: string;
  lineAccountId: string;
};
