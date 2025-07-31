import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const adminEmails = ["ahmedhamadabakr77@gmail.com", "f.mumen@drwazaq8.com"];
  const userEmail = session?.user?.email;
  const isAdmin = session && adminEmails.includes(userEmail);

  if (!isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  const adminEmails = ["ahmedhamadabakr77@gmail.com", "f.mumen@drwazaq8.com"];
  const userEmail = session?.user?.email;
  const isAdmin = session && adminEmails.includes(userEmail);

  if (!isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });
    console.log(product);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type");
    let data = {};
    let photoUrls = [];

    // دالة رفع صورة واحدة
    const uploadToCloudinary = (buffer, filename) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "products",
            resource_type: "image",
            public_id: `products/${Date.now()}-${filename}`,
            overwrite: true,
            transformation: [{ width: 1000, height: 1000, crop: "limit" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data.title = formData.get("title");
      data.description = formData.get("description");
      data.price = formData.get("price");
      data.quantity = formData.get("quantity");
      data.category = formData.get("category");

      const photos = formData.getAll("photos");

      for (const file of photos) {
        if (typeof file === "object" && file.arrayBuffer) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const url = await uploadToCloudinary(buffer, file.name);
          photoUrls.push(url);
        }
      }
    } else {
      data = await req.json();
    }

    // إعداد البيانات للتحديث
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    // فقط لو فيه صور جديدة
    if (photoUrls.length > 0) {
      updateData.photos = photoUrls;
    }

    await db
      .collection("products")
      .updateOne({ _id: new ObjectId(productId) }, { $set: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
