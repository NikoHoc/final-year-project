const supabase = require("../config/supabase");

exports.getMutations = async (req, res) => {
  const { depot_id } = req.params;

  try {
    
    const { data, error } = await supabase
      .from("stock_mutations")
      .select(
        `
        *,
        sender:depots!sender_id(name),
        receiver:depots!receiver_id(name),
        creator:profiles(full_name)
      `,
      )
      .or(`sender_id.eq.${depot_id},receiver_id.eq.${depot_id}`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.createMutation = async (req, res) => {
  const { sender_id, receiver_id, item_name, quantity } = req.body;
  const created_by = req.user.id;

  if (!sender_id || !receiver_id || !item_name || !quantity) {
    return res
      .status(400)
      .json({ status: false, message: "Data mutasi tidak lengkap" });
  }

  try {
    const { data, error } = await supabase
      .from("stock_mutations")
      .insert([
        {
          created_by,
          sender_id,
          receiver_id,
          item_name,
          quantity,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      status: true,
      message: "Permintaan mutasi stok berhasil dibuat",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateMutationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["completed", "cancelled"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Status harus 'completed' atau 'cancelled'" });
  }

  try {
    const { data, error } = await supabase
      .from("stock_mutations")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: `Status mutasi diperbarui menjadi ${status}`,
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateMutation = async (req, res) => {
  const { id } = req.params;
  const { item_name, quantity, receiver_id } = req.body;

  try {
    const { data: existing } = await supabase
      .from("stock_mutations")
      .select("status")
      .eq("id", id)
      .single();

    if (!existing)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    if (existing.status !== "pending") {
      return res.status(400).json({
        status: false,
        message: "Gagal! Data hanya bisa diedit jika status masih Pending.",
      });
    }

    const { data, error } = await supabase
      .from("stock_mutations")
      .update({
        item_name,
        quantity,
        receiver_id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Data mutasi berhasil diperbarui",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteMutation = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: existing } = await supabase
      .from("stock_mutations")
      .select("status")
      .eq("id", id)
      .single();

    if (!existing)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    if (existing.status !== "pending") {
      return res.status(400).json({
        status: false,
        message: "Gagal! Hanya mutasi status Pending yang boleh dihapus.",
      });
    }

    const { error } = await supabase
      .from("stock_mutations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Permintaan mutasi berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
