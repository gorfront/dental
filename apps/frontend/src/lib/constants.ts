import { Doctor } from "@/types";

export const doctors: Doctor[] = [
  { id: "d1", name: "Dr. Armen Andreasyan", spec: "Implantology & Oral Surgery", rating: "4.9", exp: "14 yrs", bg: "bg-teal-600" },
  { id: "d2", name: "Dr. Nare Petrosyan", spec: "Aesthetic Dentistry", rating: "4.8", exp: "9 yrs", bg: "bg-yellow-500" },
  { id: "d3", name: "Dr. Sargis Hakobyan", spec: "Orthodontics", rating: "4.7", exp: "7 yrs", bg: "bg-teal-500" },
];

export const dates = [
  { day: "Thu", date: "26", month: "Mar" },
  { day: "Fri", date: "27", month: "Mar" },
  { day: "Sat", date: "28", month: "Mar" },
  { day: "Sun", date: "29", month: "Mar" },
  { day: "Mon", date: "30", month: "Mar" },
  { day: "Tue", date: "31", month: "Mar" },
  { day: "Wed", date: "1", month: "Apr" },
  { day: "Thu", date: "2", month: "Apr" },
  { day: "Fri", date: "3", month: "Apr" },
];

export const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
export const disabledTimes = ["09:30", "11:00", "15:30"];
