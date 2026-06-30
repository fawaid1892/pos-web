// ─── Branch ───────────────────────────────────────────────────────────────────
export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone?: string;
  province?: string;
  province_code?: string;
  city?: string;
  city_code?: string;
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
  province_code?: string;
  city?: string;
  city_code?: string;
  isActive: boolean;
}

// ─── User & Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username?: string;   // new field, optional for backward compat
  full_name?: string;  // new field, optional for backward compat
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager" | "superadmin" | "owner";
  branchId?: number;
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
  activeBranchId: number;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  categoryId: number;
  unit: string;
  stock: number;
  barcode?: string;
  image?: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export type PaymentMethod = "cash" | "qris" | "debit" | "credit" | "ewallet";

export interface TransactionItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  /** Per-item manual discount in percent (0-100), 0 = no discount */
  discountPercent: number;
}

export interface AppliedPromotion {
  promotionId: number;
  promotionName: string;
  type: string;
  discountValue: number;
  description: string;
}

export interface Transaction {
  id: number;
  branchId: number;
  cashierId: number;
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
  id: number;
  branchId: number;
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
  id: number;
  productId: number;
  productName: string;
  barcode?: string;
  categoryName?: string;
  stockQty: number;
  minStock: number;
  branchId: number;
  branchName?: string;
  updatedAt: string;
}

export interface StockMutation {
  id: number;
  productId: number;
  fromBranchId?: number;
  toBranchId?: number;
  quantity: number;
  type: "in" | "out" | "transfer" | "adjustment";
  note?: string;
  createdAt: string;
}

export interface AdjustmentFormData {
  productId: number;
  type: "in" | "out";
  quantity: number;
  notes?: string;
}

export interface TransferFormData {
  productId: number;
  fromBranchId: number;
  toBranchId: number;
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
  id: number;
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
  scope: 'all' | 'province' | 'city' | 'selected';
  province_id?: number;
  city_id?: number;
  branches?: { promotion_id: number; branch_id: number }[];
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
  scope: string;
  province_id?: number;
  city_id?: number;
  branch_ids?: number[];
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
  id: number;
  name: string;    // e.g. "products.read"
  label: string;   // e.g. "Lihat Produk"
  group: string;   // e.g. "products"
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  permissions?: Permission[];
}
