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

export interface Category {
  category_id: number
  name: string
  description?: string
}

export interface Supplier {
  supplier_id: number
  name: string
  contact_person?: string
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