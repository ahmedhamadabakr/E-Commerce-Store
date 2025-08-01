import { verifyMobileToken } from "@/utils/mobileAuth";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  try {
    const mobileAuth = await verifyMobileToken(req);

    if (!mobileAuth) {
      return new Response(
        JSON.stringify({
          error: "Mobile authentication required",
          code: "MOBILE_AUTH_REQUIRED",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { productId } = params;

    if (!productId) {
      return new Response(
        JSON.stringify({
          error: "Product ID is required",
          code: "MISSING_PRODUCT_ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const db = await getDb();
    const userEmail = mobileAuth.user.email;

    // الحصول على السلة الحالية
    const currentCart = await db.collection("carts").findOne({ userEmail });

    if (!currentCart || !currentCart.items) {
      return new Response(
        JSON.stringify({
          error: "Cart not found or empty",
          code: "CART_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const currentItems = currentCart.items || [];

    // البحث عن المنتج في السلة
    const itemIndex = currentItems.findIndex(
      (item) => String(item.id) === String(productId)
    );

    if (itemIndex === -1) {
      return new Response(
        JSON.stringify({
          error: "Product not found in cart",
          code: "PRODUCT_NOT_IN_CART",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // إرجاع الكمية إلى المخزون
    const removedItem = currentItems[itemIndex];
    try {
      await db
        .collection("products")
        .updateOne(
          { _id: new ObjectId(productId) },
          { $inc: { quantity: removedItem.quantity } }
        );
    } catch (err) {
      console.warn("Could not restore product quantity:", err);
    }

    // حذف المنتج من السلة
    currentItems.splice(itemIndex, 1);

    // تحديث السلة في قاعدة البيانات
    const updatedCart = await db.collection("carts").findOneAndUpdate(
      { userEmail },
      {
        $set: {
          items: currentItems,
          updatedAt: new Date(),
          platform: "mobile",
          lastAction: "remove_from_cart",
        },
      },
      { returnDocument: "after" }
    );

    const responseData = {
      success: true,
      message: "Product removed from cart successfully",
      items: currentItems,
      cart: updatedCart.value,
      platform: "mobile",
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mobile cart remove error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to remove product from cart",
        code: "INTERNAL_ERROR",
        details: error.message,
        platform: "mobile",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
