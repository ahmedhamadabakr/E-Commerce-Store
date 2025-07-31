import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  const adminEmails = ["ahmedhamadabakr77@gmail.com","f.mumen@drwazaq8.com"];
  const userEmail = session?.user?.email;
  const isAdmin = session && adminEmails.includes(userEmail);

  if (!isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
