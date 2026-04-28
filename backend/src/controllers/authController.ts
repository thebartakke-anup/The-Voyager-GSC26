import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { env } from '../config/env';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, first_name, last_name, company_name } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: 'Email, password and role are required' });
      return;
    }
    const validRoles = ['CAPTAIN', 'BUYER', 'SELLER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, company_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name, company_name`,
      [email, password_hash, role, first_name || null, last_name || null, company_name || null]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Login attempt - Email:', email);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const result = await pool.query(
      'SELECT id, email, password_hash, role, first_name, last_name, company_name FROM users WHERE email = $1',
      [email]
    );
    
    console.log('📊 User query result - Found:', result.rows.length, 'user(s)');
    
    if (result.rows.length === 0) {
      console.log('❌ User not found for email:', email);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ User found:', user.email);
    
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Password validation:', valid ? 'VALID' : 'INVALID');
    
    if (!valid) {
      console.log('❌ Invalid password for user:', email);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    console.log('✨ Generating JWT token for user:', user.id);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
    
    const { password_hash: _, ...userWithoutPassword } = user;
    console.log('🎉 Login successful for:', email);
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('💥 Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const me = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const result = await pool.query(
      'SELECT id, email, role, first_name, last_name, company_name, home_port_id, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};