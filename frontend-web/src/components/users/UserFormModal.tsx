"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { User, Depot, Role } from "@/types";
import { UserFormData } from "@/services/userService";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User | null;
  depotsList: Depot[];
  onSubmit: (data: UserFormData) => Promise<boolean>;
}

export default function UserFormModal({
  isOpen,
  onClose,
  initialData,
  depotsList,
  onSubmit,
}: UserFormModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<Role>("kasir");
  const [depotId, setDepotId] = useState<number | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail("");
      setPassword("");
      setFullName(initialData?.full_name || "");
      setUsername(initialData?.username || "");
      setPhoneNumber(initialData?.phone_number || "");
      setRole(initialData?.role || "kasir");
      setDepotId(initialData?.depot_id || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: UserFormData = {
      full_name: fullName,
      username,
      phone_number: phoneNumber,
      role,
      depot_id: depotId as number,
    };

    if (!isEditMode) {
      payload.email = email;
      payload.password = password;
    }

    const success = await onSubmit(payload);
    if (success) onClose();
    setIsSubmitting(false);
  };

  const isFormValid = isEditMode
    ? fullName && username && phoneNumber && depotId !== ""
    : email &&
      password &&
      fullName &&
      username &&
      phoneNumber &&
      depotId !== "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Data User" : "Tambah User Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditMode && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Untuk Login)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
                placeholder="pegawai@depot.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
              placeholder="Contoh: Budi Santoso"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
              placeholder="Contoh: budi123"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor Telepon (WA)
          </label>
          <input
            type="text"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
            placeholder="Contoh: 08123456789"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peran (Role)
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "kasir" | "pelayan" | "pelanggan")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-black"
            >
              <option value="kasir">Kasir</option>
              <option value="pelayan">Pelayan</option>
              <option value="pelanggan">Pelanggan</option>
            </select>
          </div>

          {role !== "pelanggan" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penempatan Cabang
              </label>
              <select
                required
                value={depotId}
                onChange={(e) => setDepotId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-black"
              >
                <option value="" disabled>
                  -- Pilih Cabang --
                </option>
                {depotsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${isSubmitting || !isFormValid ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditMode
                ? "Perbarui Data"
                : "Daftarkan User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
