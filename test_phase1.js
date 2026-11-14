// Comprehensive Phase 1 End-to-End Verification Test Script
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting CookConnect Phase 1 Complete Verification Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    assert(health.data.status === 'healthy', '1. Backend health check status');

    // 2. Discover cooks (public)
    const cooksRes = await axios.get(`${BASE_URL}/cooks/discover`);
    assert(cooksRes.data.success === true, '2. Cook discovery API responds');
    assert(cooksRes.data.data.length >= 5, '3. Cook discovery returns seeded cooks (>= 5)');
    const firstCook = cooksRes.data.data[0];
    assert(firstCook.pricing.twoHouseholdPoolMonthly > 0, '4. Shared pool pricing calculation present');

    // 3. Filter cooks by cuisine
    const filteredCuisine = await axios.get(`${BASE_URL}/cooks/discover?cuisine=South Indian`);
    assert(filteredCuisine.data.data.length >= 1, '5. Cuisine filter works (South Indian)');

    // 4. Societies list
    const societiesRes = await axios.get(`${BASE_URL}/locations/societies`);
    assert(societiesRes.data.data.length >= 5, '6. Residential societies list returned');
    const prestige = societiesRes.data.data.find(s => s.name.includes('Prestige'));
    assert(prestige !== undefined, '7. Prestige Shantiniketan society present');

    // 5. Customer Login
    const custLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'priya.sharma@example.com',
      password: 'Customer#123',
    });
    assert(custLogin.data.success === true, '8. Customer login successful');
    const custToken = custLogin.data.data.token;
    assert(custToken.length > 20, '9. JWT token issued');

    // 6. Customer Profile
    const custProfile = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    assert(custProfile.data.data.role === 'CUSTOMER', '10. Authenticated user role is CUSTOMER');

    // 7. Cook Login
    const cookLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'sunita.devi@cookconnect.in',
      password: 'CookPass#123',
    });
    assert(cookLogin.data.success === true, '11. Cook partner login successful');
    const cookToken = cookLogin.data.data.token;

    // 8. Cook Profile & Availabilities
    const cookProfile = await axios.get(`${BASE_URL}/cooks/me`, {
      headers: { Authorization: `Bearer ${cookToken}` },
    });
    assert(cookProfile.data.data.bio !== undefined, '12. Cook profile retrieved');
    assert(cookProfile.data.data.availabilities.length > 0, '13. Cook schedule slots present');

    // 9. Admin Login
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@cookconnect.in',
      password: 'CookAdmin#2026',
    });
    assert(adminLogin.data.success === true, '14. Admin login successful');
    const adminToken = adminLogin.data.data.token;

    // 10. Admin Stats
    const adminStats = await axios.get(`${BASE_URL}/users/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStats.data.data.totalCustomers >= 2, '15. Admin stats: totalCustomers metric');
    assert(adminStats.data.data.totalCooks >= 5, '16. Admin stats: totalCooks metric');

    // 11. Role Authorization Check (Customer attempting admin route should receive 403)
    try {
      await axios.get(`${BASE_URL}/users/admin/stats`, {
        headers: { Authorization: `Bearer ${custToken}` },
      });
      assert(false, '17. Customer blocked from admin route');
    } catch (err) {
      assert(err.response?.status === 403, '17. Customer correctly blocked from admin route (403 Forbidden)');
    }

    // 12. New Customer Registration
    const testEmail = `neha.patel_${Date.now()}@example.com`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      fullName: 'Neha Patel',
      email: testEmail,
      password: 'Password#123',
      phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      role: 'CUSTOMER',
      societyId: prestige.id,
      flatNumber: '902',
      building: 'Tower C',
    });
    assert(regRes.data.success === true, '18. New customer registration');
    const newCustToken = regRes.data.data.token;

    // 13. Customer creates a booking with Sunita Devi
    const sunitaProfile = cookProfile.data.data;
    const bookingRes = await axios.post(
      `${BASE_URL}/bookings`,
      {
        cookProfileId: sunitaProfile.id,
        societyId: prestige.id,
        mealType: 'DINNER',
        isSharedPool: true,
        diet: 'Vegetarian',
        spiceLevel: 'Mild',
        familySize: 3,
        specialInstructions: 'Very low oil, strictly vegetarian.',
      },
      {
        headers: { Authorization: `Bearer ${newCustToken}` },
      }
    );
    assert(bookingRes.data.success === true, '19. Booking request created with shared pool discount');
    const newBookingId = bookingRes.data.data.id;
    assert(bookingRes.data.data.sharedRatio === 0.55, '20. Shared pool ratio is 0.55');

    // 14. Customer lists their bookings
    const myBookings = await axios.get(`${BASE_URL}/bookings/customer`, {
      headers: { Authorization: `Bearer ${newCustToken}` },
    });
    assert(myBookings.data.data.some(b => b.id === newBookingId), '21. Newly created booking visible in customer list');

    // 15. Cook views and accepts booking
    const cookBookings = await axios.get(`${BASE_URL}/bookings/cook`, {
      headers: { Authorization: `Bearer ${cookToken}` },
    });
    assert(cookBookings.data.success === true, '22. Cook views incoming bookings');

    const statusUpdate = await axios.patch(
      `${BASE_URL}/bookings/${newBookingId}/status`,
      { status: 'ACTIVE' },
      { headers: { Authorization: `Bearer ${cookToken}` } }
    );
    assert(statusUpdate.data.data.status === 'ACTIVE', '23. Cook accepts and activates booking');

    // 16. Customer reviews active booking
    const reviewRes = await axios.post(
      `${BASE_URL}/bookings/reviews`,
      {
        bookingId: newBookingId,
        rating: 5,
        comment: 'Fresh, hot food served every evening. Highly recommend sharing her slot!',
      },
      { headers: { Authorization: `Bearer ${newCustToken}` } }
    );
    assert(reviewRes.data.success === true, '24. Customer review submission succeeds');

    // 17. Cook manages availability: add slot, delete slot
    const addSlotRes = await axios.post(
      `${BASE_URL}/availability`,
      {
        dayOfWeek: 'SUNDAY',
        mealType: 'BREAKFAST',
        startTime: '08:00 AM',
        endTime: '10:00 AM',
        maxSlots: 2,
      },
      { headers: { Authorization: `Bearer ${cookToken}` } }
    );
    assert(addSlotRes.data.success === true, '25. Cook adds availability slot');
    const createdSlotId = addSlotRes.data.data.id;

    const delSlotRes = await axios.delete(
      `${BASE_URL}/availability/${createdSlotId}`,
      { headers: { Authorization: `Bearer ${cookToken}` } }
    );
    assert(delSlotRes.data.success === true, '26. Cook deletes availability slot');

    // 18. Neighbourhood pool preview
    const poolPreview = await axios.get(`${BASE_URL}/cooks/pool-preview/${prestige.id}`);
    assert(poolPreview.data.data.benefitSummary !== undefined, '27. Neighbourhood pool preview generated');

    console.log(`\n🎉 Verification Completed: ${passed} of ${total} tests PASSED!`);
  } catch (error) {
    console.error('Test execution error:', error.response?.data || error.message);
  }
}

runTests();
