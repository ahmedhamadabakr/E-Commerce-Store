import { verifyMobileToken } from "@/utils/mobileAuth";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req, { params }) {
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

    const { productId } = await params;
    const { quantity } = await req.json();

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

    if (typeof quantity !== "number" || quantity < 0) {
      return new Response(
        JSON.stringify({
          error: "Valid quantity is required",
          code: "INVALID_QUANTITY",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const db = await getDb();
    const userEmail = mobileAuth.user.email;

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

    if (quantity === 0) {
      const removedItem = currentItems[itemIndex];
      try {
            // أولاً جلب المنتج وتحديث quantity كرقم
        const product = await db.collection("products").findOne({ _id: new ObjectId(productId) });
        const currentQuantity = Number(product?.quantity) || 0;
        const newQuantity = currentQuantity + Number(removedItem.quantity);
        
        await db
          .collection("products")
          .updateOne(
            { _id: new ObjectId(productId) },
            { $set: { quantity: newQuantity } }
          );
      } catch (err) {
        console.warn("Could not restore product quantity:", err);
      }

      currentItems.splice(itemIndex, 1);
    } else {
      const oldQuantity = Number(currentItems[itemIndex].quantity) || 0;
      const quantityDiff = Number(quantity) - oldQuantity;

      if (quantityDiff > 0) {
        const product = await db.collection("products").findOne({
          _id: new ObjectId(productId),
        });

        const availableStock = Number(product?.quantity) || 0;
        if (quantityDiff > availableStock) {
          return new Response(
            JSON.stringify({
              error: "Not enough stock available",
              code: "INSUFFICIENT_STOCK",
              available: availableStock,
              requested: quantityDiff,
              currentInCart: oldQuantity,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // تحديث quantity كرقم
        const productForUpdate = await db.collection("products").findOne({ _id: new ObjectId(productId) });
        const currentProductQuantity = Number(productForUpdate?.quantity) || 0;
        const newProductQuantity = currentProductQuantity - Number(quantityDiff);
        
        await db
          .collection("products")
          .updateOne(
            { _id: new ObjectId(productId) },
            { $set: { quantity: newProductQuantity } }
          );
      } else if (quantityDiff < 0) {
        // تحديث quantity عند تقليل الكمية من العربة
        const productForDecrease = await db.collection("products").findOne({ _id: new ObjectId(productId) });
        const currentDecreaseQuantity = Number(productForDecrease?.quantity) || 0;
        const newDecreaseQuantity = currentDecreaseQuantity + Number(Math.abs(quantityDiff));
        
        await db
          .collection("products")
          .updateOne(
            { _id: new ObjectId(productId) },
            { $set: { quantity: newDecreaseQuantity } }
          );
      }

      currentItems[itemIndex].quantity = Number(quantity);
    }

    const updatedCart = await db.collection("carts").findOneAndUpdate(
      { userEmail },
      {
        $set: {
          items: currentItems,
          updatedAt: new Date(),
          platform: "mobile",
          lastAction: "update_cart",
        },
      },
      { returnDocument: "after" }
    );

    const responseData = {
      success: true,
      message: "Cart updated successfully",
      items: currentItems,
      cart: updatedCart.value,
      platform: "mobile",
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mobile cart update error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to update cart",
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
