/**
 * Fixify Live Audit Script
 * Executes full automated testing of APIs, database, authentication,
 * workflows, security, and identifies technician demo login root cause.
 */

const http = require('http');
const pool = require('../config/db');

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders = { ...headers };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(resData);
          } catch {
            parsed = resData;
          }
          resolve({ status: res.status, statusCode: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 500, statusCode: 500, error: err.message });
    });

    if (body) req.write(dataString);
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 FIXIFY COMPREHENSIVE AUTOMATED AUDIT');
  console.log('====================================================\n');

  const auditResults = {
    backend: [],
    database: [],
    customerWorkflow: [],
    technicianWorkflow: [],
    adminWorkflow: [],
    security: [],
  };

  // ----------------------------------------------------
  // 1. BACKEND HEALTH & ENDPOINTS
  // ----------------------------------------------------
  console.log('--- 1. Backend & Port Health ---');
  const healthRes = await request('GET', '/health');
  const healthPass = healthRes.statusCode === 200 && healthRes.data?.status === 'healthy';
  auditResults.backend.push({ name: 'GET /health', pass: healthPass, detail: healthRes.data });
  console.log(`[${healthPass ? 'PASS' : 'FAIL'}] GET /health: Status ${healthRes.statusCode}, DB: ${healthRes.data?.database?.connected ? 'Connected' : 'Disconnected'}`);

  const apiHealthRes = await request('GET', '/api/health');
  const apiHealthPass = apiHealthRes.statusCode === 200 && apiHealthRes.data?.status === 'healthy';
  auditResults.backend.push({ name: 'GET /api/health', pass: apiHealthPass, detail: apiHealthRes.data });
  console.log(`[${apiHealthPass ? 'PASS' : 'FAIL'}] GET /api/health: Status ${apiHealthRes.statusCode}`);

  const rootRes = await request('GET', '/');
  const rootPass = rootRes.statusCode === 200 && rootRes.data?.name === 'Fixify API Server';
  auditResults.backend.push({ name: 'GET / (Root API)', pass: rootPass });
  console.log(`[${rootPass ? 'PASS' : 'FAIL'}] GET /: Status ${rootRes.statusCode}`);

  // ----------------------------------------------------
  // 2. PUBLIC DATA & IMAGES
  // ----------------------------------------------------
  console.log('\n--- 2. Public Data, Services & Images ---');
  const categoriesRes = await request('GET', '/api/categories');
  const categoriesPass = categoriesRes.statusCode === 200 && Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0;
  auditResults.backend.push({ name: 'GET /api/categories', pass: categoriesPass, count: categoriesRes.data?.length });
  console.log(`[${categoriesPass ? 'PASS' : 'FAIL'}] GET /api/categories: ${categoriesRes.data?.length} categories returned`);

  const servicesRes = await request('GET', '/api/services');
  const servicesList = Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data?.services || []);
  const servicesPass = servicesRes.statusCode === 200 && servicesList.length >= 8;
  const servicesWithImages = servicesList.filter(s => s.image && s.image.startsWith('http'));
  auditResults.backend.push({ name: 'GET /api/services', pass: servicesPass, withImages: servicesWithImages.length, total: servicesList.length });
  console.log(`[${servicesPass ? 'PASS' : 'FAIL'}] GET /api/services: ${servicesList.length} services returned (${servicesWithImages.length}/${servicesList.length} with valid images)`);

  const providersRes = await request('GET', '/api/technicians');
  const providersList = Array.isArray(providersRes.data) ? providersRes.data : [];
  const providersPass = providersRes.statusCode === 200 && providersList.length > 0;
  auditResults.backend.push({ name: 'GET /api/technicians', pass: providersPass, count: providersList.length });
  console.log(`[${providersPass ? 'PASS' : 'FAIL'}] GET /api/technicians: ${providersList.length} technicians returned`);

  // ----------------------------------------------------
  // 3. DATABASE VERIFICATION (mpfixfy)
  // ----------------------------------------------------
  console.log('\n--- 3. Database Verification (mpfixfy) ---');
  try {
    const [dbInfo] = await pool.query('SELECT DATABASE() as current_db');
    const isMpfixfy = dbInfo[0]?.current_db === 'mpfixfy';
    console.log(`[${isMpfixfy ? 'PASS' : 'FAIL'}] Target Database is mpfixfy: ${dbInfo[0]?.current_db}`);

    const expectedTables = ['users', 'categories', 'providers', 'services', 'bookings', 'reviews', 'saved_providers'];
    const [tables] = await pool.query('SHOW TABLES');
    const existingTableNames = tables.map(t => Object.values(t)[0]);
    const allTablesPresent = expectedTables.every(t => existingTableNames.includes(t));
    console.log(`[${allTablesPresent ? 'PASS' : 'FAIL'}] All 7 Expected Tables Present: ${allTablesPresent}`);

    const tableCounts = {};
    for (const tbl of expectedTables) {
      const [cnt] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${tbl}\``);
      tableCounts[tbl] = cnt[0].cnt;
    }
    console.log('Record Counts in mpfixfy:', tableCounts);
    auditResults.database.push({ targetDb: dbInfo[0]?.current_db, tables: tableCounts, allTablesPresent });

    // Check users role definition
    const [userCols] = await pool.query('SHOW COLUMNS FROM users');
    const roleCol = userCols.find(c => c.Field === 'role');
    console.log(`Users Table Role Column Definition: ${roleCol?.Type}`);

  } catch (dbErr) {
    console.error('Database query error:', dbErr.message);
    auditResults.database.push({ pass: false, error: dbErr.message });
  }

  // ----------------------------------------------------
  // 4. CUSTOMER WORKFLOW
  // ----------------------------------------------------
  console.log('\n--- 4. Customer Workflow ---');
  // A. Customer Login with Seeded Account
  const custLoginRes = await request('POST', '/api/auth/login', {}, {
    email: 'aditya.k@fixify.in',
    password: 'password123',
  });
  const custLoginPass = custLoginRes.statusCode === 200 && custLoginRes.data?.token && custLoginRes.data?.user?.role === 'customer';
  auditResults.customerWorkflow.push({ name: 'Customer Login', pass: custLoginPass, status: custLoginRes.statusCode });
  console.log(`[${custLoginPass ? 'PASS' : 'FAIL'}] Customer Login (aditya.k@fixify.in): Status ${custLoginRes.statusCode}, Role: ${custLoginRes.data?.user?.role}`);

  const customerToken = custLoginRes.data?.token;
  const customerId = custLoginRes.data?.user?.id;

  // B. Customer Profile Check
  const custMeRes = await request('GET', '/api/auth/me', { Authorization: `Bearer ${customerToken}` });
  const custMePass = custMeRes.statusCode === 200 && custMeRes.data?.user?.email === 'aditya.k@fixify.in';
  auditResults.customerWorkflow.push({ name: 'Customer GET /api/auth/me', pass: custMePass });
  console.log(`[${custMePass ? 'PASS' : 'FAIL'}] Customer GET /api/auth/me: Status ${custMeRes.statusCode}, User: ${custMeRes.data?.user?.name}`);

  // C. Customer View Bookings
  const custBookingsRes = await request('GET', '/api/bookings', { Authorization: `Bearer ${customerToken}` });
  const custBookingsList = Array.isArray(custBookingsRes.data) ? custBookingsRes.data : [];
  const custBookingsPass = custBookingsRes.statusCode === 200;
  auditResults.customerWorkflow.push({ name: 'Customer View Bookings', pass: custBookingsPass, count: custBookingsList.length });
  console.log(`[${custBookingsPass ? 'PASS' : 'FAIL'}] Customer View Bookings: Status ${custBookingsRes.statusCode}, Found: ${custBookingsList.length} bookings`);

  // D. Customer Create Booking
  const testBookingPayload = {
    serviceId: 'elec-fan-install',
    serviceName: 'Ceiling Fan Installation & Repair',
    providerId: 'prov-elec-1',
    technicianId: 'prov-elec-1',
    date: '2026-11-25',
    time: '10:00 AM',
    address: 'B-12 Green Glen Heights, Kothrud, Pune',
    totalAmount: 299,
    notes: 'Audit verification booking',
  };
  const createBkgRes = await request('POST', '/api/bookings', { Authorization: `Bearer ${customerToken}` }, testBookingPayload);
  const createBkgPass = createBkgRes.statusCode === 201 && createBkgRes.data?.booking?.id;
  const createdBkgId = createBkgRes.data?.booking?.id;
  auditResults.customerWorkflow.push({ name: 'Customer Create Booking', pass: createBkgPass, bkgId: createdBkgId });
  console.log(`[${createBkgPass ? 'PASS' : 'FAIL'}] Customer Create Booking: Status ${createBkgRes.statusCode}, Booking ID: ${createdBkgId}`);

  // E. Customer Submit Review
  const reviewPayload = {
    providerId: 'prov-elec-1',
    rating: 5,
    comment: 'Audit verified review: prompt and professional service.',
    author: 'Aditya Kulkarni',
  };
  const reviewRes = await request('POST', '/api/reviews', { Authorization: `Bearer ${customerToken}` }, reviewPayload);
  const reviewPass = reviewRes.statusCode === 201;
  auditResults.customerWorkflow.push({ name: 'Customer Submit Review', pass: reviewPass });
  console.log(`[${reviewPass ? 'PASS' : 'FAIL'}] Customer Submit Review: Status ${reviewRes.statusCode}`);

  // F. Customer Bookmark Provider
  const saveRes = await request('POST', '/api/saved/prov-elec-1', { Authorization: `Bearer ${customerToken}` });
  const savePass = saveRes.statusCode === 200;
  auditResults.customerWorkflow.push({ name: 'Customer Bookmark Provider', pass: savePass });
  console.log(`[${savePass ? 'PASS' : 'FAIL'}] Customer Bookmark Provider: Status ${saveRes.statusCode}`);

  // ----------------------------------------------------
  // 5. TECHNICIAN WORKFLOW & DEMO LOGIN AUDIT
  // ----------------------------------------------------
  console.log('\n--- 5. Technician Workflow & Demo Login Audit ---');
  // Attempt Technician Demo Login
  const techDemoLoginRes = await request('POST', '/api/auth/login', {}, {
    email: 'rajesh.plumbing@fixify.in',
    password: 'tech123',
  });
  console.log(`Technician Demo Login Response: Status ${techDemoLoginRes.statusCode}`);
  console.log('Response Body:', techDemoLoginRes.data);

  const techDemoPass = techDemoLoginRes.statusCode === 200;
  auditResults.technicianWorkflow.push({
    name: 'Technician Demo Login (rajesh.plumbing@fixify.in)',
    pass: techDemoPass,
    statusCode: techDemoLoginRes.statusCode,
    response: techDemoLoginRes.data,
  });

  // Check if rajesh.plumbing@fixify.in exists in mpfixfy.users
  const [techUserRow] = await pool.query('SELECT * FROM users WHERE email = ?', ['rajesh.plumbing@fixify.in']);
  console.log(`Exists in mpfixfy.users: ${techUserRow.length > 0 ? 'YES' : 'NO'}`);

  // Check if any technician/provider exists in users
  const [anyTechInUsers] = await pool.query("SELECT * FROM users WHERE role = 'technician' OR role = 'provider'");
  console.log(`Technicians / Providers in mpfixfy.users table: ${anyTechInUsers.length}`);

  // Check providers table
  const [anyInProviders] = await pool.query("SELECT id, name, category_id, city FROM providers WHERE name LIKE '%Rajesh%'");
  console.log(`Rajesh in mpfixfy.providers table: ${anyInProviders.length > 0 ? JSON.stringify(anyInProviders) : 'NONE'}`);

  // ----------------------------------------------------
  // 6. ADMIN WORKFLOW
  // ----------------------------------------------------
  console.log('\n--- 6. Admin Workflow ---');
  const adminLoginRes = await request('POST', '/api/auth/login', {}, {
    email: 'admin@fixify.in',
    password: 'admin123',
  });
  const adminLoginPass = adminLoginRes.statusCode === 200 && adminLoginRes.data?.user?.role === 'admin';
  auditResults.adminWorkflow.push({ name: 'Admin Login', pass: adminLoginPass });
  console.log(`[${adminLoginPass ? 'PASS' : 'FAIL'}] Admin Login (admin@fixify.in): Status ${adminLoginRes.statusCode}, Role: ${adminLoginRes.data?.user?.role}`);

  const adminToken = adminLoginRes.data?.token;

  // Admin Stats
  const adminStatsRes = await request('GET', '/api/admin/stats', { Authorization: `Bearer ${adminToken}` });
  const adminStatsPass = adminStatsRes.statusCode === 200;
  auditResults.adminWorkflow.push({ name: 'Admin Stats', pass: adminStatsPass, stats: adminStatsRes.data?.stats });
  console.log(`[${adminStatsPass ? 'PASS' : 'FAIL'}] Admin Stats: Status ${adminStatsRes.statusCode}`, adminStatsRes.data?.stats || adminStatsRes.data);

  // Admin View All Bookings
  const allBookingsRes = await request('GET', '/api/bookings', { Authorization: `Bearer ${adminToken}` });
  const allBookingsList = Array.isArray(allBookingsRes.data) ? allBookingsRes.data : [];
  const allBookingsPass = allBookingsRes.statusCode === 200 && allBookingsList.length > 0;
  auditResults.adminWorkflow.push({ name: 'Admin View All Bookings', pass: allBookingsPass, count: allBookingsList.length });
  console.log(`[${allBookingsPass ? 'PASS' : 'FAIL'}] Admin View All Bookings: Status ${allBookingsRes.statusCode}, Total: ${allBookingsList.length}`);

  // ----------------------------------------------------
  // 7. SECURITY AUDIT
  // ----------------------------------------------------
  console.log('\n--- 7. Security Audit ---');
  // Check password exposure in GET /api/auth/me
  const passwordExposedInMe = custMeRes.data?.user?.password !== undefined;
  console.log(`[${!passwordExposedInMe ? 'PASS' : 'FAIL'}] Password hash hidden in /api/auth/me: ${!passwordExposedInMe}`);

  // Check password exposure in login response
  const passwordExposedInLogin = custLoginRes.data?.user?.password !== undefined;
  console.log(`[${!passwordExposedInLogin ? 'PASS' : 'FAIL'}] Password hash hidden in /api/auth/login: ${!passwordExposedInLogin}`);

  // Check SQL Injection safety in search query
  const sqliTest = await request('GET', `/api/technicians?search=${encodeURIComponent("' OR '1'='1")}`);
  console.log(`SQL Injection Probe on /api/technicians: Status ${sqliTest.statusCode}`);

  // Check Unauthorized access to admin route
  const unauthAdmin = await request('GET', '/api/admin/stats', { Authorization: `Bearer ${customerToken}` });
  const rbacPass = unauthAdmin.statusCode === 403;
  console.log(`[${rbacPass ? 'PASS' : 'FAIL'}] Role-Based Access Control (Customer accessing Admin API): Status ${unauthAdmin.statusCode} (Expected 403 Forbidden)`);

  console.log('\n====================================================');
  console.log('✅ Automated Audit Complete');
  console.log('====================================================');

  await pool.end();
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
