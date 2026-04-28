-- Voyagers Tribute Maritime Supply Chain Intelligence Platform
-- Initial Schema Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ports Table (created first due to foreign key dependencies)
CREATE TABLE IF NOT EXISTS ports (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  timezone VARCHAR(50),
  congestion_level DECIMAL(3, 2) DEFAULT 0.3,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('CAPTAIN', 'BUYER', 'SELLER', 'ADMIN')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  home_port_id VARCHAR(10) REFERENCES ports(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vessels Table
CREATE TABLE IF NOT EXISTS vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imo VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255),
  vessel_type VARCHAR(50),
  capacity_teu INT,
  max_speed_knots DECIMAL(5, 2),
  fuel_consumption_per_hour DECIMAL(8, 2),
  current_captain_id UUID REFERENCES users(id),
  current_fuel_percent DECIMAL(5, 2),
  engine_status VARCHAR(50) DEFAULT 'OPERATIONAL',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id_display VARCHAR(50) UNIQUE,
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  vessel_id UUID NOT NULL REFERENCES vessels(id),
  origin_port_id VARCHAR(10) NOT NULL REFERENCES ports(id),
  destination_port_id VARCHAR(10) NOT NULL REFERENCES ports(id),
  cargo_type VARCHAR(100),
  cargo_weight_tons DECIMAL(10, 2),
  cargo_containers INT,
  cargo_value_usd DECIMAL(15, 2),
  departure_date TIMESTAMP NOT NULL,
  scheduled_arrival TIMESTAMP NOT NULL,
  current_eta TIMESTAMP,
  sla_deadline TIMESTAMP,
  sla_penalty_per_day_usd DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'PLANNED',
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  current_speed_knots DECIMAL(5, 2),
  current_port_id VARCHAR(10) REFERENCES ports(id),
  progress_percent INT DEFAULT 0,
  simulation_day INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Disruptions Table
CREATE TABLE IF NOT EXISTS disruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disruption_id_display VARCHAR(50) UNIQUE,
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  type VARCHAR(50),
  severity VARCHAR(20),
  title VARCHAR(255),
  description TEXT,
  source VARCHAR(50) DEFAULT 'SYSTEM',
  estimated_delay_hours INT,
  cost_impact_usd DECIMAL(15, 2),
  risk_reduction_percent INT,
  detected_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Captain Reports Table
CREATE TABLE IF NOT EXISTS captain_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id_display VARCHAR(50) UNIQUE,
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  vessel_id UUID NOT NULL REFERENCES vessels(id),
  captain_id UUID NOT NULL REFERENCES users(id),
  report_type VARCHAR(50),
  severity VARCHAR(20),
  title VARCHAR(255),
  description TEXT,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  fuel_remaining_percent DECIMAL(5, 2),
  current_speed_knots DECIMAL(5, 2),
  estimated_repair_hours INT,
  can_continue_under_power BOOLEAN,
  requires_tow BOOLEAN,
  speed_capability_knots DECIMAL(5, 2),
  status VARCHAR(50) DEFAULT 'OPEN',
  actions_taken TEXT[],
  reported_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id_display VARCHAR(50) UNIQUE,
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  disruption_id UUID REFERENCES disruptions(id),
  type VARCHAR(50),
  description TEXT,
  extra_distance_nm DECIMAL(10, 2),
  time_delta_days DECIMAL(5, 2),
  cost_delta_usd DECIMAL(15, 2),
  risk_reduction_percent INT,
  alternative_route_waypoints TEXT,
  status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
  approved_by_user_id UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  gemini_analysis TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Simulation Timeline Table
CREATE TABLE IF NOT EXISTS simulation_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  simulation_day INT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  speed_knots DECIMAL(5, 2),
  current_port_id VARCHAR(10) REFERENCES ports(id),
  status VARCHAR(50),
  disruption_id UUID REFERENCES disruptions(id),
  recommendation_id UUID REFERENCES recommendations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_buyer_id ON shipments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_seller_id ON shipments(seller_id);
CREATE INDEX IF NOT EXISTS idx_disruptions_shipment_id ON disruptions(shipment_id);
CREATE INDEX IF NOT EXISTS idx_disruptions_status ON disruptions(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_shipment_id ON recommendations(shipment_id);
CREATE INDEX IF NOT EXISTS idx_captain_reports_shipment_id ON captain_reports(shipment_id);
CREATE INDEX IF NOT EXISTS idx_simulation_timeline_shipment_id ON simulation_timeline(shipment_id);
