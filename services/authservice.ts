import api from "@/lib/api";

export interface RegisterPayload {
  name: string;
  age: number;
  gender: string;
  mobile: string;
  address?: string;
  password: string;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export const registerPatient = async (payload: RegisterPayload) => {
  const response = await api.post("/auth/register", payload);

  return response.data;
};

export const login = async (payload: LoginPayload) => {
  const response = await api.post("/auth/login", payload);

  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};