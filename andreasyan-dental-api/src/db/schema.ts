import {
  pgTable, text, integer, decimal, boolean, timestamp,
  uuid, pgEnum, json, date, time, index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["patient", "doctor", "admin"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending", "confirmed", "waiting", "inchair", "completed", "cancelled", "no_show"
]);
export const toothStatusEnum = pgEnum("tooth_status", [
  "healthy", "cavity", "filling", "crown", "missing", "implant", "bridge", "root_canal"
]);
export const xrayTypeEnum = pgEnum("xray_type", [
  "panoramic", "periapical", "bitewing", "cbct", "cephalometric"
]);

// ─── Users ────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseId: text("supabase_id").unique(), // links to Supabase Auth
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("patient"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Patients ─────────────────────────────────────────────────────────────
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  allergies: text("allergies"),
  medicalNotes: text("medical_notes"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  isVip: boolean("is_vip").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Doctors ──────────────────────────────────────────────────────────────
export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  experience: integer("experience").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("5.0"),
  color: text("color").notNull().default("#0B6E72"),
  schedule: json("schedule").$type<string[]>().notNull().default([]),
  isAcceptingPatients: boolean("is_accepting_patients").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Services ─────────────────────────────────────────────────────────────
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").notNull().default("🦷"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Appointments ─────────────────────────────────────────────────────────
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  duration: integer("duration").notNull(), // minutes
  status: appointmentStatusEnum("status").notNull().default("pending"),
  room: text("room"),
  notes: text("notes"),
  price: decimal("price", { precision: 10, scale: 2 }),
  paid: boolean("paid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("appt_patient_idx").on(t.patientId),
  index("appt_doctor_idx").on(t.doctorId),
  index("appt_date_idx").on(t.date),
]);

// ─── Tooth Chart ──────────────────────────────────────────────────────────
export const toothChart = pgTable("tooth_chart", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  toothNumber: integer("tooth_number").notNull(), // FDI notation: 11-18, 21-28, 31-38, 41-48
  status: toothStatusEnum("status").notNull().default("healthy"),
  notes: text("notes"),
  treatedAt: timestamp("treated_at"),
  treatedBy: uuid("treated_by").references(() => doctors.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("tooth_patient_idx").on(t.patientId),
]);

// ─── X-Rays ───────────────────────────────────────────────────────────────
export const xrays = pgTable("xrays", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  uploadedBy: uuid("uploaded_by").references(() => doctors.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  type: xrayTypeEnum("type").notNull(),
  fileUrl: text("file_url").notNull(),       // Supabase Storage URL
  filePath: text("file_path").notNull(),     // Supabase Storage path
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),            // bytes
  notes: text("notes"),
  takenAt: date("taken_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("xray_patient_idx").on(t.patientId),
]);

// ─── Clinical Notes ───────────────────────────────────────────────────────
export const clinicalNotes = pgTable("clinical_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").notNull().default(false), // only visible to doctors/admin
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Invoices ─────────────────────────────────────────────────────────────
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paid: boolean("paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  dueDate: date("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one }) => ({
  patient: one(patients, { fields: [users.id], references: [patients.userId] }),
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  appointments: many(appointments),
  toothChart: many(toothChart),
  xrays: many(xrays),
  clinicalNotes: many(clinicalNotes),
  invoices: many(invoices),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  appointments: many(appointments),
  xrays: many(xrays),
  clinicalNotes: many(clinicalNotes),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
}));

export const toothChartRelations = relations(toothChart, ({ one }) => ({
  patient: one(patients, { fields: [toothChart.patientId], references: [patients.id] }),
  treatedByDoctor: one(doctors, { fields: [toothChart.treatedBy], references: [doctors.id] }),
}));

export const xraysRelations = relations(xrays, ({ one }) => ({
  patient: one(patients, { fields: [xrays.patientId], references: [patients.id] }),
  uploadedByDoctor: one(doctors, { fields: [xrays.uploadedBy], references: [doctors.id] }),
  appointment: one(appointments, { fields: [xrays.appointmentId], references: [appointments.id] }),
}));

// ─── Type exports ─────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type ToothChart = typeof toothChart.$inferSelect;
export type XRay = typeof xrays.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
