"use server"

import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"


export async function addToWishListAction(productId: string) {
  const session = await getServerSession(authOptions)

  if (session) {
    const response = await fetch("https://ecommerce.routemisr.com/api/v1/wishlist", {
      method: "POST",
      body: JSON.stringify({productId}),
      headers: {
        token: session.token,
        "Content-Type":"application/json"
      }
    })
    const data = await response.json();
    return data
  }else {
    return null
  }
}