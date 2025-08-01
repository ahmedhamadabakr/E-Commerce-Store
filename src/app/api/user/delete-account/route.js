import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";
import { getDb } from "@/utils/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required", success: false },
        { status: 401 }
      );
    }

    const db = await getDb();
    const userEmail = session.user.email;

    // البحث عن المستخدم
    const user = await db.collection("users").findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    const userId = user._id;

    // حذف جميع البيانات المرتبطة بالمستخدم
    const deleteOperations = [];

    // 1. حذف عربة التسوق
    deleteOperations.push(
      db.collection("carts").deleteMany({ userEmail })
    );

    // 2. حذف الطلبات (إذا كان لديك مجموعة orders)
    deleteOperations.push(
      db.collection("orders").deleteMany({ userEmail })
    );

    // 3. حذف المراجعات (إذا كان لديك مجموعة reviews)
    deleteOperations.push(
      db.collection("reviews").deleteMany({ 
        $or: [
          { userEmail },
          { userId: userId }
        ]
      })
    );

    // 4. حذف المفضلة (إذا كان لديك مجموعة wishlist)
    deleteOperations.push(
      db.collection("wishlist").deleteMany({ 
        $or: [
          { userEmail },
          { userId: userId }
        ]
      })
    );

    // 5. حذف بيانات المصادقة المحمولة (إذا كان لديك)
    deleteOperations.push(
      db.collection("mobile_sessions").deleteMany({ 
        $or: [
          { userEmail },
          { userId: userId }
        ]
      })
    );

    // تنفيذ جميع عمليات الحذف
    await Promise.allSettled(deleteOperations);

    // 6. أخيراً حذف المستخدم نفسه
    const deleteResult = await db.collection("users").deleteOne({ 
      _id: new ObjectId(userId) 
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete user account", success: false },
        { status: 500 }
      );
    }

    console.log(`Account deleted successfully for user: ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        success: false,
        details: error.message 
      },
      { status: 500 }
    );
  }
}
