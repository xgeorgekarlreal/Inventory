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

export interface RecordSaleFormData {
  product_id: number
  location_id: number
  quantity: number
  batch_id?: number | null
  reference_id?: string
  notes?: string
}

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
  user_id: string | null
}