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

    let subtotal_amount = 0;
    let tax_amount = 0;
    let grand_total = 0;
    let cash_income = 0;
    let non_cash_income = 0;
    let total_change_amount = 0;

    const transactionsWithTotal = transactions.map((tx) => {
      subtotal_amount += Number(tx.subtotal || 0);
      tax_amount += Number(tx.tax_amount || 0);
      grand_total += Number(tx.grand_total || 0);

      if (tx.transaction_payments) {
        tx.transaction_payments.forEach((p) => {
          const amount = Number(p.paid_amount || 0);
          const method = p.payment_methods?.name?.toLowerCase() || "";

          if (method.includes("cash") || method.includes("tunai")) {
            cash_income += amount;
          } else {
            non_cash_income += amount;
          }
        });
      }

      const total_paid = tx.transaction_payments ? tx.transaction_payments.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0): 0;

      const change_amount = Math.max(0, total_paid - tx.grand_total);
      total_change_amount += change_amount;
      
      return {
        ...tx,
        total_paid,
        change_amount
      };
    });

    let total_expenses = 0;
    expenses.forEach((exp) => {
      total_expenses += Number(exp.amount || 0);
    });

    const net_cash_income = cash_income - total_change_amount;
    const net_income = subtotal_amount - total_expenses;

    return res.status(200).json({
      status: true,
      data: {
        summary: {
          total_transactions: transactions.length,
          subtotal_amount,
          tax_amount,
          grand_total,
          cash_income,
          total_change_amount,
          net_cash_income,
          non_cash_income,
          total_expenses,
          net_income,
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
