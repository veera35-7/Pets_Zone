const mongoose = require('mongoose');
require('dotenv').config();
const { seedAdmin } = require('./seedAdmin');
const { seedPets } = require('./seedPets');

const seedAll = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI env variable is missing.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB Atlas for seeding...');

    await seedAdmin();
    await seedPets();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err.message);
    process.exit(1);
  }
};

seedAll();
