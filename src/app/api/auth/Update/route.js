import { NextResponse } from "next/server";
import { getUsersCollection } from "@/utils/mongodb";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      address,
      age,
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }
    const users = await getUsersCollection();
    const updateData = {
      firstName,
      lastName,
      phone: phone || "",
      gender: gender || "",
      address: address || "",
      age: age || "",
    };
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const result = await users.updateOne(
      { email },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  try {
    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Remove password before sending
    const { password, ...userData } = user;
    return NextResponse.json({ user: userData });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
