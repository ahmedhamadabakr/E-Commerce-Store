import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const db = await getDb();
    // اجلب السلة الحالية
    const currentCart = await db.collection("carts").findOne({ userEmail: session.user.email });
    if (currentCart && Array.isArray(currentCart.items)) {
      // أرجع الكميات لكل منتج
      for (const item of currentCart.items) {
        const product = await db.collection("products").findOne({ _id: new ObjectId(item.id) });
        if (product) {
          const currentStock = Number(product.quantity);
          const newStockQuantity = currentStock + Number(item.quantity);
          await db.collection("products").updateOne(
            { _id: new ObjectId(item.id) },
            { $set: { quantity: newStockQuantity.toString() } }
          );
        }
      }
    }
    // أفرغ السلة
    const updatedCart = await db.collection("carts").findOneAndUpdate(
      { userEmail: session.user.email },
      { $set: { items: [], updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return new Response(JSON.stringify(updatedCart.value || { items: [] }), { status: 200 });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return new Response(JSON.stringify({ error: "Failed to clear cart" }), { status: 500 });
  }
} 