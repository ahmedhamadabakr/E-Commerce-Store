import { getUsersCollection } from "@/utils/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    // تحقق من إدخال البيانات
    if (!firstName || !lastName || !email || !password) {
      return Response.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();

    // تحقق من وجود إيميل مستخدم بالفعل
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء مستخدم جديد
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    return Response.json(
      {
        message: "User registered successfully",
        user: {
          id: result.insertedId,
          email,
          name: `${firstName} ${lastName}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
