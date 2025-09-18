import { supabase } from '../lib/supabase'

export interface PersonaValidationResult {
  success: boolean
  message: string
}

export class PersonaService {
  static async validateAdminPersona(password: string): Promise<PersonaValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_template_account_password', {
        p_account_password: password
      })

      if (error) {
        console.error('Admin validation error:', error)
        return {
          success: false,
          message: 'Failed to validate admin credentials'
        }
      }

      // The function returns a table, so we get the first row
      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Admin validation error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async validateStaffPersona(loginName: string, password: string): Promise<PersonaValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_template_staff_user', {
        p_login_name: loginName,
        p_login_password: password
      })

      if (error) {
        console.error('Staff validation error:', error)
        return {
          success: false,
          message: 'Failed to validate staff credentials'
        }
      }

      // The function returns a table, so we get the first row
      const result = data?.[0]
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred'
      }
    } catch (error) {
      console.error('Staff validation error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}