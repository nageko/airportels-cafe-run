// db.js — thin storage layer.
// Uses Supabase if SUPABASE_URL + SUPABASE_ANON_KEY are configured;
// otherwise transparently falls back to localStorage so the prototype works cold.

(function () {
  const LS_ORDERS = "airportels.orders.v1";
  const LS_STAFF  = "airportels.staff.v1";

  const hasSupabase = !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
  const sb = hasSupabase ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

  // ───────── local helpers ─────────
  function readLS(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function makeOrderCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = ""; for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  function todayKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ───────── api ─────────

  const api = {
    mode: hasSupabase ? "supabase" : "local",

    // Sign in by name — just stores the staff profile. No password.
    async signInStaff({ name, room }) {
      const profile = { name: name.trim(), room: (room || "").trim(), signedInAt: Date.now() };
      if (hasSupabase) {
        // Upsert into a "staff" table (id auto). Best-effort; we still cache locally.
        try { await sb.from("staff").insert([{ name: profile.name, room: profile.room }]); } catch (e) {}
      }
      writeLS(LS_STAFF, profile);
      return profile;
    },

    currentStaff() {
      return readLS(LS_STAFF, null);
    },

    signOut() {
      try { localStorage.removeItem(LS_STAFF); } catch (e) {}
    },

    // Create one order with N line-items. Returns { code, id, created_at }.
    async createOrder({ staff, items, note }) {
      const order = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        code: makeOrderCode(),
        staff_name: staff.name,
        room: staff.room,
        note: (note || "").trim(),
        status: "queued",                 // queued → brewing → delivered
        created_at: new Date().toISOString(),
        items
      };

      if (hasSupabase) {
        try {
          const { data: created, error } = await sb.from("orders").insert([{
            id: order.id, code: order.code, staff_name: order.staff_name,
            room: order.room, note: order.note, status: order.status, created_at: order.created_at
          }]).select().single();
          if (error) throw error;
          const rows = items.map(it => ({
            order_id: order.id,
            drink_id: it.drink_id, name: it.name,
            sugar: it.sugar,
            roast: it.roast || null,
            temp: it.temp, qty: it.qty, item_note: it.item_note || ""
          }));
          await sb.from("order_items").insert(rows);
        } catch (e) {
          console.warn("Supabase write failed, caching locally:", e.message || e);
        }
      }

      // Always mirror locally so the UI is instant.
      const all = readLS(LS_ORDERS, []);
      all.unshift(order);
      writeLS(LS_ORDERS, all);
      return order;
    },

    // Today's orders, newest first.
    async listTodayOrders() {
      if (hasSupabase) {
        try {
          const start = new Date(); start.setHours(0, 0, 0, 0);
          const { data, error } = await sb
            .from("orders")
            .select("id, code, staff_name, room, note, status, created_at, order_items(*)")
            .gte("created_at", start.toISOString())
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data.map(o => ({ ...o, items: o.order_items || [] }));
        } catch (e) {
          console.warn("Supabase read failed, using local:", e.message || e);
        }
      }
      const all = readLS(LS_ORDERS, []);
      const start = new Date(); start.setHours(0, 0, 0, 0);
      return all.filter(o => new Date(o.created_at) >= start);
    },

    // Advance status: queued → brewing → delivered.
    async advanceOrderStatus(orderId) {
      const next = { queued: "brewing", brewing: "delivered", delivered: "delivered" };
      if (hasSupabase) {
        try {
          const { data: row } = await sb.from("orders").select("status").eq("id", orderId).single();
          const newStatus = next[row?.status || "queued"];
          await sb.from("orders").update({ status: newStatus }).eq("id", orderId);
        } catch (e) { console.warn(e); }
      }
      const all = readLS(LS_ORDERS, []);
      const idx = all.findIndex(o => o.id === orderId);
      if (idx >= 0) { all[idx].status = next[all[idx].status]; writeLS(LS_ORDERS, all); }
    },

    // Delete an order outright (admin only). Throws on remote failure
    // so callers can tell the user something actually went wrong.
    async deleteOrder(orderId) {
      if (hasSupabase) {
        const { error: itemsErr } = await sb.from("order_items").delete().eq("order_id", orderId);
        if (itemsErr) throw new Error(`Couldn't delete order items: ${itemsErr.message}`);
        const { error: orderErr } = await sb.from("orders").delete().eq("id", orderId);
        if (orderErr) throw new Error(`Couldn't delete order: ${orderErr.message}`);
      }
      const all = readLS(LS_ORDERS, []);
      writeLS(LS_ORDERS, all.filter(o => o.id !== orderId));
    },

    // Dev helper — wipe today's local orders.
    _resetLocal() { localStorage.removeItem(LS_ORDERS); }
  };

  window.DB = api;
})();
