const supabase = require("../config/supabase");

exports.getMyProfile = async (req, res) => {
  const { id } = req.user; 

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, depots(name)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  const { id } = req.user;
  const { full_name, phone_number, username } = req.body;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name, phone_number, username })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Profil berhasil diperbarui",
      data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// --- ADMIN FEATURES: MANAJEMEN PEGAWAI ---

exports.createEmployee = async (req, res) => {
  const { email, password, full_name, username, phone_number, role, depot_id } =
    req.body;

  if (!email || !password || !role || !depot_id) {
    return res.status(400).json({
      status: false,
      message: "Email, Password, dan Depot ID wajib diisi",
    });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, username, phone_number },
      },
    });

    if (authError) throw authError;

    if (!authData.user) {
      return res.status(400).json({ message: "Gagal membuat user auth" });
    }

    // update role dan depot
    // supabase trigger buat profiles saat user signup dengan role: pelanggan, depot_id: null
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({ role, depot_id })
      .eq("id", authData.user.id)
      .select()
      .single();

    if (profileError) throw profileError;

    return res.status(201).json({
      status: true,
      message: `Berhasil mendaftarkan ${role}`,
      data: profileData,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getEmployees = async (req, res) => {
  const { depot_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("depot_id", depot_id)
      .in("role", ["kasir", "pelayan"])
      .order("role", { ascending: true });

    if (error) throw error;

    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    // delete user dari profile.. bukan dari auth supabase
    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      status: true,
      message: "Data pegawai berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
