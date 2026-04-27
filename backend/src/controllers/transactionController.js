const supabase = require("../config/supabase");
const { snap } = require("../config/midtrans");

exports.createTransaction = async (req, res) => {
  const { depot_id, user_id, type, table_id, customer_id, pickup_method, use_tax, items } = req.body;

  if (!depot_id || !items || items.length === 0) {
    return res
      .status(400)
      .json({ status: false, message: "Data pesanan tidak lengkap" });
  }

  try {
    let subtotal = 0;
    const itemInserts = [];

    for (const item of items) {
      const { data: menu } = await supabase
        .from("menus")
        .select("price, half_price")
        .eq("id", item.menu_id)
        .single();
      if (!menu) throw new Error(`Menu ID ${item.menu_id} tidak ditemukan`);

      const priceToUse = item.is_half_portion ? menu.half_price : menu.price;
      const itemTotal = priceToUse * item.quantity;
      subtotal += itemTotal;

      itemInserts.push({
        menu_id: item.menu_id,
        quantity: item.quantity,
        price_at_time: priceToUse,
        is_half_portion: item.is_half_portion || false,
        note: item.note,
        batch_number: item.batch_number || 1
      });
    }

    let useTax = false;
    
    if (type === "online") {
      useTax = false; 
    } else {
      useTax = use_tax === true;
    }

    const tax_amount = useTax ? subtotal * 0.1 : 0;
    const grand_total = subtotal + tax_amount;

    let initialStatus = type === "online" ? "waiting_confirmation" : "pending";

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert([
        {
          depot_id,
          user_id,
          type,
          table_id: table_id || null,
          customer_id: customer_id || null,
          pickup_method: pickup_method || null,
          subtotal,
          tax_amount,
          grand_total,
          order_status: initialStatus,
          payment_status: "unpaid",
        },
      ])
      .select()
      .single();

    if (transactionError) throw transactionError;

    const itemsWithTransId = itemInserts.map((i) => ({
      ...i,
      transaction_id: transaction.id,
    }));

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(itemsWithTransId);

    if (itemsError) throw itemsError;

    return res.status(201).json({
      status: true,
      message:
        type === "online" ? "Menunggu konfirmasi" : "Pesanan masuk dapur",
      data: { transaction, new_items: itemInserts },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.addTransactionItems = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;

  try {
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    if (!transaction || transaction.payment_status === "paid") {
      return res
        .status(400)
        .json({ message: "Transaksi tidak valid atau sudah dibayar" });
    }

    let additionalSubtotal = 0;
    const itemInserts = [];

    for (const item of items) {
      const { data: menu } = await supabase
        .from("menus")
        .select("price, half_price")
        .eq("id", item.menu_id)
        .single();
      const priceToUse = item.is_half_portion ? menu.half_price : menu.price;
      additionalSubtotal += priceToUse * item.quantity;

      itemInserts.push({
        transaction_id: id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        price_at_time: priceToUse,
        is_half_portion: item.is_half_portion || false,
        note: item.note,
        is_printed: false,
        batch_number: item.batch_number
      });
    }

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(itemInserts);

    if (itemsError) throw itemsError;

    const newSubtotal = transaction.subtotal + additionalSubtotal;

    const isUsingTax = transaction.tax_amount > 0;
    const newTax = isUsingTax ? (newSubtotal * 0.1) : 0;

    const newGrandTotal = newSubtotal + newTax;

    await supabase
      .from("transactions")
      .update({
        subtotal: newSubtotal,
        tax_amount: newTax,
        grand_total: newGrandTotal,
      })
      .eq("id", id);

    return res.status(201).json({
      status: true,
      message: "Pesanan tambahan berhasil dimasukkan",

      data: { added_items: itemInserts, new_grand_total: newGrandTotal },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.confirmTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

    if (transaction.type !== "online" || transaction.order_status !== "waiting_confirmation") {
      return res.status(400).json({ message: "Aksi tidak valid. Hanya untuk pesanan online yang menunggu konfirmasi." });
    }

    let customerName = "Pelanggan";
    let customerEmail = "customer@example.com";
    let customerPhone = "081111111111";

    if (transaction.customer_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone_number")
        .eq("id", transaction.customer_id)
        .single();
      
      if (profile) {
        if (profile.full_name) customerName = profile.full_name;
        if (profile.email) customerEmail = profile.email;
        if (profile.phone_number) customerPhone = profile.phone_number;
      }
    }

    const { data: transactionItems } = await supabase
      .from("transaction_items")
      .select("quantity, price_at_time, menus(name)")
      .eq("transaction_id", id);

    let itemDetails = transactionItems.map((item) => ({
      id: item.menus.name.substring(0, 20), 
      price: item.price_at_time,
      quantity: item.quantity,
      name: item.menus.name.substring(0, 50), 
    }));

    const midtransOrderId = `ORDER-${transaction.id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: transaction.grand_total,
      },
      item_details: itemDetails, 
      customer_details: {
        first_name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      custom_expiry: {
        expiry_duration: 15, 
        unit: "minute"
      }
    };

    const midtransResponse = await snap.createTransaction(parameter);

    const { data: updatedTransaction, error } = await supabase
      .from("transactions")
      .update({
        order_status: "waiting_payment",
        snap_token: midtransResponse.token,
        midtrans_url: midtransResponse.redirect_url,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ status: true, message: "Pesanan diterima. Link pembayaran dibuat.", data: updatedTransaction });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.rejectTransaction = async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body; 

  if (!rejection_reason) {
    return res.status(400).json({ message: "Alasan penolakan wajib diisi!" });
  }

  try {
    const { data, error } = await supabase
      .from("transactions")
      .update({ 
        order_status: "cancelled", 
        rejection_reason: rejection_reason 
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ 
      status: true, 
      message: "Pesanan berhasil ditolak", 
      data 
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.midtransNotification = async (req, res) => {
  const notificationJson = req.body;

  try {
    const statusResponse =
      await snap.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const realTransactionId = orderId.split("-")[1];

    let newStatus = null;
    let newPaymentStatus = null;

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        newStatus = "process";
        newPaymentStatus = "paid";
      }
    } else if (transactionStatus == "settlement") {
      newStatus = "process";
      newPaymentStatus = "paid";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newStatus = "cancelled";
      newPaymentStatus = "failed";
    }

    if (newStatus) {
      await supabase
        .from("transactions")
        .update({ order_status: newStatus, payment_status: newPaymentStatus })
        .eq("id", realTransactionId);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Midtrans Error:", err.message);
    return res.status(500).send("Error processing notification");
  }
};

exports.getTransactions = async (req, res) => {
  const { depot_id } = req.params;
  const { order_status, date } = req.query;

  try {
    let query = supabase
      .from("transactions")
      .select("*") 
      .eq("depot_id", depot_id)
      .order("created_at", { ascending: false });

    if (order_status) query = query.eq("order_status", order_status);
    if (date) {
      query = query
        .gte("created_at", `${date}T00:00:00`)
        .lte("created_at", `${date}T23:59:59`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getTransactionDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_items (
          id, menu_id, quantity, price_at_time, is_half_portion, note, is_printed, batch_number, created_at,
          menus ( 
            name, image_url,
            categories (id, name, type)
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  const { id } = req.params;
  const { order_status, payment_status } = req.body;

  try {
    const updateData = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res
      .status(200)
      .json({ status: true, message: "Status diperbarui", data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateItemsPrintStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("transaction_items")
      .update({ is_printed: true })
      .eq("transaction_id", id)
      .eq("is_printed", false)
      .select(); 

    if (error) throw error;

    return res.status(200).json({ 
      status: true, 
      message: "Status print item berhasil diperbarui",
      updated_items: data 
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};