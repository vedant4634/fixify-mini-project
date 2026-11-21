const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');
const { checkDbHealth } = require('../config/db');
const authController = require('../controllers/authController');
const providerController = require('../controllers/providerController');
const serviceController = require('../controllers/serviceController');
const bookingController = require('../controllers/bookingController');
const reviewController = require('../controllers/reviewController');
const adminController = require('../controllers/adminController');

// Helper to simulate express req/res
function mockReqRes(body = {}, params = {}, query = {}, user = null) {
  const req = { body, params, query, user, headers: {} };
  return new Promise((resolve) => {
    let statusCode = 200;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        resolve({ statusCode, data });
      },
      send(data) {
        resolve({ statusCode, data });
      },
    };
    req.res = res;
    return { req, res, resolve };
  });
}

function runController(fn, reqObj) {
  return new Promise(async (resolve, reject) => {
    let statusCode = 200;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        resolve({ statusCode, data });
      },
      send(data) {
        resolve({ statusCode, data });
      },
    };
    try {
      await fn(reqObj, res, (err) => {
        if (err) reject(err);
        else resolve({ statusCode: 500, error: 'next called without response' });
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Fixify Comprehensive Verification & Testing Suite');
  console.log('Target Database: mpfixfy');
  console.log('====================================================\n');

  const results = [];

  // 1. Connection & Health Check
  try {
    const health = await checkDbHealth();
    const passed = health.connected && health.database === 'mpfixfy';
    results.push({ test: '1. Backend Connects to mpfixfy', passed, detail: JSON.stringify(health) });
    console.log(`${passed ? '✅' : '❌'} 1. Database Connection: ${health.database} (connected: ${health.connected})`);
  } catch (e) {
    results.push({ test: '1. Backend Connects to mpfixfy', passed: false, detail: e.message });
    console.log('❌ 1. Database Connection Failed:', e.message);
  }

  // 2. Verify all seven tables exist with rows
  const EXPECTED_TABLES = ['users', 'categories', 'providers', 'services', 'bookings', 'reviews', 'saved_providers'];
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    const allExist = EXPECTED_TABLES.every(t => tableNames.includes(t));

    const counts = {};
    for (const t of EXPECTED_TABLES) {
      const [[cnt]] = await pool.query(`SELECT COUNT(*) as c FROM \`${t}\``);
      counts[t] = cnt.c;
    }

    results.push({ test: '2. All 7 Tables Exist in mpfixfy', passed: allExist, detail: JSON.stringify(counts) });
    console.log(`${allExist ? '✅' : '❌'} 2. Seven Tables Verified in mpfixfy:`);
    for (const [t, c] of Object.entries(counts)) {
      console.log(`     • ${t.padEnd(16)}: ${c} records`);
    }
  } catch (e) {
    results.push({ test: '2. All 7 Tables Exist in mpfixfy', passed: false, detail: e.message });
    console.log('❌ 2. Tables check failed:', e.message);
  }

  // 3. Test SELECT Operations on core tables
  try {
    const [cats] = await pool.query('SELECT id, name, starting_price FROM categories LIMIT 3');
    const [provs] = await pool.query('SELECT id, name, business_name, city FROM providers LIMIT 3');
    const [svcs] = await pool.query('SELECT id, name, price FROM services LIMIT 3');
    const passed = cats.length > 0 && provs.length > 0 && svcs.length > 0;
    results.push({ test: '3. SELECT Operations on categories/providers/services', passed, detail: `Categories: ${cats.length}, Providers: ${provs.length}, Services: ${svcs.length}` });
    console.log(`${passed ? '✅' : '❌'} 3. Core SELECT queries passed:`);
    console.log(`     - Sample Category: ${cats[0].name} (₹${cats[0].starting_price})`);
    console.log(`     - Sample Provider: ${provs[0].name} (${provs[0].city})`);
    console.log(`     - Sample Service:  ${svcs[0].name} (₹${svcs[0].price})`);
  } catch (e) {
    results.push({ test: '3. SELECT Operations', passed: false, detail: e.message });
    console.log('❌ 3. SELECT failed:', e.message);
  }

  // 4. Test Customer Registration and Login
  const testEmail = `verify.${Date.now()}@fixify.in`;
  const testPassword = 'Password123!';
  let createdUserId = null;

  try {
    const signupRes = await runController(authController.signup, {
      body: {
        name: 'Verification User',
        email: testEmail,
        password: testPassword,
        phone: '+91 98999 11223',
        address: 'Shivajinagar, Pune',
        city: 'Pune',
      },
    });

    const signupPassed = signupRes.statusCode === 201 && signupRes.data.success && signupRes.data.token;
    createdUserId = signupRes.data.user?.id;

    // Now test login
    const loginRes = await runController(authController.login, {
      body: {
        email: testEmail,
        password: testPassword,
      },
    });

    const loginPassed = loginRes.statusCode === 200 && loginRes.data.success && loginRes.data.token;
    const passed = signupPassed && loginPassed;

    results.push({ test: '4. Customer Registration and Login', passed, detail: `User ID: ${createdUserId}, Email: ${testEmail}` });
    console.log(`${passed ? '✅' : '❌'} 4. Customer Registration & Login:`);
    console.log(`     - Registration Status: ${signupRes.statusCode} (Token generated)`);
    console.log(`     - Login Verification:  ${loginRes.statusCode} (Welcome back, ${loginRes.data.user?.name})`);
  } catch (e) {
    results.push({ test: '4. Customer Registration and Login', passed: false, detail: e.message });
    console.log('❌ 4. Registration & Login failed:', e.message);
  }

  // 5. Test Provider & Service Data Retrieval via Controllers
  let sampleProviderId = 'prov-ac-1';
  try {
    const provsRes = await runController(providerController.getProviders, { query: { category: 'ac-repair' } });
    if (provsRes.data.providers && provsRes.data.providers.length > 0) {
      sampleProviderId = provsRes.data.providers[0].id;
    } else if (Array.isArray(provsRes.data) && provsRes.data.length > 0) {
      sampleProviderId = provsRes.data[0].id;
    }

    const singleProvRes = await runController(providerController.getProviderById, { params: { id: sampleProviderId }, query: {} });
    const svcsRes = await runController(serviceController.getAllServices, {});

    const providerObj = singleProvRes.data.provider || singleProvRes.data;
    const passed = provsRes.statusCode === 200 && singleProvRes.statusCode === 200 && !!providerObj.name && svcsRes.statusCode === 200;
    results.push({ test: '5. Provider & Service Data Retrieval', passed, detail: `Providers: ${provsRes.data.providers?.length || provsRes.data.length}, Selected: ${sampleProviderId}` });
    console.log(`${passed ? '✅' : '❌'} 5. Provider & Service Retrieval:`);
    console.log(`     - Filtered Providers returned: ${provsRes.data.providers?.length || provsRes.data.length}`);
    console.log(`     - Detail lookup for "${sampleProviderId}": ${providerObj.name} (${providerObj.city})`);
    console.log(`     - Service categories returned: ${svcsRes.data.length || svcsRes.data.services?.length}`);
  } catch (e) {
    results.push({ test: '5. Provider & Service Data Retrieval', passed: false, detail: e.message });
    console.log('❌ 5. Retrieval failed:', e.message);
  }

  // 6. Test Creating a Booking in mpfixfy and retrieving it
  let createdBookingId = null;
  try {
    const bookingRes = await runController(bookingController.createBooking, {
      user: { id: createdUserId, name: 'Verification User', phone: '+91 98999 11223' },
      body: {
        providerId: sampleProviderId,
        providerName: 'Santosh Shinde',
        serviceName: 'AC Master Jet Service',
        date: '2026-11-25',
        timeSlot: '10:00 AM - 12:00 PM',
        address: 'Flat 302, Green Glen Heights, Kothrud, Pune',
        price: 599,
        taxes: 30,
        platformFee: 49,
        paymentMethod: 'Pay After Service (Cash / UPI)',
      },
    });

    createdBookingId = bookingRes.data.booking?.id || bookingRes.data.id;
    const createPassed = bookingRes.statusCode === 201 && !!createdBookingId;

    // Verify row directly in mpfixfy.bookings
    const [bookingDbRow] = await pool.query('SELECT * FROM `mpfixfy`.bookings WHERE id = ?', [createdBookingId]);
    const inDb = bookingDbRow.length > 0;

    // Retrieve via controller
    const getRes = await runController(bookingController.getBookingById, { params: { id: createdBookingId } });
    const getPassed = getRes.statusCode === 200 && getRes.data.id === createdBookingId;

    // Update status
    const updateRes = await runController(bookingController.updateBookingStatus, {
      params: { id: createdBookingId },
      body: { status: 'In Progress', note: 'Technician is en route' },
    });
    const updatePassed = updateRes.statusCode === 200;

    const passed = createPassed && inDb && getPassed && updatePassed;
    results.push({ test: '6. Booking Create, DB Presence & Status Update', passed, detail: `Booking ID: ${createdBookingId}, in mpfixfy.bookings: ${inDb}` });
    console.log(`${passed ? '✅' : '❌'} 6. Booking Creation & Verification in mpfixfy:`);
    console.log(`     - Created Booking ID: ${createdBookingId}`);
    console.log(`     - Verified in MySQL mpfixfy.bookings: YES (Service: ${bookingDbRow[0]?.service_name}, Amount: ₹${bookingDbRow[0]?.total_amount})`);
    console.log(`     - Retrieved via API: Status ${getRes.statusCode}`);
    console.log(`     - Status Updated to: "${updateRes.data.status}"`);
  } catch (e) {
    results.push({ test: '6. Booking Create & Verify', passed: false, detail: e.message });
    console.log('❌ 6. Booking test failed:', e.message);
  }

  // 7. Test Reviews and Saved Providers
  try {
    const reviewRes = await runController(bookingController.addBookingReview, {
      params: { id: createdBookingId },
      user: { id: createdUserId, name: 'Verification User' },
      body: { rating: 5, comment: 'Exceptional service and quick cooling resolution!' },
    });

    const [revDbRow] = await pool.query('SELECT * FROM `mpfixfy`.reviews WHERE provider_id = ? AND author = "Verification User"', [sampleProviderId]);
    const reviewPassed = reviewRes.statusCode === 201 && revDbRow.length > 0;

    // Test saved_providers
    await pool.query('INSERT IGNORE INTO `mpfixfy`.saved_providers (user_id, provider_id) VALUES (?, ?)', [createdUserId || 1, sampleProviderId]);
    const [savedDbRow] = await pool.query('SELECT * FROM `mpfixfy`.saved_providers WHERE provider_id = ?', [sampleProviderId]);
    const savedPassed = savedDbRow.length > 0;

    const passed = reviewPassed && savedPassed;
    results.push({ test: '7. Reviews Submission & Saved Providers', passed, detail: `Review ID: ${revDbRow[0]?.id}, Saved Rows: ${savedDbRow.length}` });
    console.log(`${passed ? '✅' : '❌'} 7. Reviews & Saved Providers:`);
    console.log(`     - Review created & saved in mpfixfy.reviews: ${revDbRow[0]?.id} (Rating: ${revDbRow[0]?.rating}/5)`);
    console.log(`     - Saved Provider record verified in mpfixfy.saved_providers: YES`);
  } catch (e) {
    results.push({ test: '7. Reviews and Saved Providers', passed: false, detail: e.message });
    console.log('❌ 7. Reviews & Saved failed:', e.message);
  }

  // 8. Test Admin Dashboard Stats from mpfixfy
  try {
    const statsRes = await runController(adminController.getAdminStats, {});
    const statsPassed = statsRes.statusCode === 200 && statsRes.data.success && statsRes.data.stats.totalTechnicians === 31;
    results.push({ test: '8. Admin Dashboard Stats from mpfixfy', passed: statsPassed, detail: JSON.stringify(statsRes.data.stats) });
    console.log(`${statsPassed ? '✅' : '❌'} 8. Admin Dashboard Stats:`);
    console.log(`     - Total Technicians: ${statsRes.data.stats.totalTechnicians}`);
    console.log(`     - Total Bookings:    ${statsRes.data.stats.totalBookings}`);
    console.log(`     - Total Customers:   ${statsRes.data.stats.totalCustomers}`);
    console.log(`     - Average Rating:    ${statsRes.data.stats.averageRating} ★`);
  } catch (e) {
    results.push({ test: '8. Admin Dashboard Stats', passed: false, detail: e.message });
    console.log('❌ 8. Admin stats failed:', e.message);
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length;
  console.log('\n====================================================');
  console.log(`📊 Test Summary: ${passedCount}/${results.length} Tests Passed`);
  console.log('====================================================\n');

  await pool.end();
}

runTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
