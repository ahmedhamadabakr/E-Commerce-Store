
import { verifyMobileToken } from "@/utils/mobileAuth";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req) {
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

    const db = await getDb();
    const userEmail = mobileAuth.user.email;

    // الحصول على السلة الحالية لإرجاع المنتجات للمخزون
    const currentCart = await db.collection("carts").findOne({ userEmail });
    
    if (currentCart && currentCart.items && currentCart.items.length > 0) {
      // إرجاع جميع المنتجات للمخزون
      for (const item of currentCart.items) {
        try {
          await db.collection("products").updateOne(
            { _id: new ObjectId(item.id) },
            { $inc: { quantity: item.quantity } }
          );
        } catch (err) {
          console.warn(`Could not restore quantity for product ${item.id}:`, err);
        }
      }
    }

    // مسح السلة
    await db.collection("carts").updateOne(
      { userEmail },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
          platform: 'mobile',
          lastAction: 'clear_cart'
        }
      },
      { upsert: true }
    );

    const responseData = {
      success: true,
      message: "Cart cleared successfully",
      items: [],
      platform: 'mobile'
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Mobile cart clear error:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to clear cart",
      code: "INTERNAL_ERROR",
      details: error.message,
      platform: 'mobile'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}