import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getDisruptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipment_id } = req.query;
    let query = 'SELECT d.*, s.shipment_id_display FROM disruptions d LEFT JOIN shipments s ON d.shipment_id = s.id WHERE 1=1';
    const params: string[] = [];
    if (shipment_id) {
      query += ' AND (d.shipment_id = $1 OR s.shipment_id_display = $1)';
      params.push(shipment_id as string);
    }
    query += ' ORDER BY d.detected_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch disruptions' });
  }
};

export const getDisruptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT d.*, s.shipment_id_display FROM disruptions d LEFT JOIN shipments s ON d.shipment_id = s.id WHERE d.id = $1 OR d.disruption_id_display = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Disruption not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch disruption' });
  }
};

export const createDisruption = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      shipment_id, type, severity, title, description, source,
      estimated_delay_hours, cost_impact_usd, risk_reduction_percent, detected_at
    } = req.body;
    if (!shipment_id || !title) {
      res.status(400).json({ error: 'shipment_id and title are required' });
      return;
    }
    const displayId = `DISRUPT-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO disruptions (id, disruption_id_display, shipment_id, type, severity, title, description, source, estimated_delay_hours, cost_impact_usd, risk_reduction_percent, detected_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [uuidv4(), displayId, shipment_id, type, severity, title, description, source || 'SYSTEM',
       estimated_delay_hours, cost_impact_usd, risk_reduction_percent, detected_at || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create disruption' });
  }
};

export const updateDisruptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const resolvedAt = status === 'RESOLVED' ? new Date() : null;
    const result = await pool.query(
      'UPDATE disruptions SET status = $1, resolved_at = $2 WHERE id = $3 OR disruption_id_display = $3 RETURNING *',
      [status, resolvedAt, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Disruption not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update disruption status' });
  }
};
