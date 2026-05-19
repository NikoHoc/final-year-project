"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { User, Depot, Role } from "@/types";
import { UserFormData } from "@/services/userService";
import { Eye, EyeOff } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User | null;
  depotsList?: Depot[];
  onSubmit: (data: UserFormData) => Promise<boolean>;
  variant?: "employee" | "customer";
}

export default function UserFormModal({
  isOpen,
  onClose,
  initialData,
  depotsList = [],
  onSubmit,
  variant = "employee",
}: UserFormModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [role, setRole] = useState<Role | "">(""); 
  const [depotId, setDepotId] = useState<number | "">("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setEmail(initialData?.email || "");
      setPassword(""); 
      setConfirmPassword(""); 
      setFullName(initialData?.full_name || "");
      setUsername(initialData?.username || "");
      setPhoneNumber(initialData?.phone_number || "");
      setRole(initialData?.role || ""); 
      setDepotId(initialData?.depot_id || "");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialData]);

  const isPasswordMatch = password === confirmPassword;
  const isPasswordValid = isEditMode
    ? ((password === "" && confirmPassword === "") || (password.length >= 6 && isPasswordMatch))
    : (password.length >= 6 && isPasswordMatch);

  const isFormValid =
    email.trim() !== "" &&
    fullName.trim() !== "" &&
    username.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    isPasswordValid &&
    (variant === "customer" ? true : (depotId !== "" && role !== ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    const formData: UserFormData = {
      email: email.trim(),
      full_name: fullName.trim(),
      username: username.trim(),
      phone_number: phoneNumber.trim(),
      role: variant === "employee" ? (role as Role) : "pelanggan",
      depot_id: variant === "employee" ? Number(depotId) : null,
    };

    if (password.trim() !== "") {
      formData.password = password;
    }

    try {
      const success = await onSubmit(formData);
      if (success) onClose();
    } catch (error) {
      console.error("Gagal menyimpan data user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? `Edit Data ${variant === "employee" ? "Pegawai" : "Pelanggan"}` : `Tambah ${variant === "employee" ? "Pegawai Baru" : "Pelanggan Baru"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none text-black bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="contoh@email.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none text-black bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Username *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none text-black bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan username"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">No. Telepon *</label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none text-black bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="081234xxxxxx"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Password {isEditMode && <span className="text-gray-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>} *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required={!isEditMode}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm outline-none text-black bg-white focus:ring-2 focus:ring-blue-500"
              placeholder={isEditMode ? "Masukkan password baru jika ingin diganti" : "Minimal 6 karakter"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Konfirmasi Password {isEditMode && <span className="text-gray-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>} *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required={!isEditMode || password.length > 0}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 pr-10 border rounded-lg text-sm outline-none text-black bg-white focus:ring-2 ${
                confirmPassword.length > 0 && !isPasswordMatch
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Ketik ulang password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {(password.length > 0 || confirmPassword.length > 0) && !isPasswordMatch && (
            <p className="text-xs text-red-500 mt-1">Password tidak cocok!</p>
          )}
        </div>

        {variant === "employee" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Peran (Role) *</label>
              <select
                required
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white text-black focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>-- Pilih Peran --</option>
                <option value="owner">Owner Cabang</option>
                <option value="kasir">Kasir</option>
                <option value="pelayan">Pelayan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Penempatan Cabang *</label>
              <select
                required
                value={depotId}
                onChange={(e) => setDepotId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white text-black focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>-- Pilih Cabang --</option>
                {depotsList.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm ${
              isSubmitting || !isFormValid ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}