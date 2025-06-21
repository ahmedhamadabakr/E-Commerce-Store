// Product API only. Authentication is handled in src/app/api/auth/[...nextauth]/route.js
// Native MongoDB connection utility. Used by next-auth and other APIs.
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { ObjectId } from "mongodb"; // to replace id to object
import { getDb } from "@/utils/mongodb";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUsersCollection } from "@/utils/mongodb";
import bcrypt from "bcryptjs";

// Create authOptions inline since it's not exported from the NextAuth route
const authOptions = {
  providers: [  
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const users = await getUsersCollection();
        const user = await users.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        return { id: user._id.toString(), email: user.email, name: user.firstName + ' ' + user.lastName };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  // Admin authorization
  const session = await getServerSession(authOptions);
  const adminEmails = ['ahmedhamadabakr77@gmail.com'];
  const userEmail = session?.user?.email;
  const isAdmin = session && adminEmails.includes(userEmail);
  if (!isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
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
