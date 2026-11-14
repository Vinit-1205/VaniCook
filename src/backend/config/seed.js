import bcrypt from 'bcryptjs';
import prisma from './database.js';

async function seed() {
  console.log('🌱 Starting CookConnect Phase 1 Database Seeding...');

  // Clean existing demonstration records
  await prisma.review.deleteMany();
  await prisma.bookingRequirement.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.groupRequest.deleteMany();
  await prisma.cookAvailability.deleteMany();
  await prisma.cookSociety.deleteMany();
  await prisma.householdLocation.deleteMany();
  await prisma.cookProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.society.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // Common password hash for test accounts
  const salt = await bcrypt.genSalt(10);
  const customerHash = await bcrypt.hash('Customer#123', salt);
  const cookHash = await bcrypt.hash('CookPass#123', salt);
  const adminHash = await bcrypt.hash('CookAdmin#2026', salt);

  // 1. Create Residential Societies
  const societiesData = [
    {
      name: 'Prestige Shantiniketan',
      locality: 'Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560048',
      latitude: 12.9899,
      longitude: 77.7281,
    },
    {
      name: 'Godrej Woods',
      locality: 'Sector 43',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201303',
      latitude: 28.5678,
      longitude: 77.3562,
    },
    {
      name: 'DLF The Icon (Phase 5)',
      locality: 'Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      latitude: 28.4595,
      longitude: 77.0266,
    },
    {
      name: 'Hiranandani Estate',
      locality: 'Ghodbunder Road',
      city: 'Thane, Mumbai',
      state: 'Maharashtra',
      postalCode: '400607',
      latitude: 19.2625,
      longitude: 72.9781,
    },
    {
      name: 'Aparna Sarovar Zenith',
      locality: 'Nallagandla',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500019',
      latitude: 17.4722,
      longitude: 78.3075,
    },
  ];

  const createdSocieties = [];
  for (const s of societiesData) {
    const soc = await prisma.society.create({ data: s });
    createdSocieties.push(soc);
  }
  console.log(`🏢 Created ${createdSocieties.length} residential societies.`);

  const prestige = createdSocieties[0];
  const godrej = createdSocieties[1];
  const dlf = createdSocieties[2];
  const hiranandani = createdSocieties[3];

  // 2. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cookconnect.in',
      passwordHash: adminHash,
      fullName: 'System Administrator',
      role: 'ADMIN',
      phone: '+91 9988776655',
      avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Admin',
    },
  });

  // 3. Create Demonstration Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'priya.sharma@example.com',
      passwordHash: customerHash,
      fullName: 'Priya Sharma',
      role: 'CUSTOMER',
      phone: '+91 9876543210',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      householdLocations: {
        create: {
          societyId: prestige.id,
          building: 'Tower B (Crescent)',
          flatNumber: '704',
          landmark: 'Opposite Central Clubhouse',
          isPrimary: true,
        },
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'rohit.verma@example.com',
      passwordHash: customerHash,
      fullName: 'Rohit Verma',
      role: 'CUSTOMER',
      phone: '+91 9823456781',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      householdLocations: {
        create: {
          societyId: dlf.id,
          building: 'Wing A',
          flatNumber: '1202',
          landmark: 'Near North Gate',
          isPrimary: true,
        },
      },
    },
  });

  console.log('👤 Created demo customers and admin.');

  // 4. Create Demonstration Cooks
  const cooksData = [
    {
      fullName: 'Sunita Devi',
      email: 'sunita.devi@cookconnect.in',
      phone: '+91 9811223344',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      bio: 'Expert home cook with 8 years of experience across Prestige & Palm Meadows societies. Known for soft phulkas, dal tadka, paneer gravies and healthy zero-soda meals.',
      experienceYears: 8,
      specialities: ['Phulka & Parathas', 'Dal Makhani', 'Light Oil Sabzi', 'Dry Paneer Tikka'],
      cuisines: ['North Indian', 'Punjabi'],
      dietaryPreferences: ['Pure Vegetarian', 'Vegetarian & Egg'],
      maxHouseholds: 4,
      serviceRadiusKm: 2.5,
      basePriceMonthly: 3600,
      rating: 4.9,
      totalReviews: 28,
      societies: [prestige.id],
    },
    {
      fullName: 'Ramesh Nair',
      email: 'ramesh.nair@cookconnect.in',
      phone: '+91 9822334455',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Specialist in authentic Kerala and Tamil Brahmin cuisine with 6 years experience. Expert at sambar, avial, crispy dosas, coconut chutneys and Kerala non-veg curries.',
      experienceYears: 6,
      specialities: ['Kerala Sadya specials', 'Crispy Dosa Batter', 'Appam & Stew', 'Fish Curry'],
      cuisines: ['South Indian', 'Continental & Breakfast'],
      dietaryPreferences: ['Pure Vegetarian', 'Non-Vegetarian'],
      maxHouseholds: 3,
      serviceRadiusKm: 3.0,
      basePriceMonthly: 3800,
      rating: 4.8,
      totalReviews: 19,
      societies: [prestige.id, dlf.id],
    },
    {
      fullName: 'Anita Joshi',
      email: 'anita.joshi@cookconnect.in',
      phone: '+91 9833445566',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Specialist in authentic Gujarati, Maharashtrian and Jain dietary cooking. No onion, no garlic options prepared in dedicated cookware upon request.',
      experienceYears: 5,
      specialities: ['Puran Poli', 'Thepla & Khakhra', 'Gujarati Kadhi', 'Jain Paneer Lababdar'],
      cuisines: ['Gujarati', 'Maharashtrian'],
      dietaryPreferences: ['Pure Vegetarian', 'Jain Friendly'],
      maxHouseholds: 4,
      serviceRadiusKm: 2.0,
      basePriceMonthly: 3400,
      rating: 4.9,
      totalReviews: 24,
      societies: [hiranandani.id, prestige.id],
    },
    {
      fullName: 'Kabir Biswas',
      email: 'kabir.biswas@cookconnect.in',
      phone: '+91 9844556677',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      bio: 'Trained chef turned neighbourhood home cook. Masters in Bengali delicacies and custom calorie-counted high-protein fitness meal preps.',
      experienceYears: 7,
      specialities: ['Bengali Mustard Fish (Shorshe)', 'Shukto', 'Grilled Chicken Salad', 'Keto Bowls'],
      cuisines: ['Bengali', 'Diet & Salads', 'Keto & High Protein'],
      dietaryPreferences: ['Non-Vegetarian', 'Pure Vegetarian'],
      maxHouseholds: 3,
      serviceRadiusKm: 4.0,
      basePriceMonthly: 4200,
      rating: 4.7,
      totalReviews: 16,
      societies: [godrej.id, prestige.id],
    },
    {
      fullName: 'Meenakshi Iyer',
      email: 'meenakshi.iyer@cookconnect.in',
      phone: '+91 9855667788',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      bio: 'Sattvic food practitioner with 10 years experience. Daily fresh rasam, kootu, millets preparation, and healthy oil-free cooking.',
      experienceYears: 10,
      specialities: ['Mysore Rasam', 'Millet Pongal', 'Coconut Sevai', 'Kootu'],
      cuisines: ['South Indian', 'Diet & Salads'],
      dietaryPreferences: ['Pure Vegetarian', 'Jain Friendly'],
      maxHouseholds: 4,
      serviceRadiusKm: 2.5,
      basePriceMonthly: 3500,
      rating: 5.0,
      totalReviews: 32,
      societies: [prestige.id, createdSocieties[4].id],
    },
  ];

  const createdCooks = [];
  for (const c of cooksData) {
    const cookUser = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: cookHash,
        fullName: c.fullName,
        role: 'COOK',
        phone: c.phone,
        avatarUrl: c.avatarUrl,
        cookProfile: {
          create: {
            bio: c.bio,
            experienceYears: c.experienceYears,
            specialities: c.specialities,
            cuisines: c.cuisines,
            dietaryPreferences: c.dietaryPreferences,
            maxHouseholds: c.maxHouseholds,
            serviceRadiusKm: c.serviceRadiusKm,
            basePriceMonthly: c.basePriceMonthly,
            rating: c.rating,
            totalReviews: c.totalReviews,
            isVerified: true,
            societiesServed: {
              create: c.societies.map((sId) => ({ societyId: sId })),
            },
          },
        },
      },
      include: {
        cookProfile: true,
      },
    });

    createdCooks.push(cookUser.cookProfile);

    // Create default availability slots (Mon - Sat)
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const slots = [];
    for (const d of days) {
      slots.push({
        cookProfileId: cookUser.cookProfile.id,
        dayOfWeek: d,
        mealType: 'BREAKFAST',
        startTime: '07:00 AM',
        endTime: '08:45 AM',
        maxSlots: 3,
        bookedSlots: 1,
        isBooked: false,
      });
      slots.push({
        cookProfileId: cookUser.cookProfile.id,
        dayOfWeek: d,
        mealType: 'LUNCH',
        startTime: '11:30 AM',
        endTime: '01:30 PM',
        maxSlots: 3,
        bookedSlots: 2,
        isBooked: false,
      });
      slots.push({
        cookProfileId: cookUser.cookProfile.id,
        dayOfWeek: d,
        mealType: 'DINNER',
        startTime: '06:30 PM',
        endTime: '08:30 PM',
        maxSlots: 3,
        bookedSlots: 1,
        isBooked: false,
      });
    }

    await prisma.cookAvailability.createMany({
      data: slots,
    });
  }

  console.log(`👨‍🍳 Created ${createdCooks.length} demonstration cooks with schedules.`);

  // 5. Create Demonstration Active Bookings & Reviews
  const firstCook = createdCooks[0]; // Sunita Devi
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      cookProfileId: firstCook.id,
      societyId: prestige.id,
      mealType: 'ALL_MEALS',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      monthlyRate: 1980, // 55% shared rate (pool pricing)
      sharedRatio: 0.55,
      notes: 'Tower B neighbour shared pool (Flat 704 & Flat 708)',
      requirements: {
        create: {
          diet: 'Vegetarian',
          spiceLevel: 'Medium-Mild',
          familySize: 3,
          specialInstructions: 'Prefer olive oil or cold pressed mustard oil. Less salt.',
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: customer1.id,
      cookProfileId: firstCook.id,
      rating: 5,
      comment:
        'Sunita ji is fantastic! Her phulkas are soft as butter and she always keeps the kitchen clean. Sharing her with our 7th-floor neighbour brought our monthly bill down from ₹3,800 to just ₹1,980!',
    },
  });

  // 6. Create Demonstration Neighbourhood Group Pool (Phase 2)
  const poolRequest = await prisma.groupRequest.create({
    data: {
      societyId: prestige.id,
      creatorId: customer1.id,
      assignedCookId: firstCook.id,
      title: 'Tower B Crescent — Healthy Lunch Pool',
      description: 'Sharing daily homestyle lunch cooked by Sunita Devi on 7th floor.',
      mealType: 'LUNCH',
      preferredSchedule: '11:30 AM - 01:30 PM',
      dietaryPreference: 'Pure Vegetarian',
      targetHouseholds: 3,
      currentHouseholds: 2,
      maxCapacity: 4,
      status: 'OPEN',
      estimatedPricePerHousehold: 1584,
      totalWorkloadMinutes: 75,
      members: {
        create: [
          {
            userId: customer1.id,
            householdSize: 3,
            flatNumber: '704',
            sharePercentage: 50.0,
            status: 'ACTIVE',
          },
          {
            userId: customer2.id,
            householdSize: 2,
            flatNumber: '708',
            sharePercentage: 50.0,
            status: 'ACTIVE',
          },
        ],
      },
    },
  });

  const poolRequest2 = await prisma.groupRequest.create({
    data: {
      societyId: prestige.id,
      creatorId: customer2.id,
      title: 'Tower A Dinner Sharing Pool',
      description: 'Looking for 1-2 families to share evening dinner preparation.',
      mealType: 'DINNER',
      preferredSchedule: '06:30 PM - 08:30 PM',
      dietaryPreference: 'Vegetarian & Egg',
      targetHouseholds: 3,
      currentHouseholds: 1,
      maxCapacity: 3,
      status: 'OPEN',
      estimatedPricePerHousehold: 1980,
      totalWorkloadMinutes: 90,
      members: {
        create: [
          {
            userId: customer2.id,
            householdSize: 2,
            flatNumber: '1202',
            sharePercentage: 100.0,
            status: 'ACTIVE',
          },
        ],
      },
    },
  });

  console.log('✨ Seed completed successfully with demo records!');
}

seed()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

