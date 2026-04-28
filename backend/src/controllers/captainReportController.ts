import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { generateDisruptionAnalysis } from '../services/geminiService';
import { AuthRequest } from '../middleware/auth';

export const getCaptainReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vessel_id, shipment_id } = req.query;
    let query = `SELECT cr.*, s.shipment_id_display, v.name as vessel_name, v.imo as vessel_imo,
      u.first_name as captain_first_name, u.last_name as captain_last_name
      FROM captain_reports cr
      LEFT JOIN shipments s ON cr.shipment_id = s.id
      LEFT JOIN vessels v ON cr.vessel_id = v.id
      LEFT JOIN users u ON cr.captain_id = u.id
      WHERE 1=1`;
    const params: string[] = [];
    let idx = 1;
    if (vessel_id) { query += ` AND cr.vessel_id = $${idx++}`; params.push(vessel_id as string); }
    if (shipment_id) { query += ` AND (cr.shipment_id = $${idx++} OR s.shipment_id_display = $${idx - 1})`; params.push(shipment_id as string); }
    query += ' ORDER BY cr.reported_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch captain reports' });
  }
};

export const createCaptainReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const captainId = req.user?.id;
    const {
      shipment_id, vessel_id, report_type, severity, title, description,
      current_lat, current_lng, fuel_remaining_percent, current_speed_knots,
      estimated_repair_hours, can_continue_under_power, requires_tow,
      speed_capability_knots, actions_taken
    } = req.body;

    if (!shipment_id || !vessel_id || !title) {
      res.status(400).json({ error: 'shipment_id, vessel_id, and title are required' });
      return;
    }

    const displayId = `RPT-${Date.now()}`;
    const reportId = uuidv4();

    const result = await pool.query(
      `INSERT INTO captain_reports (id, report_id_display, shipment_id, vessel_id, captain_id, report_type, severity,
        title, description, current_lat, current_lng, fuel_remaining_percent, current_speed_knots,
        estimated_repair_hours, can_continue_under_power, requires_tow, speed_capability_knots, actions_taken)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [reportId, displayId, shipment_id, vessel_id, captainId, report_type, severity,
       title, description, current_lat, current_lng, fuel_remaining_percent, current_speed_knots,
       estimated_repair_hours, can_continue_under_power, requires_tow, speed_capability_knots,
       actions_taken || []]
    );

    const report = result.rows[0];

    // Auto-create disruption from captain report
    if (severity && severity !== 'LOW') {
      const geminiAnalysis = await generateDisruptionAnalysis({
        type: report_type || 'OPERATIONAL',
        severity,
        title,
        description,
        vessel_info: { vessel_id, current_lat, current_lng },
      });

      const disruptionId = uuidv4();
      const disruptionDisplayId = `DISRUPT-${Date.now()}`;
      await pool.query(
        `INSERT INTO disruptions (id, disruption_id_display, shipment_id, type, severity, title, description, source,
          estimated_delay_hours, cost_impact_usd, detected_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'CAPTAIN_REPORT',$8,$9,NOW())`,
        [disruptionId, disruptionDisplayId, shipment_id, report_type || 'OPERATIONAL', severity,
         title, geminiAnalysis.summary || description,
         estimated_repair_hours || 0, geminiAnalysis.estimatedCost || 0]
      );
    }

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create captain report' });
  }
};

export const getCaptainReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT cr.*, s.shipment_id_display, v.name as vessel_name,
        u.first_name as captain_first_name, u.last_name as captain_last_name
       FROM captain_reports cr
       LEFT JOIN shipments s ON cr.shipment_id = s.id
       LEFT JOIN vessels v ON cr.vessel_id = v.id
       LEFT JOIN users u ON cr.captain_id = u.id
       WHERE cr.id = $1 OR cr.report_id_display = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch captain report' });
  }
};
