typescript
import { supabase } from '../lib/supabase'
import { Product, Category, Supplier, ProductFormData, Location, LocationFormData, CategoryFormData, SupplierFormData } from '../types/inventory'

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

  // Categories CRUD operations
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

  static async getCategoryById(categoryId: number): Promise<ServiceResult<Category>> {
    try {
      const { data, error } = await supabase.rpc('get_category_by_id', {
        p_category_id: categoryId
      })

      if (error) {
        console.error('Error fetching category:', error)
        return {
          success: false,
          message: 'Failed to fetch category details'
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Category not found'
        }
      }

      return {
        success: true,
        data: data[0],
        message: 'Category fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async createCategory(categoryData: CategoryFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('create_category', {
        p_name: categoryData.name,
        p_description: categoryData.description || null
      })

      if (error) {
        console.error('Error creating category:', error)
        return {
          success: false,
          message: 'Failed to create category'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error creating category:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async updateCategory(categoryId: number, categoryData: CategoryFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('update_category', {
        p_category_id: categoryId,
        p_name: categoryData.name,
        p_description: categoryData.description || null
      })

      if (error) {
        console.error('Error updating category:', error)
        return {
          success: false,
          message: 'Failed to update category'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error updating category:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async deleteCategory(categoryId: number): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('delete_category', {
        p_category_id: categoryId
      })

      if (error) {
        console.error('Error deleting category:', error)
        return {
          success: false,
          message: 'Failed to delete category'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  // Suppliers CRUD operations
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

  static async getSupplierById(supplierId: number): Promise<ServiceResult<Supplier>> {
    try {
      const { data, error } = await supabase.rpc('get_supplier_by_id', {
        p_supplier_id: supplierId
      })

      if (error) {
        console.error('Error fetching supplier:', error)
        return {
          success: false,
          message: 'Failed to fetch supplier details'
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Supplier not found'
        }
      }

      return {
        success: true,
        data: data[0],
        message: 'Supplier fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching supplier:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async createSupplier(supplierData: SupplierFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('create_supplier', {
        p_name: supplierData.name,
        p_contact_person: supplierData.contact_person || null,
        p_phone: supplierData.phone || null,
        p_email: supplierData.email || null,
        p_address: supplierData.address || null
      })

      if (error) {
        console.error('Error creating supplier:', error)
        return {
          success: false,
          message: 'Failed to create supplier'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async updateSupplier(supplierId: number, supplierData: SupplierFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('update_supplier', {
        p_supplier_id: supplierId,
        p_name: supplierData.name,
        p_contact_person: supplierData.contact_person || null,
        p_phone: supplierData.phone || null,
        p_email: supplierData.email || null,
        p_address: supplierData.address || null
      })

      if (error) {
        console.error('Error updating supplier:', error)
        return {
          success: false,
          message: 'Failed to update supplier'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async deleteSupplier(supplierId: number): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('delete_supplier', {
        p_supplier_id: supplierId
      })

      if (error) {
        console.error('Error deleting supplier:', error)
        return {
          success: false,
          message: 'Failed to delete supplier'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  // Locations CRUD operations
  static async getAllLocations(): Promise<ServiceResult<Location[]>> {
    try {
      const { data, error } = await supabase.rpc('get_all_locations')

      if (error) {
        console.error('Error fetching locations:', error)
        return {
          success: false,
          message: 'Failed to fetch locations'
        }
      }

      return {
        success: true,
        data: data || [],
        message: 'Locations fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async getLocationById(locationId: number): Promise<ServiceResult<Location>> {
    try {
      const { data, error } = await supabase.rpc('get_location_by_id', {
        p_location_id: locationId
      })

      if (error) {
        console.error('Error fetching location:', error)
        return {
          success: false,
          message: 'Failed to fetch location details'
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Location not found'
        }
      }

      return {
        success: true,
        data: data[0],
        message: 'Location fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching location:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async createLocation(locationData: LocationFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('create_location', {
        p_name: locationData.name,
        p_address: locationData.address || null,
        p_is_active: locationData.is_active
      })

      if (error) {
        console.error('Error creating location:', error)
        return {
          success: false,
          message: 'Failed to create location'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error creating location:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async updateLocation(locationId: number, locationData: LocationFormData): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('update_location', {
        p_location_id: locationId,
        p_name: locationData.name,
        p_address: locationData.address || null,
        p_is_active: locationData.is_active
      })

      if (error) {
        console.error('Error updating location:', error)
        return {
          success: false,
          message: 'Failed to update location'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error updating location:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async deleteLocation(locationId: number): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('delete_location', {
        p_location_id: locationId
      })

      if (error) {
        console.error('Error deleting location:', error)
        return {
          success: false,
          message: 'Failed to delete location'
        }
      }

      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}
