import { NextResponse } from "next/server";
import { getUsersCollection } from "@/utils/mongodb";

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const users = await getUsersCollection();
    const result = await users.deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
