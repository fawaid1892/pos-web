// ─── Branch ───────────────────────────────────────────────────────────────────
export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── User & Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username?: string;   // new field, optional for backward compat
  full_name?: string;  // new field, optional for backward compat
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager" | "superadmin" | "owner";
  branchId?: string;
  branch_name?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  activeBranchId: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  categoryId: string;
  unit: string;
  stock: number;
  barcode?: string;
  image?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export type PaymentMethod = "cash" | "qris" | "debit" | "credit" | "ewallet";

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  branchId: string;
  cashierId: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  changeAmount: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  createdAt: string;
}

// ─── Receipt Settings ─────────────────────────────────────────────────────────
export interface ReceiptSettings {
  id: string;
  branchId: string;
  headerText: string;
  footerText: string;
  fontFamily: "mono" | "sans" | "serif";
  fontSize: "sm" | "md" | "lg";
  logoUrl?: string;
  showLogo: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showItemNumber: boolean;
  showBarcode: boolean;
  paperWidth: "58mm" | "80mm";
  // Kop / identitas toko
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxId?: string;
  updatedAt: string;
}

// ─── Receipt Settings Form (untuk form input)
export type ReceiptSettingsFormData = Omit<
  ReceiptSettings,
  "id" | "branchId" | "updatedAt"
>;

// ─── User Form Data
export type UserFormData = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface StockMutation {
  id: string;
  productId: string;
  fromBranchId?: string;
  toBranchId?: string;
  quantity: number;
  type: "in" | "out" | "transfer" | "adjustment";
  note?: string;
  createdAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
