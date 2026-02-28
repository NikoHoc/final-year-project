const supabase = require("../config/supabase");

exports.getCategories = async (req, res) => {
  const { depot_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("depot_id", depot_id)
      .order("id", { ascending: true });

    if (error) throw error;
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name, depot_id } = req.body;

  if (!name || !depot_id) {
    return res.status(400).json({
      status: false,
      message: "Nama Kategori dan Depot ID wajib diisi",
    });
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, depot_id }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      status: true,
      message: "Kategori berhasil dibuat",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const { data, error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Kategori berhasil diperbarui",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
