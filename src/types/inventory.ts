```typescript
export interface Product {
  product_id: number
  sku: string
  name: string
  description?: string
  unit_price: number
  supplier_id?: number
  supplier_name?: string
  category_id?: number
  category_name?: string
  metadata?: any
  created_at: string
  updated_at: string
  user_id: string
  total_quantity?: number
}

export interface ProductFormData {
  name: string
  sku: string
  description: string
  unit_price: number
  supplier_id: number | null
  category_id: number | null
  metadata?: any
}

export interface ProductFilters {
  search: string
  category_id: number | null
  supplier_id: number | null
}

export interface Category {
  category_id: number
  name: string
  description?: string | null
  user_id?: string
}

export interface CategoryFormData {
  name: string
  description: string | null
}

export interface Supplier {
  supplier_id: number
  name: string
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  user_id?: string
}

export interface SupplierFormData {
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
}

export interface Location {
  location_id: number
  name: string
  address?: string | null
  is_active: boolean
  user_id?: string
}

export interface LocationFormData {
  name: string
  address: string | null
  is_active: boolean
}

export type TransactionType = 
  'PURCHASE_RECEIPT' | 
  'SALE' | 
  'RETURN' | 
  'TRANSFER_OUT' | 
  'TRANSFER_IN' | 
  'ADJUSTMENT_ADD' | 
  'ADJUSTMENT_SUB' | 
  'INITIAL_STOCK'

export interface Transaction {
  transaction_id: number
  created_at: string
  product_name: string
  product_sku: string
  location_name: string
  batch_lot_number?: string | null
  transaction_type: TransactionType
  quantity_change: number
  user_email?: string | null
  notes?: string | null
  reference_id?: string | null
}

export interface TransactionFilters {
  start_date: string | null
  end_date: string | null
  transaction_types: TransactionType[]
  product_id: number | null
  location_id: number | null
}

export interface Batch {
  batch_id: number
  product_id: number
  lot_number: string
  expiry_date?: string | null // ISO date string
  received_date: string // ISO date string
  user_id: string
}

export interface StockOnHandItem {
  stock_on_hand_id: number
  product_id: number
  product_name: string
  sku: string
  location_id: number
  location_name: string
  batch_id: number | null
  lot_number: string | null
  expiry_date: string | null // ISO date string
  quantity: number
  last_updated: string
  user_id: string
}

export interface ReceiveStockFormData {
  product_id: number | null
  location_id: number | null
  quantity: number
  lot_number: string | null
  expiry_date: string | null
  notes: string | null
  reference_id: string | null
}

export interface AdjustStockFormData {
  product_id: number | null
  location_id: number | null
  quantity_change: number
  batch_id: number | null
  notes: string | null
  reference_id: string | null
}

export interface TransferStockFormData {
  product_id: number | null
  source_location_id: number | null
  destination_location_id: number | null
  quantity: number
  batch_id: number | null
  notes: string | null
  reference_id: string | null
}

export interface RecordSaleFormData {
  product_id: number | null
  location_id: number | null
  quantity: number
  batch_id: number | null
  notes: string | null
  reference_id: string | null
}
```