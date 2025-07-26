import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { productId } = params;
    const { quantity } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
      });
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return new Response(
        JSON.stringify({ error: "Quantity must be at least 1" }),
        { status: 400 }
      );
    }

    const db = await getDb();

    const currentCart = await db
      .collection("carts")
      .findOne({ userEmail: session.user.email });

    if (!currentCart) {
      return new Response(JSON.stringify({ error: "Cart not found" }), {
        status: 404,
      });
    }

    const currentItems = currentCart.items || [];

    const itemIndex = currentItems.findIndex((item) => String(item.id) === String(productId));

    if (itemIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Product not found in cart" }),
        { status: 404 }
      );
    }

    // جلب المنتج من قاعدة البيانات والتحقق من الكمية المتوفرة
    const product = await db.collection("products").findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404 }
      );
    }
    const productStock = Number(product.quantity);
    const oldQuantity = Number(currentItems[itemIndex].quantity) || 1;
    const diff = Number(quantity) - oldQuantity;
    // إذا زاد المستخدم الكمية
    if (diff > 0) {
      if (diff > productStock) {
        return new Response(
          JSON.stringify({ error: "Not enough stock available", available: productStock }),
          { status: 400 }
        );
      }
      // خصم الفرق من المخزون
      const newStockQuantity = productStock - diff;
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        { $set: { quantity: newStockQuantity.toString() } }
      );
    } else if (diff < 0) {
      // إذا قلل المستخدم الكمية، أرجع الفرق للمخزون
      const newStockQuantity = productStock + Math.abs(diff);
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        { $set: { quantity: newStockQuantity.toString() } }
      );
    }
    currentItems[itemIndex].quantity = Number(quantity);

    const updatedCart = await db.collection("carts").findOneAndUpdate(
      { userEmail: session.user.email },
      {
        $set: {
          items: currentItems,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return new Response(
      JSON.stringify(updatedCart.value || { items: currentItems }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return new Response(JSON.stringify({ error: "Failed to update cart" }), {
      status: 500,
    });
  }
}
