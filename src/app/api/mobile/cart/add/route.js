import { verifyMobileToken } from "@/utils/mobileAuth";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    // التحقق من Bearer token للموبايل
    const mobileAuth = await verifyMobileToken(req);
    
    if (!mobileAuth) {
      return new Response(JSON.stringify({ 
        error: "Mobile authentication required",
        code: "MOBILE_AUTH_REQUIRED" 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { productId, quantity = 1 } = await req.json();
    
    // التحقق من صحة البيانات
    if (!productId) {
      return new Response(JSON.stringify({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (typeof quantity !== "number" || quantity < 1) {
      return new Response(JSON.stringify({ 
        error: "Quantity must be at least 1",
        code: "INVALID_QUANTITY"
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = await getDb();
    const userEmail = mobileAuth.user.email;

    // الحصول على السلة الحالية
    const currentCart = await db
      .collection("carts")
      .findOne({ userEmail });
      
    const currentItems = currentCart?.items || [];

    // التحقق من وجود المنتج في المتجر
    let product;
    try {
      product = await db
        .collection("products")
        .findOne({ _id: new ObjectId(productId) });
    } catch (err) {
      return new Response(JSON.stringify({ 
        error: "Invalid product ID format",
        code: "INVALID_PRODUCT_ID"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!product) {
      return new Response(JSON.stringify({ 
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // التحقق من المخزون
    const productQuantity = Number(product.quantity);
    const existingItemIndex = currentItems.findIndex(
      (item) => String(item.id) === String(productId)
    );

    let newQuantity;
    if (existingItemIndex !== -1) {
      // المنتج موجود بالفعل
      const currentCartQuantity = Number(currentItems[existingItemIndex].quantity) || 1;
      newQuantity = currentCartQuantity + Number(quantity);
      
      if (!isNaN(productQuantity) && newQuantity > productQuantity + currentCartQuantity) {
        return new Response(JSON.stringify({
          error: "Not enough stock available",
          code: "INSUFFICIENT_STOCK",
          available: productQuantity + currentCartQuantity,
          requested: newQuantity
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // تحديث الكمية في السلة
      currentItems[existingItemIndex].quantity = newQuantity;
      
      // خصم من المخزون
      const newStockQuantity = productQuantity - Number(quantity);
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        { $set: { quantity: newStockQuantity.toString() } }
      );
    } else {
      // منتج جديد
      newQuantity = Number(quantity);
      
      if (!isNaN(productQuantity) && newQuantity > productQuantity) {
        return new Response(JSON.stringify({
          error: "Not enough stock available",
          code: "INSUFFICIENT_STOCK",
          available: productQuantity,
          requested: newQuantity
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // إضافة منتج جديد للسلة
      currentItems.push({
        id: product._id.toString(),
        title: product.title,
        price: Number(product.price),
        quantity: newQuantity,
        image: product.photos && product.photos.length > 0 ? product.photos[0] : null,
        addedAt: new Date()
      });

      // خصم من المخزون
      const newStockQuantity = productQuantity - Number(quantity);
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        { $set: { quantity: newStockQuantity.toString() } }
      );
    }

    // حفظ السلة في قاعدة البيانات
    const updatedCart = await db.collection("carts").findOneAndUpdate(
      { userEmail },
      {
        $set: {
          items: currentItems,
          updatedAt: new Date(),
          platform: 'mobile',
          lastAction: 'add_to_cart'
        }
      },
      { upsert: true, returnDocument: "after" }
    );

    // إرجاع الاستجابة بتنسيق متوافق مع Flutter
    const responseData = {
      success: true,
      message: "Product added to cart successfully",
      items: currentItems,
      cart: updatedCart.value,
      platform: 'mobile'
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Mobile cart add error:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to add product to cart",
      code: "INTERNAL_ERROR",
      details: error.message,
      platform: 'mobile'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}