import { Request, Response } from 'express';
import pool from '../config/database';

export const getShipments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, buyer_id, seller_id } = req.query;
    let query = `
      SELECT s.*, 
        op.name as origin_port_name, dp.name as destination_port_name,
        v.name as vessel_name, v.imo as vessel_imo, v.vessel_type,
        bu.first_name as buyer_first_name, bu.last_name as buyer_last_name, bu.company_name as buyer_company,
        se.first_name as seller_first_name, se.last_name as seller_last_name, se.company_name as seller_company
      FROM shipments s
      LEFT JOIN ports op ON s.origin_port_id = op.id
      LEFT JOIN ports dp ON s.destination_port_id = dp.id
      LEFT JOIN vessels v ON s.vessel_id = v.id
      LEFT JOIN users bu ON s.buyer_id = bu.id
      LEFT JOIN users se ON s.seller_id = se.id
      WHERE 1=1
    `;
    const params: (string | undefined)[] = [];
    let idx = 1;
    if (status) { query += ` AND s.status = $${idx++}`; params.push(status as string); }
    if (buyer_id) { query += ` AND s.buyer_id = $${idx++}`; params.push(buyer_id as string); }
    if (seller_id) { query += ` AND s.seller_id = $${idx++}`; params.push(seller_id as string); }
    query += ' ORDER BY s.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
};

export const getShipmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*,
        op.name as origin_port_name, op.lat as origin_lat, op.lng as origin_lng,
        dp.name as destination_port_name, dp.lat as destination_lat, dp.lng as destination_lng,
        v.name as vessel_name, v.imo as vessel_imo, v.vessel_type, v.capacity_teu, v.max_speed_knots,
        bu.first_name as buyer_first_name, bu.last_name as buyer_last_name, bu.company_name as buyer_company,
        se.first_name as seller_first_name, se.last_name as seller_last_name, se.company_name as seller_company
       FROM shipments s
       LEFT JOIN ports op ON s.origin_port_id = op.id
       LEFT JOIN ports dp ON s.destination_port_id = dp.id
       LEFT JOIN vessels v ON s.vessel_id = v.id
       LEFT JOIN users bu ON s.buyer_id = bu.id
       LEFT JOIN users se ON s.seller_id = se.id
       WHERE s.id = $1 OR s.shipment_id_display = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
};

export const updateShipmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['PLANNED', 'IN_TRANSIT', 'DELAYED', 'AT_PORT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const result = await pool.query(
      'UPDATE shipments SET status = $1, updated_at = NOW() WHERE id = $2 OR shipment_id_display = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update shipment status' });
  }
};
