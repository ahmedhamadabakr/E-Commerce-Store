import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { ObjectId } from "mongodb"; // to replace id to object

import { getDb } from "@/utils/mongodb";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    let data = {};
    let photoUrls = [];
    const contentType = req.headers.get("content-type"); //to get type of data json or formdata

    if (contentType && contentType.includes("multipart/form-data")) {///?????????????
      // Parse FormData
      const formData = await req.formData();

      data.title = formData.get("title");
      data.description = formData.get("description");
      data.price = formData.get("price");
      data.quantity = formData.get("quantity");
      data.category = formData.get("category");
      const photos = formData.getAll("photos");
      // رفع الصور إلى Cloudinary
      for (const file of photos) {
        if (typeof file === "object" && file.arrayBuffer) {
          const buffer = Buffer.from(await file.arrayBuffer());// بحول الصورة ل bufferعلشان تترفع استريم 
          const uploadRes = await cloudinary.uploader.upload_stream(
            {
              folder: "products",
            },
            (error, result) => {
              if (error) throw error;
              photoUrls.push(result.secure_url);
            }
          );
          // لأن cloudinary.uploader.upload_stream يعمل مع stream، نحتاج إلى stream
          // لذلك نستخدم promise
          await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) reject(error);
                else {
                  photoUrls.push(result.secure_url);
                  resolve();
                }
              }
            );
            stream.end(buffer);
          });
        }
      }
    } else {// if json can used it dirictly 
      // JSON
      data = await req.json();
      photoUrls = data.photos || [];
    }

    const db = await getDb();
    const result = await db.collection("products").insertOne({
      ...data,
      photos: photoUrls,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const product = await db
        .collection("products")
        .findOne({ _id: new ObjectId(id) });
      if (!product) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(product);
    }
    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
