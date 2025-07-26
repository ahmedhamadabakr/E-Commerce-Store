import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  console.log("API /api/cart/add called");
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    if (!session) {
      console.log("No session, unauthorized");
      return new Response("Unauthorized", { status: 401 });
    }
    const { productId, quantity = 1 } = await req.json();
    console.log("productId:", productId, "quantity:", quantity);

    if (!productId) {
      console.log("No productId provided");
      return new Response(JSON.stringify({ error: "Product ID is required" }), { status: 400 });
    }
    if (typeof quantity !== "number" || quantity < 1) {
      return new Response(
        JSON.stringify({ error: "Quantity must be at least 1" }),
        { status: 400 }
      );
    }

    const db = await getDb();
    console.log("db connected");

    // Get current cart
    const currentCart = await db.collection("carts").findOne({ userEmail: session.user.email });
    console.log("currentCart:", currentCart);
    const currentItems = currentCart?.items || [];
    console.log("currentItems before add:", currentItems);
    // Check if product already exists in cart
    const existingItemIndex = currentItems.findIndex(item => String(item.id) === String(productId));
    console.log("existingItemIndex:", existingItemIndex);

    let product;
    try {
      product = await db.collection("products").findOne({ _id: new ObjectId(productId) });
      console.log("product from db:", product);
    } catch (err) {
      console.error("Error fetching product from db:", err);
      return new Response(JSON.stringify({ error: "Invalid product ID format" }), { status: 400 });
    }
    if (!product) {
      console.log("Product not found for id:", productId);
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
    }
    const productQuantity = Number(product.quantity);
    console.log("productQuantity (converted):", productQuantity, "type:", typeof product.quantity);
    let newQuantity;
    if (existingItemIndex !== -1) {
      // المنتج موجود بالفعل في السلة
      const currentCartQuantity = Number(currentItems[existingItemIndex].quantity) || 1;
      newQuantity = currentCartQuantity + Number(quantity);
      console.log("currentCartQuantity:", currentCartQuantity, "newQuantity:", newQuantity);
      if (!isNaN(productQuantity) && newQuantity > productQuantity + currentCartQuantity) {
        console.log("Not enough stock. Requested:", newQuantity, "Available:", productQuantity + currentCartQuantity);
        return new Response(
          JSON.stringify({ error: "Not enough stock available", available: productQuantity + currentCartQuantity }),
          { status: 400 }
        );
      }
      // خصم الكمية المضافة فقط من المخزون
      const newStockQuantity = productQuantity - Number(quantity);
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        { $set: { quantity: newStockQuantity.toString() } }
      );
      currentItems[existingItemIndex].quantity = newQuantity;
      console.log("Updated quantity for existing item and deducted from stock");
    } else {
      // المنتج غير موجود في السلة
      newQuantity = Number(quantity);
      console.log("newQuantity (new item):", newQuantity);
      if (!isNaN(productQuantity) && newQuantity > productQuantity) {
        console.log("Not enough stock for new item. Requested:", newQuantity, "Available:", productQuantity);
        return new Response(
          JSON.stringify({ error: "Not enough stock available", available: productQuantity }),
          { status: 400 }
        );
      }
      // خصم الكمية من المخزون
      const newStockQuantity = productQuantity - Number(quantity);
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        { $set: { quantity: newStockQuantity.toString() } }
      );
      // Add new product to cart
      currentItems.push({
        id: product._id.toString(),
        title: product.title,
        price: product.price,
        quantity: newQuantity,
        image: product.photos && product.photos.length > 0 ? product.photos[0] : null,
      });
      console.log("Added new product to cart and deducted from stock");
    }
    console.log("currentItems after add:", currentItems);

    // Update cart in database
    let updatedCart;
    try {
      updatedCart = await db.collection("carts").findOneAndUpdate(
        { userEmail: session.user.email },
        {
          $set: {
            items: currentItems,
            updatedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      console.error("Error updating cart:", err);
      return new Response(JSON.stringify({ error: "Database error while updating cart" }), { status: 500 });
    }

    // إذا لم يتم إرجاع السلة بعد التحديث، أرجع العناصر مباشرة
    if (!updatedCart.value) {
      return new Response(JSON.stringify({ items: currentItems }), { status: 200 });
    }

    return new Response(JSON.stringify(updatedCart.value), { status: 200 });
  } catch (error) {
    console.error("Error in /api/cart/add:", error);
    return new Response(JSON.stringify({ error: "Failed to add to cart", details: error.message }), { status: 500 });
  }
} 