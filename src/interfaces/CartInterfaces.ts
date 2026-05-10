export interface CartRes {
  status: string
  numOfCartItems: number
  message?: string
  cartId: string
  data: Data
}

export interface Data {
  _id: string
  cartOwner: string
}

