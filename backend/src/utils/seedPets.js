const User = require('../models/User');
const Pet = require('../models/Pet');
const bcrypt = require('bcryptjs');

const cities = [
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Madurai', state: 'Tamil Nadu', pincode: '625001' },
  { city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001' },
  { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Kochi', state: 'Kerala', pincode: '682001' },
  { city: 'Trichy', state: 'Tamil Nadu', pincode: '620001' },
  { city: 'Salem', state: 'Tamil Nadu', pincode: '636001' }
];

const categoryData = {
  Goat: {
    breeds: ['Jamunapari', 'Boer', 'Sirohi', 'Barbari', 'Tellicherry', 'Salem Black', 'Osmanabadi', 'Kanni Aadu'],
    images: [
      'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552845294-4b5a89475027?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1532517308703-01826b1f8f3b?auto=format&fit=crop&w=600&q=80'
    ],
    descriptions: [
      'Healthy active breeder goat. Perfect for farming and dairy production. Feed-trained and vaccinated.',
      'Premium breed showing rapid growth characteristics. Ideal for breeding programs.',
      'Docile temperament, well adapted to hot climates. Feed includes dry fodder and grass.',
      'Sturdy kid with high immunity. Raised in clean conditions under veterinary supervision.'
    ],
    priceRange: { min: 4500, max: 22000 }
  },
  Rabbit: {
    breeds: ['New Zealand White', 'Soviet Chinchilla', 'Flemish Giant', 'Dutch Rabbit', 'Angora Rabbit'],
    images: [
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80'
    ],
    descriptions: [
      'Cute active companion. Friendly temperament, accustomed to handling by kids.',
      'Premium rabbit with excellent fur quality. Consumes leafy greens and rabbit pellets.',
      'Active and playful bunny. Clean ears and teeth, fully health checked by a local vet.',
      'A perfect home pet. Extremely quiet and clean. Litter trained and ready to go.'
    ],
    priceRange: { min: 400, max: 2500 }
  },
  Chicken: {
    breeds: ['Asil', 'Peruvodi', 'Kadaknath', 'Giriraja', 'Gramapriya', 'Vanaraja'],
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1569254994521-ddb5a7078e66?auto=format&fit=crop&w=600&q=80'
    ],
    descriptions: [
      'Pure native breed cockerel. Highly active and strong bone structure. Natural feeding.',
      'Healthy disease-resistant chicken. Well suited for backyard farming.',
      'Black meat specialty breed. High nutritional value and very active.',
      'Premium quality country chick. High growth rate, fed with quality starters.'
    ],
    priceRange: { min: 250, max: 3500 }
  },
  Duck: {
    breeds: ['Kuttanad Duck', 'Campbell Duck', 'Pekin Duck', 'Muscovy Duck', 'Runner Duck'],
    images: [
      'https://images.unsplash.com/photo-1555841113-d021f1d7a3c3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1574873618498-8db92fa1fb20?auto=format&fit=crop&w=600&q=80'
    ],
    descriptions: [
      'Great for pond stocking. Friendly group ducks, excellent egg layers.',
      'Active water-loving duck. Fully feathered and extremely healthy.',
      'Premium white Pekin duck. Perfect for homesteading and egg production.',
      'Highly active runner duck. Keeps garden pests clean. Very clean bill and feet.'
    ],
    priceRange: { min: 300, max: 1800 }
  },
  'Guinea Pig': {
    breeds: ['Abyssinian', 'American Guinea Pig', 'Peruvian', 'Silkie'],
    images: [
      'https://images.unsplash.com/photo-1534951009808-df615927ad92?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    ],
    descriptions: [
      'Loves head scratches and wheeks for veggies! Very docile and kid-friendly.',
      'Stunning rosette coat guinea pig. Healthy weight and clear bright eyes.',
      'Sweet little cavy. Easy maintenance, perfect first pet for children.',
      'Active guinea pig. Loves hay and fresh bell peppers. Very sociable animal.'
    ],
    priceRange: { min: 500, max: 3000 }
  },
  Other: {
    breeds: ['Gir Cow', 'Jersey Cow', 'Hamster', 'Lovebirds', 'Goldfish'],
    images: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501820488136-72669a482d14?auto=format&fit=crop&w=600&q=80'
    ],
    descriptions: [
      'Highly active and healthy listing. Perfect addition to your home farms.',
      'Very clean and responsive companion. Vaccinated and vet approved.',
      'Beautiful coloring and calm behavior. Ready to adapt to a new home.'
    ],
    priceRange: { min: 800, max: 45000 }
  }
};

const seedPets = async () => {
  try {
    // 1. Create or Verify Demo Buyer User
    const demoEmail = 'buyer@rvpetszone.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        fullName: 'Demo Buyer User',
        mobile: '9876543210',
        email: demoEmail,
        password: 'Password@123!',
        role: 'buyer'
      });
      console.log(`✅ Demo Buyer User created: ${demoEmail}`);
    } else {
      console.log(`ℹ️  Demo Buyer User already exists: ${demoEmail}`);
    }

    // Get Admin user to assign listings to (if user hasn't registered any)
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️ Admin user not found. Cannot seed pets.');
      return;
    }

    // 2. Check current Pet count
    const petCount = await Pet.countDocuments();
    if (petCount >= 450) {
      console.log(`ℹ️  Pet DB already has ${petCount} listings. Skipping seed.`);
      return;
    }

    console.log(`⏳ Seeding 500+ pet listings (currently ${petCount})...`);

    // Remove existing seeded pets to avoid bloating if re-running
    if (petCount > 0) {
      await Pet.deleteMany({ seller: adminUser._id });
      console.log('🧹 Cleaned up old admin-owned seeded listings');
    }

    const categories = Object.keys(categoryData);
    const petsToInsert = [];

    // We generate 510 pets (85 per category)
    const countPerCategory = 85;

    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
      const type = categories[catIndex];
      const data = categoryData[type];

      for (let i = 0; i < countPerCategory; i++) {
        const breed = data.breeds[i % data.breeds.length];
        const name = `${breed} #${i + 1}`;
        const price = Math.floor(
          Math.random() * (data.priceRange.max - data.priceRange.min) + data.priceRange.min
        );
        const description = data.descriptions[i % data.descriptions.length] + ` This is listing number ${i+1} for breed ${breed}.`;
        const imageSrc = data.images[i % data.images.length];
        const loc = cities[Math.floor(Math.random() * cities.length)];

        // Availability status (~25% Sold Out)
        const availability = Math.random() < 0.25 ? 'Sold Out' : 'Available';

        // Vaccination status
        const vaccs = ['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated'];
        const vaccinationStatus = vaccs[Math.floor(Math.random() * vaccs.length)];

        // Random views (between 20 and 500)
        const views = Math.floor(Math.random() * 480) + 20;
        // Random enquiries (between 0 and 25)
        const enquiryCount = Math.floor(Math.random() * Math.min(25, Math.ceil(views / 5)));

        // Create Pet object
        petsToInsert.push({
          seller: adminUser._id,
          petName: name,
          petType: type,
          breed,
          gender: Math.random() < 0.5 ? 'Male' : 'Female',
          age: {
            value: Math.floor(Math.random() * 11) + 1,
            unit: Math.random() < 0.7 ? 'Months' : 'Weeks'
          },
          price,
          location: {
            city: loc.city,
            state: loc.state,
            pincode: loc.pincode
          },
          description,
          vaccinationStatus,
          images: [{ url: imageSrc, publicId: null }],
          status: 'approved', // make them live approved immediately
          featured: Math.random() < 0.1, // 10% featured
          availability,
          views,
          enquiryCount
        });
      }
    }

    // Bulk insert for speed
    await Pet.insertMany(petsToInsert);
    console.log(`🎉 Successfully seeded ${petsToInsert.length} approved pets!`);

  } catch (err) {
    console.error('❌ Pet seeding failed:', err.message);
  }
};

module.exports = { seedPets };
