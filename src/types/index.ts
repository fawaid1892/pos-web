// ─── Branch ───────────────────────────────────────────────────────────────────
export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone?: string;
  province?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchFormData {
  name: string;
  code: string;
  address: string;
  phone?: string;
  province?: string;
  city?: string;
  isActive: boolean;
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

// ─── FileText Settings ─────────────────────────────────────────────────────────
export interface FileTextSettings {
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

// ─── FileText Settings Form (untuk form input)
export type FileTextSettingsFormData = Omit<
  FileTextSettings,
  "id" | "branchId" | "updatedAt"
>;

// ─── User Form Data
export type UserFormData = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  barcode?: string;
  categoryName?: string;
  stockQty: number;
  minStock: number;
  branchId: string;
  branchName?: string;
  updatedAt: string;
}

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

export interface AdjustmentFormData {
  productId: string;
  type: "in" | "out";
  quantity: number;
  notes?: string;
}

export interface TransferFormData {
  productId: string;
  fromBranchId: string;
  toBranchId: string;
  quantity: number;
  notes?: string;
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

// ─── Promotion ───────────────────────────────────────────────────────────────
export interface Promotion {
  id: string;
  name: string;
  type: 'voucher' | 'bundling' | 'potongan_harga' | 'buy_x_get_y' | 'min_purchase';
  code?: string;
  discount_value: number;
  discount_type: 'persen' | 'nominal';
  sku_target?: string;
  qty_min: number;
  qty_free: number;
  start_date: string;
  end_date: string;
  branch_id?: string;
  is_active: boolean;
  max_uses: number;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionFormData {
  name: string;
  type: string;
  code?: string;
  discount_value: number;
  discount_type: string;
  sku_target?: string;
  qty_min: number;
  qty_free: number;
  start_date: string;
  end_date: string;
  branch_id?: string;
  is_active: boolean;
  max_uses: number;
}

export interface ValidateVoucherResponse {
  valid: boolean;
  discount_value?: number;
  discount_type?: string;
  promotion_name?: string;
  error?: string;
}

// ─── Role & Permission ─────────────────────────────────────────────────────────
export interface Permission {
  id: string;
  name: string;    // e.g. "products.read"
  label: string;   // e.g. "Lihat Produk"
  group: string;   // e.g. "products"
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions?: Permission[];
}
