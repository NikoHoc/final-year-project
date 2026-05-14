const supabase = require("../config/supabase");

exports.getTodaySummary = async (req, res) => {
  const { depot_id } = req.params;

  try {
    const { data: transactions, error: errTx } = await supabase
      .from("transactions")
      .select(
        `
        id, customer_name, subtotal, tax_amount, grand_total, type, payment_method, created_at,
        transaction_payments(paid_amount, payment_methods(name))
      `,
      )
      .eq("depot_id", depot_id)
      .eq("is_settled", false)
      .eq("order_status", "completed")
      .eq("payment_status", "paid");

    if (errTx) throw errTx;

    const { data: expenses, error: errExp } = await supabase
      .from("operational_expenses")
      .select("id, item_name, amount, quantity, unit, expense_date, note")
      .eq("depot_id", depot_id)
      .eq("is_settled", false);

    if (errExp) throw errExp;

    let subtotal_all = 0;
    let tax_all = 0;
    let grand_total_all = 0;
    let methods_map = {};

    const transactionsWithTotal = transactions.map((tx) => {
      subtotal_all += Number(tx.subtotal || 0);
      tax_all += Number(tx.tax_amount || 0);
      const tx_grand_total = Number(tx.grand_total || 0);
      grand_total_all += tx_grand_total;

      const total_paid = tx.transaction_payments?.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0) || 0;
      const change_amount = Math.max(0, total_paid - tx_grand_total);

      if (tx.transaction_payments) {
        tx.transaction_payments.forEach((p) => {
          const methodName = p.payment_methods?.name || "Lainnya";
          const paid = Number(p.paid_amount || 0);
          const isCash = methodName.toLowerCase().includes("cash") || methodName.toLowerCase().includes("tunai");

          if (!methods_map[methodName]) {
            methods_map[methodName] = { method_name: methodName, transaction_count: 0, total_net_amount: 0 };
          }

          methods_map[methodName].transaction_count += 1;
          methods_map[methodName].total_net_amount += isCash ? (paid - change_amount) : paid;
        });
      }

      return { ...tx, total_paid, change_amount };
    });

    let total_expenses = 0;
    expenses.forEach((exp) => {
      total_expenses += Number(exp.amount || 0);
    });

    const net_income = subtotal_all - total_expenses;

    return res.status(200).json({
      status: true,
      data: {
        summary: {
          total_transactions: transactions.length,
          subtotal_amount: subtotal_all,
          tax_amount: tax_all,
          grand_total: grand_total_all,
          total_expenses,
          net_income,
          payment_methods: Object.values(methods_map)
        },
        transactions: transactionsWithTotal,
        expenses,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.processSettlement = async (req, res) => {
  const { depot_id, summary_data } = req.body;
  const created_by = req.user.id;

  try {
    const { data: newSettlement, error: errInsert } = await supabase
      .from("daily_settlements")
      .insert([
        {
          depot_id,
          created_by,
          total_transactions: summary_data.total_transactions,
          subtotal_amount: summary_data.subtotal_amount,
          tax_amount: summary_data.tax_amount,
          grand_total: summary_data.grand_total,
          cash_income: summary_data.cash_income,
          total_change_amount: summary_data.total_change_amount,
          net_cash_income: summary_data.net_cash_income,
          non_cash_income: summary_data.non_cash_income,
          total_expenses: summary_data.total_expenses,
          net_income: summary_data.net_income,
        },
      ])
      .select("id")
      .single();

    if (errInsert) throw errInsert;

    const settlementId = newSettlement.id;

    const { error: errUpdateTx } = await supabase
      .from("transactions")
      .update({ is_settled: true, settlement_id: settlementId })
      .eq("depot_id", depot_id)
      .eq("is_settled", false)
      .eq("order_status", "completed")
      .eq("payment_status", "paid");

    if (errUpdateTx) throw errUpdateTx;

    const { error: errUpdateExp } = await supabase
      .from("operational_expenses")
      .update({ is_settled: true, settlement_id: settlementId })
      .eq("depot_id", depot_id)
      .eq("is_settled", false);

    if (errUpdateExp) throw errUpdateExp;

    return res.status(200).json({
      status: true,
      message: "Proses Settlement berhasil diselesaikan!",
      data: newSettlement,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getSettlements = async (req, res) => {
  const { depot_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("daily_settlements")
      .select(`*, creator:profiles!created_by(full_name)`)
      .eq("depot_id", depot_id)
      .order("settlement_date", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ status: true, data });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getSettlementTransactions = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(`*`)
      .eq("settlement_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ status: true, data });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
