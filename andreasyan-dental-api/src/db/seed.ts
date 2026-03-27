import "dotenv/config";
import { db } from "./index";
import { users, patients, doctors, services, appointments, toothChart } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Services ───────────────────────────────────────────────────────────
  console.log("  → Services");
  const [s1, s2, s3, s4, s5, s6] = await db.insert(services).values([
    { name: "Porcelain Veneers", category: "Aesthetics", description: "Ultra-thin ceramic shells for a flawless Hollywood smile", duration: 90, price: "450.00", icon: "✨" },
    { name: "Dental Implant", category: "Implants", description: "Titanium implant with zirconia crown — lifetime solution", duration: 120, price: "1200.00", icon: "🦷" },
    { name: "Invisalign Clear Aligners", category: "Orthodontics", description: "Discreet teeth straightening — no metal, no brackets", duration: 60, price: "2800.00", icon: "🔲" },
    { name: "Teeth Whitening", category: "General", description: "Professional Philips ZOOM laser whitening — 8 shades brighter", duration: 60, price: "180.00", icon: "⬜" },
    { name: "Comprehensive Exam", category: "General", description: "Full digital X-rays, 3D scan & treatment planning", duration: 45, price: "60.00", icon: "🔍" },
    { name: "Ceramic Crown", category: "Restoration", description: "E.max or zirconia crowns — same-day CEREC available", duration: 90, price: "350.00", icon: "👑" },
  ]).returning();

  // ── Doctor users ───────────────────────────────────────────────────────
  console.log("  → Doctor users");
  const [du1, du2, du3] = await db.insert(users).values([
    { email: "armen@andreasyan.dental", fullName: "Dr. Armen Andreasyan", phone: "+374 10 123 456", role: "doctor", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=armen&backgroundColor=0B6E72" },
    { email: "nare@andreasyan.dental", fullName: "Dr. Nare Petrosyan", phone: "+374 10 123 457", role: "doctor", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=nare&backgroundColor=C9A84C" },
    { email: "sargis@andreasyan.dental", fullName: "Dr. Sargis Hakobyan", phone: "+374 10 123 458", role: "doctor", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=sargis&backgroundColor=14A0A6" },
  ]).returning();

  // ── Doctors ────────────────────────────────────────────────────────────
  console.log("  → Doctors");
  const [d1, d2, d3] = await db.insert(doctors).values([
    { userId: du1.id, specialty: "Implantology & Oral Surgery", bio: "Founder & Chief Implantologist. Specializes in complex full-arch restorations and digital smile design.", experience: 14, rating: "4.9", color: "#0B6E72", schedule: ["Mon", "Tue", "Thu", "Fri"] },
    { userId: du2.id, specialty: "Aesthetic Dentistry", bio: "Expert in ceramic veneers, composite bonding, and smile makeovers. Trained in Berlin and Paris.", experience: 9, rating: "4.8", color: "#C9A84C", schedule: ["Mon", "Wed", "Thu", "Sat"] },
    { userId: du3.id, specialty: "Orthodontics", bio: "Clear aligner specialist. Certified Invisalign provider with expertise in interceptive orthodontics.", experience: 7, rating: "4.7", color: "#14A0A6", schedule: ["Tue", "Wed", "Fri", "Sat"] },
  ]).returning();

  // ── Admin user ─────────────────────────────────────────────────────────
  console.log("  → Admin user");
  await db.insert(users).values({
    email: "admin@andreasyan.dental",
    fullName: "Admin",
    phone: "+374 10 123 000",
    role: "admin",
  });

  // ── Patient users ──────────────────────────────────────────────────────
  console.log("  → Patient users");
  const patientUserData = [
    { email: "anna@email.com", fullName: "Anna Mkrtchyan", phone: "+374 77 234 567", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=anna" },
    { email: "hayk@email.com", fullName: "Hayk Sargsyan", phone: "+374 93 456 789", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=hayk" },
    { email: "lilit@email.com", fullName: "Lilit Grigoryan", phone: "+374 91 678 901", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=lilit" },
    { email: "gevorg@email.com", fullName: "Gevorg Avagyan", phone: "+374 94 321 654", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=gevorg" },
    { email: "marianna@email.com", fullName: "Marianna Abrahamyan", phone: "+374 96 555 444", avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=marianna" },
  ];
  const patientUsers = await db.insert(users).values(patientUserData.map(u => ({ ...u, role: "patient" as const }))).returning();

  // ── Patients ───────────────────────────────────────────────────────────
  console.log("  → Patients");
  const patientData = [
    { userId: patientUsers[0].id, dateOfBirth: "1990-03-15", allergies: "Penicillin", loyaltyPoints: 840, balance: "0" },
    { userId: patientUsers[1].id, dateOfBirth: "1985-07-22", balance: "-120" },
    { userId: patientUsers[2].id, dateOfBirth: "1998-11-03", medicalNotes: "Anxiety — needs extra time", balance: "0" },
    { userId: patientUsers[3].id, dateOfBirth: "1978-05-14", isVip: true, loyaltyPoints: 2400, balance: "250" },
    { userId: patientUsers[4].id, dateOfBirth: "2001-09-30", balance: "0" },
  ];
  const createdPatients = await db.insert(patients).values(patientData).returning();

  // ── Appointments ───────────────────────────────────────────────────────
  console.log("  → Appointments");
  await db.insert(appointments).values([
    { patientId: createdPatients[0].id, doctorId: d2.id, serviceId: s1.id, date: "2026-03-26", time: "10:00", duration: 90, status: "confirmed", room: "A", price: "450.00" },
    { patientId: createdPatients[2].id, doctorId: d1.id, serviceId: s2.id, date: "2026-03-26", time: "11:30", duration: 120, status: "waiting", room: "B", price: "1200.00" },
    { patientId: createdPatients[3].id, doctorId: d1.id, serviceId: s5.id, date: "2026-03-27", time: "09:00", duration: 45, status: "confirmed", room: "A", price: "60.00" },
    { patientId: createdPatients[1].id, doctorId: d3.id, serviceId: s3.id, date: "2026-03-27", time: "14:00", duration: 60, status: "confirmed", room: "C", price: "2800.00" },
    { patientId: createdPatients[4].id, doctorId: d2.id, serviceId: s4.id, date: "2026-03-28", time: "15:30", duration: 60, status: "confirmed", room: "B", price: "180.00" },
    { patientId: createdPatients[0].id, doctorId: d2.id, serviceId: s6.id, date: "2026-03-28", time: "10:30", duration: 90, status: "inchair", room: "A", price: "350.00" },
  ]);

  // ── Tooth charts ───────────────────────────────────────────────────────
  console.log("  → Tooth charts");
  const initialStatuses: Record<number, string> = {
    11: "healthy", 12: "healthy", 13: "healthy", 14: "filling", 15: "filling",
    16: "crown", 17: "healthy", 18: "missing",
    21: "healthy", 22: "healthy", 23: "healthy", 24: "healthy", 25: "cavity",
    26: "filling", 27: "healthy", 28: "healthy",
    31: "healthy", 32: "healthy", 33: "healthy", 34: "healthy", 35: "healthy",
    36: "filling", 37: "healthy", 38: "missing",
    41: "healthy", 42: "healthy", 43: "healthy", 44: "cavity", 45: "healthy",
    46: "crown", 47: "healthy", 48: "missing",
  };
  const toothRows = createdPatients.flatMap((p) =>
    Object.entries(initialStatuses).map(([tooth, status]) => ({
      patientId: p.id,
      toothNumber: Number(tooth),
      status: status as any,
    }))
  );
  await db.insert(toothChart).values(toothRows);

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); });
