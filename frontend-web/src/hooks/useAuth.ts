import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import { isAxiosError } from "axios";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);

      if (res.status && res.token && res.user) {
        localStorage.setItem("token", res.token);

        localStorage.setItem("user", JSON.stringify(res.user));

        const role = res.user.role;

        if (role === "admin") {
          router.push("/admin");
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
        // error dari backend
        setError(
          err.response?.data?.message ||
            "Terjadi kesalahan saat menghubungi server.",
        );
      } else {
        // error network
        setError("Terjadi kesalahan yang tidak terduga.");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoading(false);

      router.push("/login");
    }
  };

  return { login, logout, isLoading, error };
};
