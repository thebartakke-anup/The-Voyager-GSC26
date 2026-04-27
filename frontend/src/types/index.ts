export interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  congestion_level?: number;
}

export interface User {
  id: string;
  email: string;
  role: 'CAPTAIN' | 'BUYER' | 'SELLER' | 'ADMIN';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  home_port_id?: string;
  created_at?: string;
}

export interface Vessel {
  id: string;
  imo: string;
  name: string;
  vessel_type: string;
  capacity_teu?: number;
  max_speed_knots?: number;
  fuel_consumption_per_hour?: number;
  current_captain_id?: string;
  current_fuel_percent?: number;
  engine_status?: string;
}

export type ShipmentStatus = 'PLANNED' | 'IN_TRANSIT' | 'DELAYED' | 'AT_PORT' | 'DELIVERED' | 'CANCELLED';

export interface Shipment {
  id: string;
  shipment_id_display: string;
  seller_id: string;
  buyer_id: string;
  vessel_id: string;
  origin_port_id: string;
  destination_port_id: string;
  cargo_type?: string;
  cargo_weight_tons?: number;
  cargo_containers?: number;
  cargo_value_usd?: number;
  departure_date: string;
  scheduled_arrival: string;
  current_eta?: string;
  sla_deadline?: string;
  sla_penalty_per_day_usd?: number;
  status: ShipmentStatus;
  current_lat?: number;
  current_lng?: number;
  current_speed_knots?: number;
  current_port_id?: string;
  progress_percent: number;
  simulation_day: number;
  // Joined fields
  origin_port_name?: string;
  destination_port_name?: string;
  vessel_name?: string;
  vessel_imo?: string;
  vessel_type?: string;
  buyer_first_name?: string;
  buyer_last_name?: string;
  buyer_company?: string;
  seller_first_name?: string;
  seller_last_name?: string;
  seller_company?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
}

export type DisruptionType = 'WEATHER' | 'GEOPOLITICAL' | 'MECHANICAL_FAILURE' | 'FUEL_LOW' | 'SPEED_ANOMALY' | 'CREW_EMERGENCY' | 'OPERATIONAL';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DisruptionStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface Disruption {
  id: string;
  disruption_id_display: string;
  shipment_id: string;
  shipment_id_display?: string;
  type: DisruptionType;
  severity: Severity;
  title: string;
  description?: string;
  source?: string;
  estimated_delay_hours?: number;
  cost_impact_usd?: number;
  risk_reduction_percent?: number;
  detected_at: string;
  resolved_at?: string;
  status: DisruptionStatus;
  created_at?: string;
}

export type RecommendationType = 'ROUTE_DIVERSION' | 'SPEED_ADJUSTMENT' | 'PORT_CALL' | 'HOLD' | 'OTHER';
export type RecommendationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'AUTO_EXECUTED';

export interface Recommendation {
  id: string;
  recommendation_id_display: string;
  shipment_id: string;
  disruption_id?: string;
  type: RecommendationType;
  description?: string;
  extra_distance_nm?: number;
  time_delta_days?: number;
  cost_delta_usd?: number;
  risk_reduction_percent?: number;
  alternative_route_waypoints?: string;
  status: RecommendationStatus;
  approved_by_user_id?: string;
  approved_at?: string;
  gemini_analysis?: string;
  created_at?: string;
}

export interface CaptainReport {
  id: string;
  report_id_display: string;
  shipment_id: string;
  vessel_id: string;
  captain_id: string;
  report_type?: string;
  severity?: Severity;
  title: string;
  description?: string;
  current_lat?: number;
  current_lng?: number;
  fuel_remaining_percent?: number;
  current_speed_knots?: number;
  estimated_repair_hours?: number;
  can_continue_under_power?: boolean;
  requires_tow?: boolean;
  speed_capability_knots?: number;
  status?: string;
  actions_taken?: string[];
  reported_at?: string;
  // Joined
  vessel_name?: string;
  vessel_imo?: string;
  captain_first_name?: string;
  captain_last_name?: string;
  shipment_id_display?: string;
}

export interface SimulationState {
  shipment: Shipment;
  disruptions: Disruption[];
  recommendations: Recommendation[];
}

export interface TimelinePoint {
  id: string;
  shipment_id: string;
  simulation_day: number;
  lat: number;
  lng: number;
  speed_knots?: number;
  current_port_id?: string;
  status?: string;
  port_name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'CAPTAIN' | 'BUYER' | 'SELLER' | 'ADMIN';
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface WSMessage {
  type: string;
  payload?: unknown;
}
