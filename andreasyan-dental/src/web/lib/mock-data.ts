// ─── Static marketing content ─────────────────────────────────────────────
// All live data (doctors, services, patients, appointments, etc.)
// is now served by the Express API. Only keep testimonials here
// since they are static marketing copy, not stored in the database.

export const TESTIMONIALS = [
  { name: "Nairi H.", text: "Absolutely transformed my smile. The team is professional, caring, and uses the latest technology. I couldn't be happier!", rating: 5, service: "Veneers" },
  { name: "Varduhi K.", text: "Dr. Andreasyan's implant work is world-class. Pain-free, efficient, and the result looks completely natural.", rating: 5, service: "Implants" },
  { name: "Taron M.", text: "Invisalign was a game-changer for me. Dr. Hakobyan guided me perfectly. Results in 9 months!", rating: 5, service: "Orthodontics" },
  { name: "Sona G.", text: "The whitening treatment gave me 8 shades brighter teeth in one session. Stunning results!", rating: 5, service: "Whitening" },
];
