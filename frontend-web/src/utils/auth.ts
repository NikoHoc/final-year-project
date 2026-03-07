import Cookies from "js-cookie";
import { User } from "@/types";

export const getUserData = (): User | null => {
  const storedUser = Cookies.get("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch (error) {
    console.error("Gagal memparsing data user dari cookies:", error);
    return null;
  }
};

export const getToken = (): string | undefined => {
  return Cookies.get("token");
};

export const clearAuthSession = () => {
  Cookies.remove("token");
  Cookies.remove("user");
};