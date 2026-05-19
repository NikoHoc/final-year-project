import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import { isAxiosError } from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { clearAuthSession } from "@/utils/auth";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);

      if (res.status && res.data) {
        Cookies.set("token", res.data.token, { expires: 1 });
        Cookies.set("user", JSON.stringify(res.data.user), { expires: 1 });

        toast.success("Login berhasil! CUAN!");

        const role = res.data.user.role;

        if (role === "admin") {
          router.push("/admin");
        }  else if (role === "owner") {
          router.push("/owner");
        } else if (role === "kasir") {
          router.push("/kasir");
        } else if (role === "pelayan") {
          router.push("/pelayan");
        } else {
          setError("Akses ditolak. Anda bukan pegawai internal depot.");
          localStorage.clear();
        }
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || "Terjadi kesalahan saat menghubungi server.";
        setError(errorMsg);
        
        toast.error(errorMsg);
      } else {
        // error network
        setError("Terjadi kesalahan yang tidak terduga.");
        toast.error("Terjadi kesalahan network. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Gagal logout dari server", err);
    } finally {
      clearAuthSession();
      setIsLoading(false);
      toast.success("Logout berhasil!");
      router.push("/login");
    }
  };

  return { login, logout, isLoading, error };
};
