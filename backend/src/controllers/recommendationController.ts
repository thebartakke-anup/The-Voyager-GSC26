import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipment_id } = req.query;
    let query = `SELECT r.*, s.shipment_id_display FROM recommendations r
      LEFT JOIN shipments s ON r.shipment_id = s.id WHERE 1=1`;
    const params: string[] = [];
    if (shipment_id) {
      query += ' AND (r.shipment_id = $1 OR s.shipment_id_display = $1)';
      params.push(shipment_id as string);
    }
    query += ' ORDER BY r.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

export const getRecommendationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT r.*, s.shipment_id_display FROM recommendations r LEFT JOIN shipments s ON r.shipment_id = s.id WHERE r.id = $1 OR r.recommendation_id_display = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
};

export const approveRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const result = await pool.query(
      `UPDATE recommendations SET status = 'APPROVED', approved_by_user_id = $1, approved_at = NOW()
       WHERE id = $2 OR recommendation_id_display = $2 RETURNING *`,
      [userId, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve recommendation' });
  }
};

export const rejectRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const result = await pool.query(
      `UPDATE recommendations SET status = 'REJECTED', approved_by_user_id = $1, approved_at = NOW()
       WHERE id = $2 OR recommendation_id_display = $2 RETURNING *`,
      [userId, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject recommendation' });
  }
};
