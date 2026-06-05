// app.js — orchestrates screens, sheets, and the cart.
// Reads from window.MENU / DB / config.js.

(function () {
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  // ───── state ─────
  const state = {
    staff: null,
    activeCat: window.MENU_CATEGORIES[0].id,
    cart: [],         // { uid, drink, qty, size, sugar, ice, milk, temp, item_note, lineTotal }
    editingDrink: null,
    customize: null   // working draft while customize sheet is open
  };

  // ───── small helpers ─────
  const money = (n) => `฿${Math.round(n)}`;
  const uid   = () => Math.random().toString(36).slice(2, 9);
  const toast = (msg) => {
    const el = $("#toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 1800);
  };

  function show(screenId) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === screenId));
    window.scrollTo({ top: 0 });
  }

  function openSheet(id) {
    $("#veil").classList.add("open");
    $(id).classList.add("open");
    $(id).setAttribute("aria-hidden", "false");
  }
  function closeSheets() {
    $("#veil").classList.remove("open");
    $$(".sheet").forEach(s => { s.classList.remove("open"); s.setAttribute("aria-hidden", "true"); });
  }
  $("#veil").addEventListener("click", closeSheets);

  // ───── login ─────
  function initLogin() {
    const sel = $("#room");
    sel.innerHTML = `<option value="" disabled selected>Pick a room…</option>` +
      (window.MEETING_ROOMS || []).map(r => `<option value="${r}">${r}</option>`).join("");

    $("#login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#name").value.trim();
      const room = sel.value;
      if (!name) { toast("Type your name first"); $("#name").focus(); return; }
      if (!room) { toast("Pick a meeting room");  sel.focus();        return; }
      $("#login-submit").setAttribute("disabled", "true");
      try {
        state.staff = await DB.signInStaff({ name, room });
        enterMenu();
      } catch (err) {
        console.error("Login failed:", err);
        toast("Something went wrong — try again");
      } finally {
        $("#login-submit").removeAttribute("disabled");
      }
    });

    // Restore previously signed-in staff (no password — just convenience).
    const cached = DB.currentStaff();
    if (cached) {
      $("#name").value = cached.name || "";
      // value of select is set after options render
      setTimeout(() => { if (cached.room) sel.value = cached.room; }, 0);
    }
  }

  function enterMenu() {
    if (!state.staff) state.staff = DB.currentStaff();
    if (!state.staff) { show("screen-login"); return; }
    $("#hello-name").textContent = `Hi, ${state.staff.name}.`;
    $("#hello-room").textContent = state.staff.room ? `· ${state.staff.room}` : "";
    tickClock();
    renderTabs();
    renderDrinks();
    renderCartBar();
    show("screen-menu");
  }

  $("#signout-btn").addEventListener("click", () => {
    DB.signOut();
    state.staff = null;
    state.cart = [];
    show("screen-login");
  });

  // ───── menu: tabs + list ─────
  function renderTabs() {
    const wrap = $("#cat-tabs");
    wrap.innerHTML = "";
    window.MENU_CATEGORIES.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "cat-tab" + (cat.id === state.activeCat ? " active" : "");
      btn.textContent = cat.label;
      btn.addEventListener("click", () => {
        state.activeCat = cat.id;
        renderTabs(); renderDrinks();
      });
      wrap.appendChild(btn);
    });
  }

  function drinkIcon(catId) {
    // tiny single-stroke icons per category — no AI-slop emoji
    const icons = {
      espresso: `<path d="M3 8h15a4 4 0 0 1 0 8h-1"/><path d="M4 8v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V8"/><path d="M8 3v3M12 3v3M16 3v3"/>`,
      milk:     `<path d="M6 7h12l-1.5 13a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8L6 7z"/><path d="M9 3h6v4H9z"/>`,
      brewed:   `<path d="M4 4h13l-1 5"/><path d="M4 4l1 11a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3l.5-3"/><path d="M16.5 9a3.5 3.5 0 0 1 0 7"/>`,
      iced:     `<path d="M12 3v18M5.5 6.5l13 11M5.5 17.5l13-11"/><path d="M9 3h6M9 21h6"/>`,
      tea:      `<path d="M4 8h12v6a5 5 0 0 1-10 0V8z"/><path d="M16 9h2a2 2 0 0 1 0 4h-2"/><path d="M9 5c0-1 .5-1.5 1.5-1.5S12 4 12 5"/>`,
      other:    `<path d="M5 11a7 7 0 0 1 14 0v3a7 7 0 0 1-14 0z"/><path d="M9 14a3 3 0 0 0 6 0"/>`
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[catId] || icons.other}</svg>`;
  }

  function renderDrinks() {
    const list = $("#drink-list"); list.innerHTML = "";
    const drinks = window.MENU.filter(d => d.cat === state.activeCat);
    if (!drinks.length) { list.innerHTML = `<div class="empty">Nothing here yet.</div>`; return; }
    drinks.forEach(d => {
      const card = document.createElement("button");
      card.className = "drink-card";
      card.innerHTML = `
        <div class="drink-thumb">${drinkIcon(d.cat)}</div>
        <div class="drink-info">
          <div class="drink-name">${d.name}</div>
          <div class="drink-desc">${d.desc}</div>
          <div class="drink-meta">
            ${d.temps.map(t => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
        <div class="drink-price"><span class="currency">฿</span>${d.price}</div>
      `;
      card.addEventListener("click", () => openCustomize(d));
      list.appendChild(card);
    });
  }

  // ───── customize sheet ─────
  function openCustomize(drink, preset) {
    state.editingDrink = drink;
    state.customize = preset || {
      qty: 1,
      temp: drink.temps[0],
      size: drink.opts.includes("size") ? "M" : null,
      sugar: drink.opts.includes("sugar") ? "50" : null,
      ice: drink.opts.includes("ice") ? "normal" : null,
      milk: drink.opts.includes("milk") ? "whole" : null,
      item_note: ""
    };

    $("#cust-name").textContent = drink.name;
    $("#cust-desc").textContent = drink.desc;

    const body = $("#cust-body"); body.innerHTML = "";

    // temp
    if (drink.temps.length > 1) body.appendChild(group("Temperature", drink.temps.map(t => ({ id: t, label: t === "hot" ? "Hot" : "Iced" })), "temp"));

    if (drink.opts.includes("size"))  body.appendChild(group("Size",  MENU_OPTIONS.size,  "size",  true));
    if (drink.opts.includes("sugar")) body.appendChild(group("Sugar", MENU_OPTIONS.sugar, "sugar"));
    if (drink.opts.includes("ice") && state.customize.temp === "iced")
      body.appendChild(group("Ice",   MENU_OPTIONS.ice,   "ice"));
    if (drink.opts.includes("milk"))  body.appendChild(group("Milk",  MENU_OPTIONS.milk,  "milk",  true));

    // qty
    const qty = document.createElement("div");
    qty.className = "opt-group";
    qty.innerHTML = `
      <div class="opt-label">Quantity</div>
      <div class="qty-row">
        <button class="qty-btn" id="q-minus">−</button>
        <span class="qty-val" id="q-val">1</span>
        <button class="qty-btn" id="q-plus">+</button>
      </div>`;
    body.appendChild(qty);

    // note
    const note = document.createElement("div");
    note.className = "field";
    note.innerHTML = `<label for="item-note">Note (optional)</label><textarea id="item-note" class="note-input" maxlength="80" placeholder="e.g. extra hot, no foam"></textarea>`;
    body.appendChild(note);

    body.querySelector("#q-minus").addEventListener("click", () => { state.customize.qty = Math.max(1, state.customize.qty - 1); $("#q-val").textContent = state.customize.qty; updatePrice(); });
    body.querySelector("#q-plus" ).addEventListener("click", () => { state.customize.qty = Math.min(20, state.customize.qty + 1); $("#q-val").textContent = state.customize.qty; updatePrice(); });
    body.querySelector("#item-note").addEventListener("input", (e) => { state.customize.item_note = e.target.value; });

    updatePrice();
    openSheet("#sheet-customize");
  }

  function group(label, options, key, showDelta) {
    const g = document.createElement("div");
    g.className = "opt-group";
    g.innerHTML = `<div class="opt-label">${label}</div><div class="opt-row"></div>`;
    const row = g.querySelector(".opt-row");
    options.forEach(o => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.dataset.key = key; chip.dataset.value = o.id;
      const delta = showDelta && o.delta ? ` <span class="delta">+฿${o.delta}</span>` : "";
      chip.innerHTML = `${o.label}${delta}`;
      chip.setAttribute("aria-selected", String(state.customize[key] === o.id));
      chip.addEventListener("click", () => {
        state.customize[key] = o.id;
        row.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-selected", String(c.dataset.value === o.id)));
        // toggle ice row visibility when temp changes — preserve other selections
        if (key === "temp") {
          const preserved = { ...state.customize, temp: o.id };
          openCustomize(state.editingDrink, preserved);
          return;
        }
        updatePrice();
      });
      row.appendChild(chip);
    });
    return g;
  }

  function unitPrice(drink, c) {
    let p = drink.price;
    if (c.size) p += (MENU_OPTIONS.size.find(s => s.id === c.size)?.delta || 0);
    if (c.milk) p += (MENU_OPTIONS.milk.find(s => s.id === c.milk)?.delta || 0);
    return p;
  }
  function updatePrice() {
    const d = state.editingDrink, c = state.customize;
    const p = unitPrice(d, c) * c.qty;
    $("#cust-price").textContent = money(p);
  }

  $("#cust-add").addEventListener("click", () => {
    const d = state.editingDrink, c = state.customize;
    const unit = unitPrice(d, c);
    state.cart.push({
      uid: uid(),
      drink_id: d.id,
      name: d.name,
      qty: c.qty,
      temp: c.temp,
      size: c.size, sugar: c.sugar, ice: c.ice, milk: c.milk,
      item_note: c.item_note,
      unit_price: unit,
      price: unit * c.qty
    });
    closeSheets();
    renderCartBar();
    toast(`Added · ${d.name}`);
  });

  // ───── cart ─────
  function renderCartBar() {
    const bar = $("#cart-bar");
    const items = state.cart.reduce((n, it) => n + it.qty, 0);
    const total = state.cart.reduce((n, it) => n + it.price, 0);
    $("#cart-count").textContent = items;
    $("#cart-total").textContent = money(total);
    bar.classList.toggle("hidden", items === 0);
  }
  $("#cart-bar").addEventListener("click", openCart);

  function describeLine(it) {
    const parts = [];
    if (it.temp)  parts.push(it.temp === "iced" ? "Iced" : "Hot");
    if (it.size)  parts.push(`Size ${it.size}`);
    if (it.sugar) parts.push(`Sugar ${it.sugar}%`);
    if (it.ice && it.temp === "iced")   parts.push(`Ice ${MENU_OPTIONS.ice.find(o=>o.id===it.ice)?.label || it.ice}`);
    if (it.milk && it.milk !== "whole") parts.push(`${MENU_OPTIONS.milk.find(o=>o.id===it.milk)?.label || it.milk} milk`);
    if (it.item_note) parts.push(`“${it.item_note}”`);
    return parts.join(" · ");
  }

  function openCart() {
    const list = $("#cart-list");
    list.innerHTML = "";
    if (!state.cart.length) {
      list.innerHTML = `<div class="empty">Nothing in your order yet.</div>`;
    } else {
      state.cart.forEach(it => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
          <div>
            <div class="name">${it.name}</div>
            <div class="opts">${describeLine(it)}</div>
          </div>
          <div class="price">${money(it.price)}</div>
          <div class="actions">
            <button class="qty-btn" data-act="dec" data-uid="${it.uid}">−</button>
            <span class="qty-val">${it.qty}</span>
            <button class="qty-btn" data-act="inc" data-uid="${it.uid}">+</button>
            <button class="remove" data-act="rm"  data-uid="${it.uid}">Remove</button>
          </div>`;
        list.appendChild(row);
      });
    }
    list.querySelectorAll("[data-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.dataset.uid;
        const it = state.cart.find(x => x.uid === u); if (!it) return;
        if (btn.dataset.act === "inc") { it.qty++;            it.price = it.unit_price * it.qty; }
        if (btn.dataset.act === "dec") { it.qty = Math.max(0, it.qty - 1); it.price = it.unit_price * it.qty; if (it.qty === 0) state.cart = state.cart.filter(x => x.uid !== u); }
        if (btn.dataset.act === "rm")  { state.cart = state.cart.filter(x => x.uid !== u); }
        openCart(); renderCartBar();
      });
    });

    const count = state.cart.reduce((n, it) => n + it.qty, 0);
    const total = state.cart.reduce((n, it) => n + it.price, 0);
    $("#cart-items-count").textContent = count;
    $("#cart-grand").textContent = money(total);
    $("#cart-send").toggleAttribute("disabled", count === 0);

    openSheet("#sheet-cart");
  }
  $("#cart-close").addEventListener("click", closeSheets);

  // ───── send order ─────
  $("#cart-send").addEventListener("click", async () => {
    if (!state.cart.length) return;
    $("#cart-send").setAttribute("disabled", "true");
    const items = state.cart.map(it => ({
      drink_id: it.drink_id, name: it.name, qty: it.qty,
      size: it.size, sugar: it.sugar, ice: it.ice, milk: it.milk,
      temp: it.temp, price: it.unit_price, item_note: it.item_note
    }));
    const note = $("#order-note").value.trim();
    const order = await DB.createOrder({ staff: state.staff, items, note });
    $("#order-note").value = "";
    state.cart = [];
    renderCartBar();
    closeSheets();
    showConfirmation(order);
    $("#cart-send").removeAttribute("disabled");
  });

  function showConfirmation(order) {
    $("#order-code").textContent = order.code;
    const summary = $("#order-summary");
    summary.innerHTML = order.items.map(it => `
      <div class="line"><span><span class="qty">${it.qty}×</span>${it.name}</span><span>${money(it.price * it.qty)}</span></div>
    `).join("");
    $("#confirm-body").textContent =
      order.room
        ? `Heading to ${order.room} for ${order.staff_name}. Listen for the code at the door.`
        : `Order received from ${order.staff_name}. Listen for the code at the door.`;
    show("screen-confirm");
  }
  $("#back-to-menu").addEventListener("click", enterMenu);

  // ───── clock ─────
  function tickClock() {
    const update = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      $("#menu-clock").textContent = `${hh}:${mm}  ·  ${DB.mode === "supabase" ? "live" : "offline"}`;
    };
    update();
    clearInterval(tickClock._t);
    tickClock._t = setInterval(update, 30 * 1000);
  }

  // ───── init ─────
  initLogin();
  if (DB.currentStaff()) enterMenu();
})();
