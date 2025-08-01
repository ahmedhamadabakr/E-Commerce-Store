import { verifyMobileToken } from "@/utils/mobileAuth";
import { getDb } from "@/utils/mongodb";

export async function GET(req) {
  try {
    const mobileAuth = await verifyMobileToken(req);
    
    if (!mobileAuth) {
      return new Response(JSON.stringify({ 
        error: "Mobile authentication required",
        code: "MOBILE_AUTH_REQUIRED" 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = await getDb();
    const userEmail = mobileAuth.user.email;

    const cart = await db.collection("carts").findOne({ userEmail });
    
    const responseData = {
      success: true,
      items: cart?.items || [],
      cart: cart,
      platform: 'mobile'
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Mobile cart fetch error:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to fetch cart",
      code: "INTERNAL_ERROR",
      details: error.message,
      platform: 'mobile'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}