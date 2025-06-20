import { NextResponse } from "next/server";
import { getUsersCollection } from "@/utils/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }
  try {
    const { firstName, lastName, email, phone, password, gender, address, age } = body;
    console.log({ firstName, lastName, email, phone, password, gender, address, age });
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "First name, last name, email, and password are required" }, { status: 400 });
    }
    const users = await getUsersCollection();
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      firstName,
      lastName,
      email,
      phone: phone || "",
      password: hashed,
      gender: gender || "",
      address: address || "",
      age: age || ""
    };
    await users.insertOne(user);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
} 


