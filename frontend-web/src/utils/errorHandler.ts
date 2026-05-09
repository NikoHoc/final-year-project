import toast from "react-hot-toast";

export const handleApiError = (error: unknown, defaultMessage: string = "Terjadi kesalahan pada sistem") => {
  const err = error as { response?: { data?: { message?: string } } };
  const errorMessage = err.response?.data?.message || defaultMessage;

  console.error("❌ API ERROR:", errorMessage);
  toast.error(errorMessage);
  
  return errorMessage;
};