import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().default('PATIENT'),
  phone: text('phone'),
});

// Связи для пользователей (Один пользователь может иметь много записей как пациент и как врач)
export const usersRelations = relations(users, ({ many }) => ({
  appointmentsAsPatient: many(appointments, { relationName: 'patientAppointments' }),
  appointmentsAsDoctor: many(appointments, { relationName: 'doctorAppointments' }),
  xrays: many(xrays),
}));

// 2. ТАБЛИЦА ЗАПИСЕЙ К ВРАЧУ
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => users.id).notNull(),
  doctorId: uuid('doctor_id').references(() => users.id).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('SCHEDULED'),
  notes: text('notes'),
});

// Связи для записей (Каждая запись принадлежит одному пациенту и одному врачу)
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
    relationName: 'patientAppointments',
  }),
  doctor: one(users, {
    fields: [appointments.doctorId],
    references: [users.id],
    relationName: 'doctorAppointments',
  }),
}));

// 3. ТАБЛИЦА УСЛУГ
export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameEn: text('name_en').notNull(), // Английское название
  nameRu: text('name_ru').notNull(), // Русское название
  nameAm: text('name_am').notNull(), // Армянское название
  price: integer('price'),
  duration: integer('duration'),
});

// 4. ТАБЛИЦА СНИМКОВ (Рентгены)
export const xrays = pgTable('xrays', {
  id: uuid('id').defaultRandom().primaryKey(),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  patientId: uuid('patient_id').references(() => users.id).notNull(), // <-- Привязали к users
});

// Связи для снимков
export const xraysRelations = relations(xrays, ({ one }) => ({
  patient: one(users, {
    fields: [xrays.patientId],
    references: [users.id],
  }),
}));