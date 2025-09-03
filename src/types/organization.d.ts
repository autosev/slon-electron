export {}

declare global {
  interface Organization {
    id: number
    name: string
    website: string
  }

  interface Country {
    id: number
    code: string
    name: string
  }

  interface City {
    id: number
    name: string
  }

  interface Stock {
    id: number
    address: string
    note: string | null
    organization_id: number
    city_id: City['id']
    code: string
  }
}
