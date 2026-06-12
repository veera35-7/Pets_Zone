const admin = require('firebase-admin');

let firebaseApp = null;
let isMock = false;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;

if (projectId && clientEmail && privateKey) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (err) {
    console.error('❌ Firebase Admin init error, falling back to Mock:', err.message);
    isMock = true;
  }
} else {
  console.log('⚠️ Firebase credentials not configured. Using MOCK verification mode.');
  isMock = true;
}

const verifyIdToken = async (token) => {
  if (isMock || !firebaseApp) {
    console.log('🔮 Firebase Mock token verification active');
    // If it's a mock token, decode the payload from mock string format "mock-uid-phone"
    if (token && token.startsWith('mock-')) {
      const parts = token.split('-');
      const phone = parts[2] || '9876543210';
      return {
        phone_number: `+91${phone.slice(-10)}`,
        uid: `mock-uid-${phone}`,
        firebase: { sign_in_provider: 'phone' }
      };
    }
    return {
      phone_number: '+919876543210',
      uid: 'mock-uid-9876543210',
      firebase: { sign_in_provider: 'phone' }
    };
  }

  return admin.auth().verifyIdToken(token);
};

module.exports = { verifyIdToken, isMock };
