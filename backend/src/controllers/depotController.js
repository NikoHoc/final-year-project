const supabase = require("../config/supabase");

exports.createDepot = async (req, res) => {
  const { name, address, phone_number } = req.body;

  if (!name || !address || !phone_number) {
    return res.status(400).json({
      status: false,
      message: "Nama, Alamat, dan No HP wajib diisi!",
    });
  }

  try {
    const { data: newDepot, error } = await supabase
      .from("depots")
      .insert([{ name, address, phone_number, is_open: true }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      status: true,
      message: "Depot berhasil dibuat! Silakan lanjut setting pembayaran.",
      data: newDepot,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateDepot = async (req, res) => {
  const { id } = req.params;
  const { name, address, phone_number } = req.body;

  try {
    const { data, error } = await supabase
      .from("depots")
      .update({ name, address, phone_number })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return res
      .status(200)
      .json({ status: true, message: "Data depot diperbarui", data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getDepots = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("depots")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getDepotDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: depot, error } = await supabase
      .from("depots")
      .select("*")
      .eq("id", id)
      .single();

    if (error)
      return res.status(404).json({ message: "Depot tidak ditemukan" });

    // cek depot suda ada payment credentials atau belum
    const { data: payment } = await supabase
      .from("payment_configs")
      .select("id")
      .eq("depot_id", id)
      .single();

    const responseData = {
      ...depot,
      has_payment_config: !!payment,
    };

    return res.status(200).json({ status: true, data: responseData });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.setupPayment = async (req, res) => {
  const { id } = req.params;
  const { merchant_id, midtrans_client_key, midtrans_server_key } = req.body;

  if (!merchant_id || !midtrans_client_key || !midtrans_server_key) {
    return res
      .status(400)
      .json({ message: "Semua data kredensial Midtrans wajib diisi!" });
  }

  try {
    const { data: depot } = await supabase
      .from("depots")
      .select("id")
      .eq("id", id)
      .single();
    if (!depot)
      return res.status(404).json({ message: "Depot tidak ditemukan" });

    // UPSERT -> bawaan supabase, combine UPDATE dan INSERT
    const { data, error } = await supabase
      .from("payment_configs")
      .upsert(
        {
          depot_id: id,
          merchant_id,
          midtrans_client_key,
          midtrans_server_key,
        },
        { onConflict: "depot_id" },
      )
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Konfigurasi Pembayaran Midtrans Berhasil Disimpan!",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getPaymentConfig = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("payment_configs")
      .select("*")
      .eq("depot_id", id)
      .single();

    if (error) return res.status(404).json({ message: "Konfigurasi belum diset" });

    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { is_open } = req.body;

  // jika kasir, pastikan kasir pada depot tersebut
  if (req.user.role === "kasir") {
    if (req.user.depot_id != id) {
      return res
        .status(403)
        .json({ message: "Anda bukan kasir di depot ini!" });
    }
  }

  try {
    const { data, error } = await supabase
      .from("depots")
      .update({ is_open })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: `Depot sekarang ${is_open ? "BUKA" : "TUTUP"}`,
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};