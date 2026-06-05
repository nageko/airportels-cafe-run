// app.js — orchestrates screens, sheets, and the cart.
// Reads from window.MENU / DB / config.js.

(function () {
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  // ───── state ─────
  const state = {
    staff: null,
    activeCat: window.MENU_CATEGORIES[0].id,
    cart: [],         // { uid, drink_id, name, qty, temp, sugar, item_note }
    editingDrink: null,
    customize: null   // working draft while customize sheet is open
  };

  // ───── small helpers ─────
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

  // ─────── pure CSS/SVG drink renderer (no image files) ───────
  function escapeXml(s) {
    return String(s).replace(/[<>&"']/g, c => ({ "<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&apos;" }[c]));
  }
  function renderCup(drink) {
    const r = drink.recipe || {};
    switch (r.type) {
      case "hot":    return cupHot(r);
      case "bottle": return cupBottle(r);
      case "can":    return cupCan(r);
      case "iced":
      default:       return cupIced(r, drink.id);
    }
  }
  function cupIced(r, id) {
    const base = r.base || "#3a2418";
    const top = r.top, topPct = (r.topPct ?? 0.28);
    const topBandH = 54 * topPct;
    const cid = `c-${id}`;
    return `<svg viewBox="0 0 64 84" class="cup cup--iced" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath id="${cid}">
          <path d="M14 22 L50 22 L46 74 Q46 76 44 76 L20 76 Q18 76 18 74 Z"/>
        </clipPath>
      </defs>
      <rect x="40" y="6" width="3.5" height="22" rx="0.6" fill="#fef0e0"/>
      <rect x="40.2" y="6" width="1.1" height="22" fill="rgba(255,255,255,0.45)"/>
      <ellipse cx="32" cy="20" rx="20" ry="3.2" fill="#fafafa"/>
      <rect x="12" y="20" width="40" height="5" fill="#fafafa"/>
      <ellipse cx="32" cy="25" rx="20" ry="2.6" fill="#e0ddd5"/>
      <rect x="14" y="22" width="36" height="54" fill="${base}" clip-path="url(#${cid})"/>
      ${top ? `<rect x="14" y="22" width="36" height="${topBandH.toFixed(1)}" fill="${top}" clip-path="url(#${cid})"/>` : ""}
      <g clip-path="url(#${cid})" fill="rgba(255,255,255,0.42)" stroke="rgba(255,255,255,0.22)" stroke-width="0.3">
        <rect x="19" y="30" width="9" height="9" rx="1.2" transform="rotate(18 23.5 34.5)"/>
        <rect x="33" y="36" width="8" height="8" rx="1.2" transform="rotate(-12 37 40)"/>
        <rect x="23" y="48" width="9" height="9" rx="1.2" transform="rotate(8 27.5 52.5)"/>
        <rect x="34" y="56" width="6" height="6" rx="1" transform="rotate(-22 37 59)"/>
      </g>
      ${r.garnish === "fruit" ? `
        <g clip-path="url(#${cid})">
          <circle cx="22" cy="32" r="2.4" fill="#ff6b3a"/>
          <circle cx="40" cy="38" r="2" fill="#d22020"/>
          <circle cx="28" cy="44" r="2.2" fill="#f0a830"/>
          <path d="M36 50 Q38 48 40 50 Q38 54 36 50" fill="#3e8a3a"/>
        </g>` : ""}
      <path d="M14 22 L50 22 L46 74 Q46 76 44 76 L20 76 Q18 76 18 74 Z" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="0.7"/>
      <text x="32" y="69" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="3.6" fill="rgba(255,255,255,0.55)">Gather</text>
    </svg>`;
  }
  function cupHot(r) {
    const base = r.base || "#3a2418";
    const top = r.top, art = r.art;
    return `<svg viewBox="0 0 64 84" class="cup cup--hot" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="rgba(255,255,255,0.55)" stroke-width="1.1" stroke-linecap="round" fill="none">
        <path d="M22 4 Q24 10 22 16"/>
        <path d="M32 1 Q34 9 32 16"/>
        <path d="M42 4 Q40 10 42 16"/>
      </g>
      <path d="M52 36 Q60 36 60 46 Q60 56 52 56" fill="none" stroke="#f5f1ea" stroke-width="3" stroke-linecap="round"/>
      <path d="M52 39.5 Q57 39.5 57 46 Q57 52.5 52 52.5" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.8"/>
      <path d="M10 26 L54 26 L52 64 Q52 68 48 68 L16 68 Q12 68 12 64 Z" fill="#fbf8f1"/>
      <path d="M10 26 L54 26 L52 64 Q52 68 48 68 L16 68 Q12 68 12 64 Z" fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="0.6"/>
      <ellipse cx="32" cy="28" rx="20.5" ry="3.2" fill="${base}"/>
      ${top ? `<ellipse cx="32" cy="28" rx="20.5" ry="3.2" fill="${top}"/>` : ""}
      ${top && art === "heart" ? `
        <path d="M30 25.6 Q28.2 23.8 30 23 Q31.6 23.6 32 24.6 Q32.4 23.6 34 23 Q35.8 23.8 34 25.6 Q33 27.4 32 28.6 Q31 27.4 30 25.6 Z" fill="${base}" opacity="0.7"/>
      ` : ""}
      ${top && art === "leaf" ? `
        <g fill="${base}" opacity="0.5">
          <ellipse cx="32" cy="27.6" rx="10" ry="1.4"/>
          <ellipse cx="32" cy="27.6" rx="7" ry="1.0"/>
          <ellipse cx="32" cy="27.6" rx="4" ry="0.7"/>
          <line x1="22" y1="27.6" x2="42" y2="27.6" stroke="${base}" stroke-width="0.4"/>
        </g>` : ""}
      ${top && art === "lattice" ? `
        <g stroke="${base}" stroke-width="0.5" opacity="0.55" fill="none">
          <ellipse cx="32" cy="27.5" rx="18" ry="2.5"/>
          <ellipse cx="32" cy="27.5" rx="14" ry="2"/>
          <ellipse cx="32" cy="27.5" rx="10" ry="1.5"/>
          <ellipse cx="32" cy="27.5" rx="6" ry="1"/>
        </g>` : ""}
      <text x="32" y="60" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="4.5" fill="rgba(0,0,0,0.18)">Gather</text>
      <ellipse cx="32" cy="73" rx="27" ry="3.6" fill="#fbf8f1" stroke="rgba(0,0,0,0.12)" stroke-width="0.6"/>
      <ellipse cx="32" cy="72" rx="22" ry="2.6" fill="#f0ebe1"/>
    </svg>`;
  }
  function cupBottle(r) {
    const base = r.base || "#5a4030";
    const labelBg = r.labelBg || "#fdf6e3";
    const ink = r.inkOnLabel || "#3a2810";
    const lines = (r.label || "").split("\n").slice(0, 2);
    const fontSize = lines.length === 1 ? 4.6 : 4.2;
    return `<svg viewBox="0 0 64 84" class="cup cup--bottle" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="26" y="6" width="12" height="6" rx="1" fill="#3a3530"/>
      <rect x="26" y="6" width="12" height="1.8" fill="rgba(255,255,255,0.18)"/>
      <rect x="27" y="12" width="10" height="10" fill="${base}"/>
      <ellipse cx="32" cy="22" rx="5" ry="1.5" fill="rgba(0,0,0,0.22)"/>
      <path d="M27 22 Q22 26 18 32 L18 72 Q18 78 24 78 L40 78 Q46 78 46 72 L46 32 Q42 26 37 22 Z" fill="${base}"/>
      <path d="M22 30 L22 70" stroke="rgba(255,255,255,0.22)" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <path d="M27 22 Q22 26 18 32 L18 72 Q18 78 24 78 L40 78 Q46 78 46 72 L46 32 Q42 26 37 22" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="0.5"/>
      <rect x="19" y="40" width="26" height="28" rx="1" fill="${labelBg}"/>
      <rect x="19" y="40" width="26" height="2.5" fill="rgba(0,0,0,0.08)"/>
      <rect x="19" y="65.5" width="26" height="2.5" fill="rgba(0,0,0,0.08)"/>
      <text x="32" y="47" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="3.4" fill="${ink}" opacity="0.9">* Gather *</text>
      <text x="32" y="50.5" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="5" fill="${ink}">Craft Soda</text>
      <g font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="800" letter-spacing="0.2" text-anchor="middle">
        <text x="32" y="${lines.length === 1 ? 60 : 57}" font-size="${fontSize}" fill="${ink}">${escapeXml(lines[0])}</text>
        ${lines[1] ? `<text x="32" y="62" font-size="${fontSize}" fill="${ink}">${escapeXml(lines[1])}</text>` : ""}
      </g>
    </svg>`;
  }
  function cupCan(r) {
    const base = r.base || "#c8443a";
    const labelBg = r.labelBg || "#fff";
    const ink = r.inkOnLabel || "#5a1810";
    const lines = (r.label || "").split("\n").slice(0, 2);
    return `<svg viewBox="0 0 64 84" class="cup cup--can" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="32" cy="14" rx="16" ry="2.5" fill="#d8d4cc"/>
      <ellipse cx="32" cy="13.5" rx="14" ry="1.7" fill="#aeaaa2"/>
      <rect x="16" y="14" width="32" height="60" fill="${base}"/>
      <rect x="16" y="14" width="2.8" height="60" fill="rgba(255,255,255,0.20)"/>
      <rect x="45.2" y="14" width="2.8" height="60" fill="rgba(0,0,0,0.16)"/>
      <ellipse cx="32" cy="74" rx="16" ry="2.5" fill="rgba(0,0,0,0.28)"/>
      <ellipse cx="32" cy="73.2" rx="14" ry="1.8" fill="${base}"/>
      <rect x="20" y="34" width="24" height="22" rx="1" fill="${labelBg}"/>
      <g font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="800" letter-spacing="0.2" text-anchor="middle">
        <text x="32" y="${lines.length === 1 ? 49 : 44.5}" font-size="${lines.length === 1 ? 5.5 : 4.6}" fill="${ink}">${escapeXml(lines[0])}</text>
        ${lines[1] ? `<text x="32" y="51" font-size="4.6" fill="${ink}">${escapeXml(lines[1])}</text>` : ""}
      </g>
      <rect x="16" y="14" width="32" height="60" fill="none" stroke="rgba(0,0,0,0.14)" stroke-width="0.5"/>
    </svg>`;
  }

  function renderDrinks() {
    const list = $("#drink-list"); list.innerHTML = "";
    const drinks = window.MENU.filter(d => d.cat === state.activeCat);
    if (!drinks.length) { list.innerHTML = `<div class="empty">Nothing here yet.</div>`; return; }
    drinks.forEach(d => {
      const card = document.createElement("button");
      card.className = "drink-card";
      const bestTag = d.bestseller ? `<span class="best-flag">Best · #${d.bestseller}</span>` : "";
      const thaiLine = d.thai ? `<div class="drink-thai">${d.thai}</div>` : "";
      card.innerHTML = `
        <div class="drink-thumb">${renderCup(d)}</div>
        <div class="drink-info">
          <div class="drink-name">${d.name}${bestTag}</div>
          ${thaiLine}
          <div class="drink-desc">${d.desc}</div>
          <div class="drink-meta">
            ${d.temps.map(t => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
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
      sugar: drink.opts.includes("sugar") ? "50" : null,
      customName: "",
      item_note: ""
    };

    $("#cust-name").innerHTML = drink.name + (drink.thai ? ` <span class="cust-thai">${drink.thai}</span>` : "");
    $("#cust-desc").textContent = drink.desc;

    const body = $("#cust-body"); body.innerHTML = "";

    // Drink visual at the top of the sheet
    const visual = document.createElement("div");
    visual.className = "cust-visual";
    visual.innerHTML = renderCup(drink);
    body.appendChild(visual);

    // Custom-drink name input (Other category)
    if (drink.custom) {
      const nameField = document.createElement("div");
      nameField.className = "field";
      nameField.style.marginBottom = "18px";
      nameField.innerHTML = `<label for="custom-name">Drink name</label>
        <input id="custom-name" type="text" maxlength="60" placeholder="e.g. Iced Hojicha Latte, Espresso Tonic" autocomplete="off" />`;
      body.appendChild(nameField);
      nameField.querySelector("#custom-name").addEventListener("input", (e) => {
        state.customize.customName = e.target.value;
      });
    }

    // temp
    if (drink.temps.length > 1) body.appendChild(group("Temperature", drink.temps.map(t => ({ id: t, label: t === "hot" ? "Hot" : "Iced" })), "temp"));

    if (drink.opts.includes("sugar")) body.appendChild(group("Sugar level", MENU_OPTIONS.sugar, "sugar"));

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

    body.querySelector("#q-minus").addEventListener("click", () => { state.customize.qty = Math.max(1, state.customize.qty - 1); $("#q-val").textContent = state.customize.qty; });
    body.querySelector("#q-plus" ).addEventListener("click", () => { state.customize.qty = Math.min(20, state.customize.qty + 1); $("#q-val").textContent = state.customize.qty; });
    body.querySelector("#item-note").addEventListener("input", (e) => { state.customize.item_note = e.target.value; });

    openSheet("#sheet-customize");
  }

  function group(label, options, key) {
    const g = document.createElement("div");
    g.className = "opt-group";
    g.innerHTML = `<div class="opt-label">${label}</div><div class="opt-row"></div>`;
    const row = g.querySelector(".opt-row");
    options.forEach(o => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.dataset.key = key; chip.dataset.value = o.id;
      chip.innerHTML = `${o.label}`;
      chip.setAttribute("aria-selected", String(state.customize[key] === o.id));
      chip.addEventListener("click", () => {
        state.customize[key] = o.id;
        row.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-selected", String(c.dataset.value === o.id)));
      });
      row.appendChild(chip);
    });
    return g;
  }

  $("#cust-add").addEventListener("click", () => {
    const d = state.editingDrink, c = state.customize;
    let lineName = d.name;
    if (d.custom) {
      const typed = (c.customName || "").trim();
      if (!typed) {
        toast("Type the drink name first");
        const el = $("#custom-name"); if (el) el.focus();
        return;
      }
      lineName = typed;
    }
    state.cart.push({
      uid: uid(),
      drink_id: d.id,
      name: lineName,
      qty: c.qty,
      temp: c.temp,
      sugar: c.sugar,
      item_note: c.item_note
    });
    closeSheets();
    renderCartBar();
    toast(`Added · ${lineName}`);
  });

  // ───── cart ─────
  function renderCartBar() {
    const bar = $("#cart-bar");
    const items = state.cart.reduce((n, it) => n + it.qty, 0);
    $("#cart-count").textContent = items;
    bar.classList.toggle("hidden", items === 0);
  }
  $("#cart-bar").addEventListener("click", openCart);

  function describeLine(it) {
    const parts = [];
    if (it.temp)  parts.push(it.temp === "iced" ? "Iced" : "Hot");
    if (it.sugar !== null && it.sugar !== undefined && it.sugar !== "")
      parts.push(`Sugar ${it.sugar}%`);
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
        if (btn.dataset.act === "inc") { it.qty++; }
        if (btn.dataset.act === "dec") { it.qty = Math.max(0, it.qty - 1); if (it.qty === 0) state.cart = state.cart.filter(x => x.uid !== u); }
        if (btn.dataset.act === "rm")  { state.cart = state.cart.filter(x => x.uid !== u); }
        openCart(); renderCartBar();
      });
    });

    const count = state.cart.reduce((n, it) => n + it.qty, 0);
    $("#cart-items-count").textContent = count;
    $("#cart-send").toggleAttribute("disabled", count === 0);

    openSheet("#sheet-cart");
  }
  $("#cart-close").addEventListener("click", closeSheets);
  $("#cust-close").addEventListener("click", closeSheets);

  // ───── send order ─────
  $("#cart-send").addEventListener("click", async () => {
    if (!state.cart.length) return;
    $("#cart-send").setAttribute("disabled", "true");
    const items = state.cart.map(it => ({
      drink_id: it.drink_id, name: it.name, qty: it.qty,
      sugar: it.sugar,
      temp: it.temp, item_note: it.item_note
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
      <div class="line"><span><span class="qty">${it.qty}×</span>${it.name}</span></div>
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
