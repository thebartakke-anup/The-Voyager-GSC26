import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://voyager_user:voyager_password@localhost:5432/voyager_db',
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding ports...');
    const ports = [
      { id: 'port-001', name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
      { id: 'port-002', name: 'Rotterdam', country: 'Netherlands', lat: 51.9225, lng: 4.4792, timezone: 'Europe/Amsterdam' },
      { id: 'port-003', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
      { id: 'port-004', name: 'Dubai (Jebel Ali)', country: 'UAE', lat: 24.9774, lng: 55.1849, timezone: 'Asia/Dubai' },
      { id: 'port-005', name: 'Los Angeles', country: 'USA', lat: 33.7490, lng: -118.1937, timezone: 'America/Los_Angeles' },
      { id: 'port-006', name: 'Hamburg', country: 'Germany', lat: 53.5476, lng: 9.9767, timezone: 'Europe/Berlin' },
      { id: 'port-007', name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
      { id: 'port-008', name: 'Port Said (Suez)', country: 'Egypt', lat: 31.2619, lng: 32.3048, timezone: 'Africa/Cairo' },
      { id: 'port-009', name: 'Mumbai', country: 'India', lat: 19.0176, lng: 72.8479, timezone: 'Asia/Kolkata' },
      { id: 'port-010', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
    ];
    for (const port of ports) {
      await client.query(
        `INSERT INTO ports (id, name, country, lat, lng, timezone) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [port.id, port.name, port.country, port.lat, port.lng, port.timezone]
      );
    }

    console.log('🌱 Seeding users...');
    const password = await bcrypt.hash('password123', 10);
    const users = [
      { id: 'b1a2c3d4-0001-0001-0001-000000000001', email: 'import@globaltrade.com', role: 'BUYER', first_name: 'Alex', last_name: 'Johnson', company_name: 'Global Traders Inc', home_port_id: 'port-002' },
      { id: 'b1a2c3d4-0002-0002-0002-000000000002', email: 'logistics@importcorp.com', role: 'BUYER', first_name: 'Sarah', last_name: 'Williams', company_name: 'Import Corp', home_port_id: 'port-005' },
      { id: 'b1a2c3d4-0003-0003-0003-000000000003', email: 'ceo@hongkonglogistics.com', role: 'BUYER', first_name: 'David', last_name: 'Chan', company_name: 'Hong Kong Logistics', home_port_id: 'port-007' },
      { id: 'b1a2c3d4-0004-0004-0004-000000000004', email: 'contact@mumbaitraders.com', role: 'BUYER', first_name: 'Raj', last_name: 'Patel', company_name: 'Mumbai Traders', home_port_id: 'port-009' },
      { id: 's1e2l3l4-0001-0001-0001-000000000001', email: 'export@shanghaiexports.com', role: 'SELLER', first_name: 'Wei', last_name: 'Zhang', company_name: 'Shanghai Exports Ltd', home_port_id: 'port-001' },
      { id: 's1e2l3l4-0002-0002-0002-000000000002', email: 'shipping@dubailogistics.com', role: 'SELLER', first_name: 'Omar', last_name: 'Al-Rashid', company_name: 'Dubai Shipping Co', home_port_id: 'port-004' },
      { id: 's1e2l3l4-0003-0003-0003-000000000003', email: 'operations@singaporeports.com', role: 'SELLER', first_name: 'Mei', last_name: 'Lin', company_name: 'Singapore Port Operations', home_port_id: 'port-003' },
      { id: 's1e2l3l4-0004-0004-0004-000000000004', email: 'captain@sydneyshipping.com', role: 'SELLER', first_name: 'James', last_name: 'Morrison', company_name: 'Sydney Shipping Lines', home_port_id: 'port-010' },
      { id: 'c1a2p3t4-0001-0001-0001-000000000001', email: 'capt.zhang@vessel1.com', role: 'CAPTAIN', first_name: 'Zhang', last_name: 'Wei', company_name: null, home_port_id: 'port-001' },
      { id: 'c1a2p3t4-0002-0002-0002-000000000002', email: 'capt.patel@vessel2.com', role: 'CAPTAIN', first_name: 'Priya', last_name: 'Patel', company_name: null, home_port_id: 'port-009' },
      { id: 'c1a2p3t4-0003-0003-0003-000000000003', email: 'capt.smith@vessel3.com', role: 'CAPTAIN', first_name: 'James', last_name: 'Smith', company_name: null, home_port_id: 'port-003' },
    ];
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, first_name, last_name, company_name, home_port_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (email) DO NOTHING`,
        [user.id, user.email, password, user.role, user.first_name, user.last_name, user.company_name, user.home_port_id]
      );
    }

    console.log('🌱 Seeding vessels...');
    const vessels = [
      { id: 'v1e2s3s4-0001-0001-0001-000000000001', imo: '9876543', name: 'MSC Aurora', vessel_type: 'Container Ship', capacity_teu: 12000, max_speed_knots: 22, fuel_consumption_per_hour: 3.5, captain_id: 'c1a2p3t4-0001-0001-0001-000000000001', fuel_percent: 72 },
      { id: 'v1e2s3s4-0002-0002-0002-000000000002', imo: '9876544', name: 'Maersk Pioneer', vessel_type: 'Tanker', capacity_teu: 8000, max_speed_knots: 18, fuel_consumption_per_hour: 2.8, captain_id: 'c1a2p3t4-0002-0002-0002-000000000002', fuel_percent: 45 },
      { id: 'v1e2s3s4-0003-0003-0003-000000000003', imo: '9876545', name: 'CMA Voyager', vessel_type: 'Bulk Carrier', capacity_teu: 6000, max_speed_knots: 20, fuel_consumption_per_hour: 2.2, captain_id: 'c1a2p3t4-0003-0003-0003-000000000003', fuel_percent: 100 },
    ];
    for (const vessel of vessels) {
      await client.query(
        `INSERT INTO vessels (id, imo, name, vessel_type, capacity_teu, max_speed_knots, fuel_consumption_per_hour, current_captain_id, current_fuel_percent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (imo) DO NOTHING`,
        [vessel.id, vessel.imo, vessel.name, vessel.vessel_type, vessel.capacity_teu, vessel.max_speed_knots, vessel.fuel_consumption_per_hour, vessel.captain_id, vessel.fuel_percent]
      );
    }

    console.log('🌱 Seeding shipments...');
    const shipment1Id = 's1h2i3p4-0001-0001-0001-000000000001';
    const shipment2Id = 's1h2i3p4-0002-0002-0002-000000000002';
    const shipment3Id = 's1h2i3p4-0003-0003-0003-000000000003';

    await client.query(
      `INSERT INTO shipments (id, shipment_id_display, seller_id, buyer_id, vessel_id, origin_port_id, destination_port_id,
        cargo_type, cargo_weight_tons, cargo_containers, cargo_value_usd, departure_date, scheduled_arrival, current_eta,
        sla_deadline, sla_penalty_per_day_usd, status, current_lat, current_lng, current_speed_knots, progress_percent, simulation_day)
       VALUES ($1,'SHIP-2026-001',$2,$3,$4,'port-001','port-002','Electronics',15000,800,45000000,
         '2026-04-01 00:00:00','2026-05-03 00:00:00','2026-05-05 00:00:00','2026-05-03 00:00:00',50000,
         'IN_TRANSIT',31.0,32.5,20,60,19)
       ON CONFLICT (shipment_id_display) DO NOTHING`,
      [shipment1Id, 's1e2l3l4-0001-0001-0001-000000000001', 'b1a2c3d4-0001-0001-0001-000000000001', 'v1e2s3s4-0001-0001-0001-000000000001']
    );

    await client.query(
      `INSERT INTO shipments (id, shipment_id_display, seller_id, buyer_id, vessel_id, origin_port_id, destination_port_id,
        cargo_type, cargo_weight_tons, cargo_containers, cargo_value_usd, departure_date, scheduled_arrival, current_eta,
        sla_deadline, sla_penalty_per_day_usd, status, current_lat, current_lng, current_speed_knots, progress_percent, simulation_day)
       VALUES ($1,'SHIP-2026-002',$2,$3,$4,'port-004','port-005','Crude Oil',45000,0,22000000,
         '2026-04-10 00:00:00','2026-05-15 00:00:00','2026-05-20 00:00:00','2026-05-15 00:00:00',75000,
         'DELAYED',18.5,72.0,14,30,17)
       ON CONFLICT (shipment_id_display) DO NOTHING`,
      [shipment2Id, 's1e2l3l4-0002-0002-0002-000000000002', 'b1a2c3d4-0002-0002-0002-000000000002', 'v1e2s3s4-0002-0002-0002-000000000002']
    );

    await client.query(
      `INSERT INTO shipments (id, shipment_id_display, seller_id, buyer_id, vessel_id, origin_port_id, destination_port_id,
        cargo_type, cargo_weight_tons, cargo_containers, cargo_value_usd, departure_date, scheduled_arrival, current_eta,
        sla_deadline, sla_penalty_per_day_usd, status, current_lat, current_lng, current_speed_knots, current_port_id, progress_percent, simulation_day)
       VALUES ($1,'SHIP-2026-003',$2,$3,$4,'port-003','port-007','Consumer Goods',8000,400,12000000,
         '2026-04-01 00:00:00','2026-04-08 00:00:00','2026-04-08 00:00:00','2026-04-08 00:00:00',25000,
         'DELIVERED',22.3193,114.1694,0,'port-007',100,7)
       ON CONFLICT (shipment_id_display) DO NOTHING`,
      [shipment3Id, 's1e2l3l4-0003-0003-0003-000000000003', 'b1a2c3d4-0003-0003-0003-000000000003', 'v1e2s3s4-0003-0003-0003-000000000003']
    );

    console.log('🌱 Seeding disruptions...');
    const disrupt1Id = 'd1i2s3r4-0001-0001-0001-000000000001';
    const disrupt2Id = 'd1i2s3r4-0002-0002-0002-000000000002';
    const disrupt3Id = 'd1i2s3r4-0003-0003-0003-000000000003';
    const disrupt4Id = 'd1i2s3r4-0004-0004-0004-000000000004';
    const disrupt5Id = 'd1i2s3r4-0005-0005-0005-000000000005';
    const disrupt6Id = 'd1i2s3r4-0006-0006-0006-000000000006';

    const disruptions = [
      [disrupt1Id, 'DISRUPT-001', shipment1Id, 'WEATHER', 'HIGH', 'Storm System in Indian Ocean', 'Severe storm system detected in the Indian Ocean corridor, requiring route deviation', 'SYSTEM', 24, 180000, 85, '2026-04-09 00:00:00', '2026-04-12 00:00:00', 'RESOLVED'],
      [disrupt2Id, 'DISRUPT-002', shipment1Id, 'GEOPOLITICAL', 'CRITICAL', 'Suez Canal Transit Advisory', 'Security advisory issued for Suez Canal transit zone, potential delays expected', 'SYSTEM', 48, 250000, 60, '2026-04-19 00:00:00', null, 'OPEN'],
      [disrupt3Id, 'DISRUPT-003', shipment2Id, 'MECHANICAL_FAILURE', 'HIGH', 'Engine Room Malfunction', 'Primary engine manifold showing abnormal pressure readings, reduced speed capability', 'CAPTAIN_REPORT', 36, 320000, 90, '2026-04-22 00:00:00', null, 'INVESTIGATING'],
      [disrupt4Id, 'DISRUPT-004', shipment2Id, 'FUEL_LOW', 'MEDIUM', 'Fuel consumption higher than projected', 'Fuel consumption 15% above projected rate due to adverse currents', 'SYSTEM', 12, 85000, 65, '2026-04-25 00:00:00', null, 'OPEN'],
      [disrupt5Id, 'DISRUPT-005', shipment3Id, 'SPEED_ANOMALY', 'LOW', 'Slight speed reduction in South China Sea', 'Minor speed reduction observed due to seasonal currents', 'SYSTEM', 4, 15000, 40, '2026-04-03 00:00:00', '2026-04-04 00:00:00', 'RESOLVED'],
      [disrupt6Id, 'DISRUPT-006', shipment3Id, 'CREW_EMERGENCY', 'MEDIUM', 'Crew medical emergency', 'Crew member requiring medical attention, brief hold at anchorage', 'CAPTAIN_REPORT', 6, 20000, 70, '2026-04-05 00:00:00', '2026-04-06 00:00:00', 'RESOLVED'],
    ];

    for (const d of disruptions) {
      await client.query(
        `INSERT INTO disruptions (id, disruption_id_display, shipment_id, type, severity, title, description, source,
          estimated_delay_hours, cost_impact_usd, risk_reduction_percent, detected_at, resolved_at, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (disruption_id_display) DO NOTHING`,
        d
      );
    }

    console.log('🌱 Seeding recommendations...');
    const rec1Id = 'r1e2c3o4-0001-0001-0001-000000000001';
    const rec2Id = 'r1e2c3o4-0002-0002-0002-000000000002';
    const rec3Id = 'r1e2c3o4-0003-0003-0003-000000000003';
    const rec4Id = 'r1e2c3o4-0004-0004-0004-000000000004';
    const rec5Id = 'r1e2c3o4-0005-0005-0005-000000000005';
    const rec6Id = 'r1e2c3o4-0006-0006-0006-000000000006';

    const recs = [
      [rec1Id, 'REC-001', shipment1Id, disrupt1Id, 'ROUTE_DIVERSION', 'Divert south of storm system via alternate Indian Ocean corridor', 120, 0.5, 45000, 85, 'APPROVED'],
      [rec2Id, 'REC-002', shipment1Id, disrupt2Id, 'SPEED_ADJUSTMENT', 'Increase speed to 22 knots to compensate for anticipated Suez delay', 0, 0, 30000, 40, 'PENDING_APPROVAL'],
      [rec3Id, 'REC-003', shipment2Id, disrupt3Id, 'PORT_CALL', 'Emergency port call at Mumbai (port-009) for engine repairs', 0, 1.5, 180000, 90, 'APPROVED'],
      [rec4Id, 'REC-004', shipment2Id, disrupt4Id, 'SPEED_ADJUSTMENT', 'Reduce speed to 14 knots to optimize fuel consumption', 0, -0.5, -40000, 65, 'AUTO_EXECUTED'],
      [rec5Id, 'REC-005', shipment3Id, disrupt6Id, 'HOLD', 'Brief hold at Singapore anchorage for crew medical attention', 0, 0.25, 15000, 80, 'APPROVED'],
      [rec6Id, 'REC-006', shipment3Id, disrupt5Id, 'SPEED_ADJUSTMENT', 'Increase speed to 21 knots after hold to maintain delivery schedule', 0, 0, -10000, 50, 'AUTO_EXECUTED'],
    ];

    for (const r of recs) {
      await client.query(
        `INSERT INTO recommendations (id, recommendation_id_display, shipment_id, disruption_id, type, description,
          extra_distance_nm, time_delta_days, cost_delta_usd, risk_reduction_percent, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (recommendation_id_display) DO NOTHING`,
        r
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
