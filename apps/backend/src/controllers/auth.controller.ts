import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../models/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dental_key_2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: role || 'PATIENT',
    }).returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};