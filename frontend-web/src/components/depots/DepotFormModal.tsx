"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Depot } from "@/types";

interface DepotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Depot | null;
  onSubmit: (data: {
    name: string;
    address: string;
    phone_number: string;
    latitude: number | null;
    longitude: number | null;
    map_url: string | null;
  }) => Promise<boolean>;
}

export default function DepotFormModal({ isOpen, onClose, initialData, onSubmit }: DepotFormModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [shift1Start, setShift1Start] = useState("");
  const [shift1End, setShift1End] = useState("");
  const [shift2Start, setShift2Start] = useState("");
  const [shift2End, setShift2End] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData?.name || "");
      setAddress(initialData?.address || "");
      setPhoneNumber(initialData?.phone_number || "");
      setLatitude(initialData?.latitude ? String(initialData.latitude) : "");
      setLongitude(initialData?.longitude ? String(initialData.longitude) : "");
      setMapUrl(initialData?.map_url || "");
      setShift1Start(initialData?.shift1_start ? initialData.shift1_start.slice(0, 5) : "");
      setShift1End(initialData?.shift1_end ? initialData.shift1_end.slice(0, 5) : "");
      setShift2Start(initialData?.shift2_start ? initialData.shift2_start.slice(0, 5) : "");
      setShift2End(initialData?.shift2_end ? initialData.shift2_end.slice(0, 5) : "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      address,
      phone_number: phoneNumber,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      map_url: mapUrl || null,
      shift1_start: shift1Start || null,
      shift1_end: shift1End || null,
      shift2_start: shift2Start || null,
      shift2_end: shift2End || null,
    };

    try {
      const success = await onSubmit(payload);
      if (success) onClose();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Cabang Depot" : "Tambah Cabang Depot"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Depot</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama depot"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">No. Telepon</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Contoh: 08123456789"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Alamat Lengkap</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Masukkan alamat lengkap depot"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors min-h-20"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 mt-2">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Jam Operasional</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Shift 1 Mulai</label>
              <input type="time" value={shift1Start} onChange={(e) => setShift1Start(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Shift 1 Selesai</label>
              <input type="time" value={shift1End} onChange={(e) => setShift1End(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Shift 2 Mulai</label>
              <input type="time" value={shift2Start} onChange={(e) => setShift2Start(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Shift 2 Selesai</label>
              <input type="time" value={shift2End} onChange={(e) => setShift2End(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 mt-2">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Konfigurasi Lokasi *opsional</h4>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tautan Google Maps (Share URL)</label>
            <input
              type="text"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="-7.2845"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="112.7949"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
                disabled={isSubmitting}
              />
            </div>
            
          </div>
          <p className="text-[10px] text-gray-400 mt-1 ">
              *Untuk koordinat, buka Google Maps, klik kanan pada lokasi depot, lalu pilih &quot;What&apos;s here? &quot; untuk melihat latitude dan longitude.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold text-xs"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name || !address || !phoneNumber}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-xs transition-colors ${
              isSubmitting || !name || !address || !phoneNumber
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100"
            }`}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}