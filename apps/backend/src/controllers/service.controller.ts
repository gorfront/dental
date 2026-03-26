import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { services } from '../models/schema';

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const allServices = await db.select().from(services);
    res.json(allServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, price, duration } = req.body;
    const [newService] = await db.insert(services).values({
      name,
      price,
      duration
    }).returning();

    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Failed to create service' });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;

    const [updatedService] = await db.update(services)
      .set({ name, price, duration })
      .where(eq(services.id, id))
      .returning();

    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Failed to update service' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedService] = await db.delete(services)
      .where(eq(services.id, id))
      .returning();

    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully', id: deletedService.id });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Failed to delete service' });
  }
};