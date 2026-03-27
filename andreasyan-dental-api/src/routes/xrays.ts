import { Router, Request, Response } from "express";
import { z } from "zod";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { xrays, doctors, users } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { supabase, XRAY_BUCKET } from "../lib/supabase";

const router = Router();
router.use(requireAuth);

// Multer — store in memory, we upload to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/dicom", "image/tiff"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Allowed: JPEG, PNG, WEBP, DICOM, TIFF"));
  },
});

// ── POST /api/xrays/upload ────────────────────────────────────────────────
router.post(
  "/upload",
  requireRole("doctor", "admin"),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    if (!req.body.patientId) return res.status(400).json({ error: "patientId required" });
    if (!req.body.type) return res.status(400).json({ error: "type required (panoramic, periapical, bitewing, cbct, cephalometric)" });

    const doctorId = req.user!.doctorId;
    if (!doctorId) return res.status(403).json({ error: "Only doctors can upload X-rays" });

    // Upload to Supabase Storage
    const fileExt = req.file.originalname.split(".").pop() || "jpg";
    const fileName = `${req.body.patientId}/${uuidv4()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(XRAY_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: "File upload failed" });
    }

    // Get signed URL (valid 1 year)
    const { data: { signedUrl } } = await supabase.storage
      .from(XRAY_BUCKET)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    // Save to DB
    const [xray] = await db.insert(xrays).values({
      patientId: req.body.patientId,
      uploadedBy: doctorId,
      appointmentId: req.body.appointmentId || null,
      type: req.body.type,
      fileUrl: signedUrl!,
      filePath: fileName,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      notes: req.body.notes || null,
      takenAt: req.body.takenAt || new Date().toISOString().split("T")[0],
    }).returning();

    return res.status(201).json(xray);
  }
);

// ── GET /api/xrays/:id/url  (refresh signed URL) ──────────────────────────
router.get("/:id/url", async (req: Request, res: Response) => {
  const [xray] = await db.select().from(xrays).where(eq(xrays.id, req.params.id));
  if (!xray) return res.status(404).json({ error: "X-ray not found" });

  const { data: { signedUrl }, error } = await supabase.storage
    .from(XRAY_BUCKET)
    .createSignedUrl(xray.filePath, 60 * 60 * 2); // 2 hours

  if (error) return res.status(500).json({ error: "Could not generate URL" });
  return res.json({ url: signedUrl });
});

// ── DELETE /api/xrays/:id ─────────────────────────────────────────────────
router.delete("/:id", requireRole("doctor", "admin"), async (req: Request, res: Response) => {
  const [xray] = await db.select().from(xrays).where(eq(xrays.id, req.params.id));
  if (!xray) return res.status(404).json({ error: "X-ray not found" });

  // Delete from Supabase Storage
  await supabase.storage.from(XRAY_BUCKET).remove([xray.filePath]);

  // Delete from DB
  await db.delete(xrays).where(eq(xrays.id, req.params.id));
  return res.json({ message: "X-ray deleted" });
});

export default router;
