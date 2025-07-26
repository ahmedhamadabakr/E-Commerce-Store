// app/api/cart/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const db = await getDb();
    const cart = await db.collection("carts").findOne({ userEmail: session.user.email });
    return new Response(JSON.stringify(cart || { items: [] }), { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch cart" }), { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const db = await getDb();
    
    const updatedCart = await db.collection("carts").findOneAndUpdate(
      { userEmail: session.user.email },
      { 
        $set: { 
          items: body.items,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    return new Response(JSON.stringify(updatedCart.value || { items: [] }), { status: 200 });
  } catch (error) {
    console.error("Error updating cart:", error);
    return new Response(JSON.stringify({ error: "Failed to update cart" }), { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const db = await getDb();
    await db.collection("carts").deleteOne({ userEmail: session.user.email });
    return new Response(JSON.stringify({ message: "Cart cleared" }), { status: 200 });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return new Response(JSON.stringify({ error: "Failed to clear cart" }), { status: 500 });
  }
}
