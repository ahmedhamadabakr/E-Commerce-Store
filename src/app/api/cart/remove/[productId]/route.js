import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const { productId } = params;
    console.log("productId param:", productId);
    const db = await getDb();
    // اجلب السلة الحالية
    const currentCart = await db.collection("carts").findOne({ userEmail: session.user.email });
    if (!currentCart) {
      console.log("Cart not found for user:", session.user.email);
      return new Response(JSON.stringify({ error: "Cart not found" }), { status: 404 });
    }
    const currentItems = currentCart.items || [];
    console.log("currentItems in cart:", currentItems);
    // ابحث عن المنتج في السلة (تأكد من تطابق الأنواع)
    const itemIndex = currentItems.findIndex((item) => String(item.id) === String(productId));
    if (itemIndex === -1) {
      console.log("Product not found in cart. productId:", productId, "currentItems ids:", currentItems.map(i => i.id));
      return new Response(JSON.stringify({ error: "Product not found in cart" }), { status: 404 });
    }
    const removedItem = currentItems[itemIndex];
    
    // جلب المنتج من قاعدة البيانات أولاً
    let product;
    try {
      product = await db.collection("products").findOne({ _id: new ObjectId(productId) });
      if (!product) {
        console.log("Product not found in database for id:", productId);
        return new Response(JSON.stringify({ error: "Product not found in database" }), { status: 404 });
      }
    } catch (err) {
      console.error("Error fetching product from database:", err);
      return new Response(JSON.stringify({ error: "Invalid product ID format" }), { status: 400 });
    }
    
    // أرجع الكمية للمخزون وتأكد أنها رقم
    try {
      const currentStock = Number(product.quantity);
      const newStockQuantity = currentStock + Number(removedItem.quantity);
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        { $set: { quantity: newStockQuantity.toString() } }
      );
      console.log("Stock restored successfully. New stock:", newStockQuantity);
    } catch (err) {
      console.error("Error updating product quantity:", err);
      return new Response(JSON.stringify({ error: "Failed to update product quantity" }), { status: 500 });
    }
    
    // احذف المنتج من السلة
    currentItems.splice(itemIndex, 1);
    let updatedCart;
    try {
      updatedCart = await db.collection("carts").findOneAndUpdate(
        { userEmail: session.user.email },
        { $set: { items: currentItems, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
      console.log("Cart updated successfully after removal");
    } catch (err) {
      console.error("Error updating cart after removal:", err);
      return new Response(JSON.stringify({ error: "Failed to update cart after removal" }), { status: 500 });
    }
    return new Response(JSON.stringify(updatedCart.value || { items: currentItems }), { status: 200 });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return new Response(JSON.stringify({ error: "Failed to remove from cart", details: error.message }), { status: 500 });
  }
} 