import { verifyMobileToken } from "@/utils/mobileAuth";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req, { params }) {
  try {
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
    
    const { productId } = params;
    const { quantity } = await req.json();
    
    if (!productId) {
      return new Response(JSON.stringify({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return new Response(JSON.stringify({ 
        error: "Valid quantity is required",
        code: "INVALID_QUANTITY"
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = await getDb();
    const userEmail = mobileAuth.user.email;

    // الحصول على السلة الحالية
    const currentCart = await db.collection("carts").findOne({ userEmail });
    
    if (!currentCart || !currentCart.items) {
      return new Response(JSON.stringify({
        error: "Cart not found or empty",
        code: "CART_NOT_FOUND"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentItems = currentCart.items || [];
    
    // البحث عن المنتج في السلة
    const itemIndex = currentItems.findIndex(
      (item) => String(item.id) === String(productId)
    );

    if (itemIndex === -1) {
      return new Response(JSON.stringify({
        error: "Product not found in cart",
        code: "PRODUCT_NOT_IN_CART"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // إذا كانت الكمية صفر، حذف المنتج
    if (quantity === 0) {
      const removedItem = currentItems[itemIndex];
      // إرجاع الكمية للمخزون
      try {
        await db.collection("products").updateOne(
          { _id: new ObjectId(productId) },
          { $inc: { quantity: removedItem.quantity } }
        );
      } catch (err) {
        console.warn('Could not restore product quantity:', err);
      }
      
      currentItems.splice(itemIndex, 1);
    } else {
      // تحديث الكمية
      const oldQuantity = currentItems[itemIndex].quantity;
      const quantityDiff = quantity - oldQuantity;
      
      // التحقق من المخزون إذا كانت الكمية تزيد
      if (quantityDiff > 0) {
        const product = await db.collection("products").findOne({ 
          _id: new ObjectId(productId) 
        });
        
        if (product && quantityDiff > Number(product.quantity)) {
          return new Response(JSON.stringify({
            error: "Not enough stock available",
            code: "INSUFFICIENT_STOCK",
            available: Number(product.quantity),
            requested: quantityDiff
          }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // خصم من المخزون
        await db.collection("products").updateOne(
          { _id: new ObjectId(productId) },
          { $inc: { quantity: -quantityDiff } }
        );
      } else if (quantityDiff < 0) {
        // إرجاع للمخزون
        await db.collection("products").updateOne(
          { _id: new ObjectId(productId) },
          { $inc: { quantity: Math.abs(quantityDiff) } }
        );
      }
      
      currentItems[itemIndex].quantity = quantity;
    }

    // تحديث السلة في قاعدة البيانات
    const updatedCart = await db.collection("carts").findOneAndUpdate(
      { userEmail },
      {
        $set: {
          items: currentItems,
          updatedAt: new Date(),
          platform: 'mobile',
          lastAction: 'update_cart'
        }
      },
      { returnDocument: "after" }
    );

    const responseData = {
      success: true,
      message: "Cart updated successfully",
      items: currentItems,
      cart: updatedCart.value,
      platform: 'mobile'
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Mobile cart update error:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to update cart",
      code: "INTERNAL_ERROR",
      details: error.message,
      platform: 'mobile'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}