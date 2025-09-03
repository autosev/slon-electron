import { PanelMenuExpandedKeys } from 'primevue'
import type { Session } from '@supabase/supabase-js'
export {}

declare global {
  interface Employee {
    id: string
    first_name: string | null
    last_name: string | null
    stock_id: number | null
  }

  interface EmployeeRole {
    id: number
    name: string
    description: string
  }

  interface EmployeePermission {
    id: number
    name: string
    description: string
  }

  interface EmployeeRolePermission {
    id: number
    employee_role_id: EmployeeRole['id']
    employee_permission_id: EmployeePermission['id']
  }

  interface EmployeeRoleAssignment {
    id: integer
    employee_id: Employee['id']
    employee_role_id: EmployeeRole['id']
  }

  interface EmployeeData {
    id: Employee['id']
    first_name: Employee['first_name']
    last_name: Employee['last_name']
    stock_id: Employee['stock_id']
    phone: string
    roles: EmployeeRole['id'][]
  }

  interface EmployeeDataInsert {
    first_name: Employee['first_name']
    last_name: Employee['last_name']
    stock_id: Employee['stock_id'] | null
    phone: string
    roles: EmployeeRole['id'][]
  }
}
