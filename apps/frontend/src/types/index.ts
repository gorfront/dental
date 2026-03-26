export interface Service {
  id: string;
  icon: string;
  title: string;
  duration: string;
  price: string;
}

export interface Doctor {
  id: string;
  name: string;
  spec: string;
  rating: string;
  exp: string;
  bg: string;
  color?: string;
  fullDesc?: string;
}

export interface AuthUserData {
  id: string;
  email: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
}
