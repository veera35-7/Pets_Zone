const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rvpetszone.com';
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { mobile: '9999999999' }]
    });

    if (!existingAdmin) {
      await User.create({
        fullName: process.env.ADMIN_NAME || 'RV Pets Zone Admin',
        mobile: '9999999999',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123!',
        role: 'admin'
      });
      console.log(`✅ Admin account created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${existingAdmin.email}`);
    }
  } catch (err) {
    console.error('❌ Admin seed error:', err.message);
  }
};

module.exports = { seedAdmin };
