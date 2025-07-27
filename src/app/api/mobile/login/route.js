import { NextResponse } from "next/server";
import { getUsersCollection } from "@/utils/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const users = await getUsersCollection();
    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials: user not found" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials: wrong password" },
        { status: 401 }
      );
    }

    // ✅ إنشاء التوكن
    const token = jwt.sign(
      { userId: user._id.toString() }, // تأكد من تحويل الـ ObjectId ل string
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // مدة الصلاحية
    );

    return NextResponse.json({
      message: "Login successful",
      token, // ✅ أضفنا التوكن هنا
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
