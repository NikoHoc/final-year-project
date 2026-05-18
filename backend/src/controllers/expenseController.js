const supabase = require("../config/supabase");

exports.getExpenses = async (req, res) => {
  const { depot_id } = req.params;
  const { startDate, endDate } = req.query;

  try {
    let query = supabase
      .from("operational_expenses")
      .select("*, profiles(full_name)")
      .eq("depot_id", depot_id)
      .order("expense_date", { ascending: false });

    if (startDate && endDate) {
      query = query
        .gte("expense_date", startDate)
        .lte("expense_date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.createExpense = async (req, res) => {
  const { depot_id, item_name, amount, quantity, unit, expense_date, note } = req.body;
  const created_by = req.user.id;

  if (!depot_id || !item_name || !amount || !expense_date) {
    return res.status(400).json({
      status: false,
      message:
        "Data pengeluaran wajib diisi (Depot, Nama Item, Jumlah, Tanggal)",
    });
  }

  try {
    const { data, error } = await supabase
      .from("operational_expenses")
      .insert([{ depot_id, created_by, item_name, amount, quantity, unit, expense_date, note }])
      .select("*, profiles(full_name)");

    if (error) throw error;

    return res.status(201).json({
      status: true,
      message: "Pengeluaran berhasil dicatat",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  const { item_name, amount, quantity, unit, expense_date, note } = req.body;

  try {
    const { data, error } = await supabase
      .from("operational_expenses")
      .update({ item_name, amount, quantity, unit, expense_date, note })
      .eq("id", id)
      .select("*, profiles(full_name)");

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Data pengeluaran dihapus",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { item_name, amount, expense_date, note } = req.body;

  try {
    const { data, error } = await supabase
      .from("operational_expenses")
      .update({
        item_name,
        amount,
        expense_date,
        note,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Data pengeluaran berhasil diperbarui",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
