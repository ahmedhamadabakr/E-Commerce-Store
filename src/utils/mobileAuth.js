import * as jwt from 'jsonwebtoken';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

export async function verifyMobileToken(req) {
  console.log('🔍 Mobile Auth - Starting verification...');
  
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Mobile Auth - No Bearer token');
      return null;
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔍 Decoded userId:', decoded.userId);
    
    const db = await getDb();
    
    // ✅ ابحث بـ userId بدلاً من email
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId)
    });
    
    console.log('🔍 Mobile Auth - User found:', !!user);
    
    if (!user) {
      console.log('❌ Mobile Auth - User not found with userId:', decoded.userId);
      return null;
    }
    
    console.log('✅ Mobile Auth - Success! Found user:', user.email || user.name);
    return {
      user: {
        email: user.email,
        _id: user._id,
        name: user.name || user.fullName
      }
    };
  } catch (error) {
    console.error('❌ Mobile Auth Error:', error.message);
    return null;
  }
}