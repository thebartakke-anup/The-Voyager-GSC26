// backend/seeds/seed.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:voyager@localhost:5432/voyagers_db',
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...\n');

    // 0. CLEAR EXISTING DATA (order respects FK constraints)
    console.log('🧹 Clearing existing data...');
    await client.query(`
      TRUNCATE TABLE simulation_timeline, recommendations, captain_reports,
      disruptions, shipments, vessels, users
      RESTART IDENTITY CASCADE
    `);
    console.log('✅ Cleared existing data\n');

    // 1. SEED PORTS
    console.log('📍 Seeding ports...');
    const ports = [
      { id: 'port-001', name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
      { id: 'port-002', name: 'Rotterdam', country: 'Netherlands', lat: 51.9225, lng: 4.4792, timezone: 'Europe/Amsterdam' },
      { id: 'port-003', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
      { id: 'port-004', name: 'Dubai (Jebel Ali)', country: 'UAE', lat: 24.9774, lng: 55.1849, timezone: 'Asia/Dubai' },
      { id: 'port-005', name: 'Los Angeles', country: 'USA', lat: 33.749, lng: -118.1937, timezone: 'America/Los_Angeles' },
      { id: 'port-006', name: 'Hamburg', country: 'Germany', lat: 53.5476, lng: 9.9767, timezone: 'Europe/Berlin' },
      { id: 'port-007', name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
      { id: 'port-008', name: 'Port Said (Suez)', country: 'Egypt', lat: 31.2619, lng: 32.3048, timezone: 'Africa/Cairo' },
      { id: 'port-009', name: 'Mumbai', country: 'India', lat: 19.0176, lng: 72.8479, timezone: 'Asia/Kolkata' },
      { id: 'port-010', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
    ];

    for (const port of ports) {
      await client.query(
        `INSERT INTO ports (id, name, country, lat, lng, timezone, congestion_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [port.id, port.name, port.country, port.lat, port.lng, port.timezone, Math.random() * 0.5 + 0.2]
      );
    }
    console.log('✅ Seeded 10 ports\n');

    // 2. SEED USERS - BUYERS
    console.log('👥 Seeding users...');
    const hashedPassword = await hashPassword('password');
    
    const buyerEmails = ['import@globaltrade.com', 'logistics@importcorp.com', 'ceo@hongkonglogistics.com', 'contact@mumbaitraders.com'];
    const sellerEmails = ['export@shanghaiexports.com', 'shipping@dubailogistics.com', 'operations@singaporeports.com', 'contact@sydneyshipping.com'];
    
    const userIds: { [key: string]: string } = {};

    // Create buyers
    for (const email of buyerEmails) {
      const userId = uuidv4();
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, first_name, last_name, company_name, home_port_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, email, hashedPassword, 'BUYER', 'First', 'Last', 'Company', 'port-002']
      );
      userIds[email] = userId;
    }

    // Create sellers
    for (const email of sellerEmails) {
      const userId = uuidv4();
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, first_name, last_name, company_name, home_port_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, email, hashedPassword, 'SELLER', 'First', 'Last', 'Company', 'port-001']
      );
      userIds[email] = userId;
    }
    console.log('✅ Seeded 8 users\n');

    // 3. SEED VESSELS
    console.log('🚢 Seeding vessels...');
    const vesselIds: string[] = [];
    const vesselCaptains = [sellerEmails[0], sellerEmails[1], sellerEmails[2]];

    for (let i = 0; i < 3; i++) {
      const vesselId = uuidv4();
      vesselIds.push(vesselId);

      await client.query(
        `INSERT INTO vessels (id, imo, name, vessel_type, capacity_teu, max_speed_knots, fuel_consumption_per_hour, current_captain_id, current_fuel_percent, engine_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          vesselId,
          `96334${i}0`,
          `Vessel ${i + 1}`,
          'Container Ship',
          20000 - i * 2000,
          19.5 - i * 0.5,
          250 - i * 20,
          userIds[vesselCaptains[i]],
          85 + Math.random() * 15,
          'OPERATIONAL',
        ]
      );
    }
    console.log('✅ Seeded 3 vessels\n');

    // 4. SEED SHIPMENTS
    console.log('📦 Seeding shipments...');
    const now = new Date();
    const shipmentIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const shipmentId = uuidv4();
      shipmentIds.push(shipmentId);

      const departureDate = new Date(now);
      departureDate.setDate(departureDate.getDate() - i * 5);

      const scheduledArrival = new Date(departureDate);
      scheduledArrival.setDate(scheduledArrival.getDate() + 32);

      const statuses = ['PLANNED', 'IN_TRANSIT', 'DELIVERED'];

      await client.query(
        `INSERT INTO shipments (
          id, shipment_id_display, seller_id, buyer_id, vessel_id,
          origin_port_id, destination_port_id,
          cargo_type, cargo_weight_tons, cargo_containers, cargo_value_usd,
          departure_date, scheduled_arrival, current_eta, sla_deadline, sla_penalty_per_day_usd,
          status, current_lat, current_lng, current_speed_knots, current_port_id, progress_percent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          shipmentId,
          `SHIP-2026-${String(i + 1).padStart(3, '0')}`,
          userIds[sellerEmails[i]],
          userIds[buyerEmails[i]],
          vesselIds[i],
          'port-001',
          'port-002',
          'Electronics',
          Math.floor(Math.random() * 1000 + 500),
          Math.floor(Math.random() * 100 + 50),
          Math.floor(Math.random() * 500000 + 100000),
          departureDate,
          scheduledArrival,
          new Date(scheduledArrival.getTime() + (Math.random() - 0.5) * 3 * 24 * 60 * 60 * 1000),
          new Date(scheduledArrival.getTime() + 1 * 24 * 60 * 60 * 1000),
          1000,
          statuses[i],
          31.2304 + Math.random() * 20,
          121.4737 + Math.random() * 40,
          15 + Math.random() * 5,
          null,
          statuses[i] === 'PLANNED' ? 0 : statuses[i] === 'IN_TRANSIT' ? 50 : 100,
        ]
      );
    }
    console.log('✅ Seeded 3 shipments\n');

    // 5. SEED DISRUPTIONS
    console.log('⚠️  Seeding disruptions...');
    for (let i = 0; i < shipmentIds.length; i++) {
      for (let j = 0; j < 2; j++) {
        const disruptionId = uuidv4();
        const types = ['WEATHER', 'MECHANICAL_FAILURE'];

        await client.query(
          `INSERT INTO disruptions (
            id, disruption_id_display, shipment_id, type, severity, title, description,
            source, estimated_delay_hours, cost_impact_usd, risk_reduction_percent,
            detected_at, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            disruptionId,
            `DISRUPT-${String(i * 2 + j + 1).padStart(3, '0')}`,
            shipmentIds[i],
            types[j],
            j === 0 ? 'MEDIUM' : 'HIGH',
            j === 0 ? 'Storm Warning' : 'Engine Failure',
            j === 0 ? 'Typhoon approaching' : 'Engine reduced capacity',
            'SYSTEM',
            Math.floor(Math.random() * 48),
            Math.floor(Math.random() * 50000),
            Math.floor(Math.random() * 30 + 20),
            new Date(),
            'OPEN',
          ]
        );
      }
    }
    console.log('✅ Seeded disruptions\n');

    // 6. SEED RECOMMENDATIONS
    console.log('💡 Seeding recommendations...');
    for (const shipmentId of shipmentIds) {
      const recommendationId = uuidv4();

      await client.query(
        `INSERT INTO recommendations (
          id, recommendation_id_display, shipment_id,
          type, description, extra_distance_nm, time_delta_days,
          cost_delta_usd, risk_reduction_percent,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          recommendationId,
          `REC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          shipmentId,
          'ROUTE_DIVERSION',
          'Reroute around storm',
          Math.floor(Math.random() * 200),
          Math.random() * 3,
          Math.floor(Math.random() * 10000),
          Math.floor(Math.random() * 40 + 40),
          'PENDING_APPROVAL',
        ]
      );
    }
    console.log('✅ Seeded recommendations\n');

    console.log('✨ Database seeding completed successfully!\n');
    console.log('Test Credentials:');
    console.log('  Email: import@globaltrade.com');
    console.log('  Email: export@shanghaiexports.com');
    console.log('  Password: password\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});