import { supabase } from '../lib/supabase'
import { Product, Category, Supplier, ProductFormData } from '../types/inventory'

export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  message: string
}

export class InventoryService {
  // Product CRUD operations
  static async getAllProducts(): Promise<ServiceResult<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('inv_products')
        .select(`
          product_id,
          sku,
          name,
          description,
          unit_price,
          supplier_id,
          category_id,
          metadata,
          created_at,
          updated_at,
          user_id,
          inv_suppliers(name),
          inv_categories(name)
        `)
        .order('name')

      if (error) {
        console.error('Error fetching products:', error)
        return {
          success: false,
          message: 'Failed to fetch products'
        }
      }

      // Transform the data to match our Product interface
      const products: Product[] = data?.map(item => ({
        product_id: item.product_id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        unit_price: item.unit_price,
        supplier_id: item.supplier_id,
        supplier_name: item.inv_suppliers?.name,
        category_id: item.category_id,
        category_name: item.inv_categories?.name,
        metadata: item.metadata,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user_id
      })) || []

      return {
        success: true,
        data: products,
        message: 'Products fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async getProductById(productId: number): Promise<ServiceResult<Product>> {
    try {
      const { data, error } = await supabase.rpc('get_product_by_id', {
        p_product_id: productId
      })

      if (error) {
        console.error('Error fetching product:', error)
        return {
          success: false,
          message: 'Failed to fetch product details'
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Product not found'
        }
      }

      const product: Product = {
        product_id: data[0].product_id,
        sku: data[0].sku,
        name: data[0].name,
        description: data[0].description,
        unit_price: data[0].unit_price,
        supplier_id: data[0].supplier_id,
        supplier_name: data[0].supplier_name,
        category_id: data[0].category_id,
        category_name: data[0].category_name,
        metadata: data[0].metadata,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        user_id: data[0].user_id,
        total_quantity: data[0].total_quantity
      }

      return {
        success: true,
        data: product,
        message: 'Product fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async createProduct(productData: ProductFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('create_product', {
        p_name: productData.name,
        p_sku: productData.sku,
        p_description: productData.description || null,
        p_unit_price: productData.unit_price,
        p_supplier_id: productData.supplier_id,
        p_category_id: productData.category_id,
        p_metadata: productData.metadata || null
      })

      if (error) {
        console.error('Error creating product:', error)
        return {
          success: false,
          message: 'Failed to create product'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error creating product:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async updateProduct(productId: number, productData: ProductFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('update_product', {
        p_product_id: productId,
        p_name: productData.name,
        p_sku: productData.sku,
        p_description: productData.description || null,
        p_unit_price: productData.unit_price,
        p_supplier_id: productData.supplier_id,
        p_category_id: productData.category_id,
        p_metadata: productData.metadata || null
      })

      if (error) {
        console.error('Error updating product:', error)
        return {
          success: false,
          message: 'Failed to update product'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error updating product:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async deleteProduct(productId: number): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('delete_product', {
        p_product_id: productId
      })

      if (error) {
        console.error('Error deleting product:', error)
        return {
          success: false,
          message: 'Failed to delete product'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  // Categories
  static async getAllCategories(): Promise<ServiceResult<Category[]>> {
    try {
      const { data, error } = await supabase.rpc('get_all_categories')

      if (error) {
        console.error('Error fetching categories:', error)
        return {
          success: false,
          message: 'Failed to fetch categories'
        }
      }

      return {
        success: true,
        data: data || [],
        message: 'Categories fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  // Suppliers
  static async getAllSuppliers(): Promise<ServiceResult<Supplier[]>> {
    try {
      const { data, error } = await supabase.rpc('get_all_suppliers')

      if (error) {
        console.error('Error fetching suppliers:', error)
        return {
          success: false,
          message: 'Failed to fetch suppliers'
        }
      }

      return {
        success: true,
        data: data || [],
        message: 'Suppliers fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}