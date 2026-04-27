import { Request, Response } from 'express';
import pool from '../config/database';
import { generateTimelinePoints, interpolatePosition } from '../services/simulationService';

export const getTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    const result = await pool.query(
      `SELECT st.*, p.name as port_name FROM simulation_timeline st
       LEFT JOIN ports p ON st.current_port_id = p.id
       WHERE st.shipment_id = $1 OR EXISTS (
         SELECT 1 FROM shipments s WHERE s.id = st.shipment_id AND s.shipment_id_display = $1
       ) ORDER BY st.simulation_day ASC`,
      [shipmentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
};

export const advanceSimulation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    const { days = 1 } = req.body;

    const shipResult = await pool.query(
      `SELECT s.*, op.lat as origin_lat, op.lng as origin_lng,
        dp.lat as dest_lat, dp.lng as dest_lng,
        dp.id as dest_port_id
       FROM shipments s
       LEFT JOIN ports op ON s.origin_port_id = op.id
       LEFT JOIN ports dp ON s.destination_port_id = dp.id
       WHERE s.id = $1 OR s.shipment_id_display = $1`,
      [shipmentId]
    );

    if (shipResult.rows.length === 0) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }

    const shipment = shipResult.rows[0];
    const newDay = Math.min((shipment.simulation_day || 0) + days, 35);

    const departure = new Date(shipment.departure_date);
    const arrival = new Date(shipment.scheduled_arrival);
    const totalDays = Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.round((newDay / totalDays) * 100), 100);

    const pos = interpolatePosition(
      { lat: parseFloat(shipment.origin_lat), lng: parseFloat(shipment.origin_lng) },
      { lat: parseFloat(shipment.dest_lat), lng: parseFloat(shipment.dest_lng) },
      newDay / totalDays
    );

    const newStatus = progress >= 100 ? 'DELIVERED' : shipment.status === 'DELIVERED' ? 'DELIVERED' : 'IN_TRANSIT';
    const currentPortId = progress >= 100 ? shipment.dest_port_id : null;

    await pool.query(
      `UPDATE shipments SET simulation_day = $1, progress_percent = $2, current_lat = $3, current_lng = $4,
        status = $5, current_port_id = $6, updated_at = NOW()
       WHERE id = $7 OR shipment_id_display = $7`,
      [newDay, progress, pos.lat, pos.lng, newStatus, currentPortId, shipmentId]
    );

    // Insert timeline point
    await pool.query(
      `INSERT INTO simulation_timeline (id, shipment_id, simulation_day, lat, lng, speed_knots, status, current_port_id)
       VALUES (gen_random_uuid(), (SELECT id FROM shipments WHERE id = $1 OR shipment_id_display = $1), $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
      [shipmentId, newDay, pos.lat, pos.lng, shipment.current_speed_knots || 18, newStatus, currentPortId]
    );

    const updated = await pool.query(
      'SELECT * FROM shipments WHERE id = $1 OR shipment_id_display = $1',
      [shipmentId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to advance simulation' });
  }
};

export const resetSimulation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    const shipResult = await pool.query(
      `SELECT s.*, op.lat as origin_lat, op.lng as origin_lng
       FROM shipments s LEFT JOIN ports op ON s.origin_port_id = op.id
       WHERE s.id = $1 OR s.shipment_id_display = $1`,
      [shipmentId]
    );
    if (shipResult.rows.length === 0) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }
    const shipment = shipResult.rows[0];
    await pool.query(
      `UPDATE shipments SET simulation_day = 0, progress_percent = 0,
        current_lat = $1, current_lng = $2, status = 'PLANNED', current_port_id = origin_port_id, updated_at = NOW()
       WHERE id = $3 OR shipment_id_display = $3`,
      [shipment.origin_lat, shipment.origin_lng, shipmentId]
    );
    await pool.query(
      `DELETE FROM simulation_timeline WHERE shipment_id = (SELECT id FROM shipments WHERE id = $1 OR shipment_id_display = $1)`,
      [shipmentId]
    );
    res.json({ message: 'Simulation reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset simulation' });
  }
};

export const getCurrentState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    const shipResult = await pool.query(
      `SELECT s.*,
        op.name as origin_port_name, dp.name as destination_port_name,
        v.name as vessel_name
       FROM shipments s
       LEFT JOIN ports op ON s.origin_port_id = op.id
       LEFT JOIN ports dp ON s.destination_port_id = dp.id
       LEFT JOIN vessels v ON s.vessel_id = v.id
       WHERE s.id = $1 OR s.shipment_id_display = $1`,
      [shipmentId]
    );
    if (shipResult.rows.length === 0) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }
    const disruptions = await pool.query(
      `SELECT * FROM disruptions WHERE shipment_id = (SELECT id FROM shipments WHERE id = $1 OR shipment_id_display = $1) ORDER BY detected_at DESC`,
      [shipmentId]
    );
    const recommendations = await pool.query(
      `SELECT * FROM recommendations WHERE shipment_id = (SELECT id FROM shipments WHERE id = $1 OR shipment_id_display = $1) ORDER BY created_at DESC`,
      [shipmentId]
    );
    res.json({
      shipment: shipResult.rows[0],
      disruptions: disruptions.rows,
      recommendations: recommendations.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch current state' });
  }
};

export { generateTimelinePoints };
