// i18n.js — TH/EN string table + tiny helper used by app.js and admin.html.
// Drink names themselves live on menu.js; this only covers UI chrome + option labels.

(function () {
  const STORAGE_KEY = "airportels.lang.v1";

  const STRINGS = {
    // login
    "login.title":            { en: "Coffee for the<br/>next <em>meeting.</em>", th: "กาแฟ สำหรับ<br/><em>มีตติ้ง</em>ครั้งต่อไป" },
    "login.blurb":            { en: "Tell us who you are and which room. We'll bring it over warm.",
                                th: "บอกชื่อและห้องประชุม เราจะส่งเครื่องดื่มไปให้" },
    "login.name.label":       { en: "Your name", th: "ชื่อของคุณ" },
    "login.name.placeholder": { en: "e.g. Praew", th: "เช่น แพรว" },
    "login.room.label":       { en: "Meeting room", th: "ห้องประชุม" },
    "login.room.placeholder": { en: "Pick a room…", th: "เลือกห้อง…" },
    "login.submit":           { en: "See the menu", th: "ดูเมนู" },
    "login.foot":             { en: "internal · no password · just bring the cup",
                                th: "ใช้ภายในเท่านั้น · ไม่มีรหัส" },
    // menu / header
    "menu.title":             { en: "Today's menu", th: "เมนูวันนี้" },
    "menu.greet":             { en: "Hi,", th: "สวัสดี," },
    "cart.review":            { en: "Review order", th: "ดูออเดอร์" },
    // categories
    "cat.espresso": { en: "Espresso",     th: "เอสเพรสโซ" },
    "cat.matcha":   { en: "Matcha",       th: "มัทฉะ" },
    "cat.tea":      { en: "Tea & Milk",   th: "ชา & นม" },
    "cat.cocoa":    { en: "Cocoa",        th: "โกโก้" },
    "cat.soda":     { en: "Craft Soda",   th: "คราฟต์โซดา" },
    "cat.juice":    { en: "Juice & More", th: "น้ำผลไม้" },
    "cat.summer":   { en: "Summer",       th: "ซัมเมอร์" },
    "cat.hot":      { en: "Hot Menu",     th: "เมนูร้อน" },
    "cat.other":    { en: "Other",        th: "อื่นๆ" },
    // customize sheet
    "sheet.cust.add":              { en: "Add to order", th: "เพิ่มในออเดอร์" },
    "sheet.cust.qty":              { en: "Quantity", th: "จำนวน" },
    "sheet.cust.note.label":       { en: "Note (optional)", th: "หมายเหตุ (ไม่บังคับ)" },
    "sheet.cust.note.placeholder": { en: "e.g. extra hot, no foam", th: "เช่น ร้อนพิเศษ, ไม่ใส่ฟอง" },
    "sheet.cust.customname.label": { en: "Drink name", th: "ชื่อเครื่องดื่ม" },
    "sheet.cust.customname.placeholder": {
      en: "e.g. Iced Hojicha Latte, Espresso Tonic",
      th: "เช่น โฮจิฉะลาเต้เย็น, เอสเพรสโซโทนิค"
    },
    // cart sheet
    "sheet.cart.title":            { en: "Your order", th: "ออเดอร์ของคุณ" },
    "sheet.cart.sub":              { en: "Review and add a note before sending",
                                     th: "ตรวจสอบและเพิ่มหมายเหตุก่อนส่ง" },
    "sheet.cart.note.label":       { en: "Note for the cafe (optional)",
                                     th: "หมายเหตุถึงคาเฟ่ (ไม่บังคับ)" },
    "sheet.cart.note.placeholder": { en: "e.g. arrive at 14:30, hand to Praew at Friday Workshop",
                                     th: "เช่น เข้าห้องเวลา 14:30, ส่งให้แพรวที่ Friday Workshop" },
    "sheet.cart.items":            { en: "Items", th: "จำนวน" },
    "sheet.cart.back":             { en: "Back", th: "ย้อนกลับ" },
    "sheet.cart.send":             { en: "Send order", th: "ส่งออเดอร์" },
    "sheet.cart.empty":            { en: "Nothing in your order yet.", th: "ยังไม่มีรายการในออเดอร์" },
    "sheet.cart.remove":           { en: "Remove", th: "ลบ" },
    // confirmation
    "confirm.title":   { en: "Order placed.", th: "ส่งออเดอร์แล้ว" },
    "confirm.code":    { en: "Order code", th: "โค้ดออเดอร์" },
    "confirm.back":    { en: "Order another", th: "สั่งเพิ่ม" },
    "confirm.seeall":  { en: "See all orders", th: "ดูทุกออเดอร์" },
    // options
    "opt.sugar":       { en: "Sugar level", th: "ความหวาน" },
    "opt.sugar.0":     { en: "No sugar", th: "ไม่หวาน" },
    "opt.temp":        { en: "Temperature", th: "ร้อน/เย็น" },
    "opt.temp.hot":    { en: "Hot", th: "ร้อน" },
    "opt.temp.iced":   { en: "Iced", th: "เย็น" },
    "opt.roast":       { en: "Roast", th: "ระดับคั่ว" },
    "opt.roast.light": { en: "Light",  th: "คั่วอ่อน" },
    "opt.roast.medium":{ en: "Medium", th: "คั่วกลาง" },
    "opt.roast.dark":  { en: "Dark",   th: "คั่วเข้ม" },
    // toasts
    "toast.typename":   { en: "Type your name first", th: "กรอกชื่อก่อน" },
    "toast.pickroom":   { en: "Pick a meeting room",  th: "เลือกห้องประชุม" },
    "toast.customname": { en: "Type the drink name first", th: "พิมพ์ชื่อเครื่องดื่มก่อน" },
    "toast.error":      { en: "Something went wrong — try again", th: "เกิดข้อผิดพลาด ลองอีกครั้ง" },
    "toast.added":      { en: "Added · ", th: "เพิ่มแล้ว · " },
    // status meta
    "meta.live":    { en: "live", th: "ออนไลน์" },
    "meta.offline": { en: "offline", th: "ออฟไลน์" }
  };

  const api = {
    current: "en",
    init() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "en" || saved === "th") this.current = saved;
      } catch (e) {}
    },
    setLang(lang) {
      if (lang !== "en" && lang !== "th") return;
      this.current = lang;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
      document.documentElement.setAttribute("lang", lang);
      document.dispatchEvent(new CustomEvent("lang:change", { detail: lang }));
    },
    toggle() { this.setLang(this.current === "en" ? "th" : "en"); },
    t(key) {
      const s = STRINGS[key];
      if (!s) return key;
      return s[this.current] || s.en || key;
    }
  };

  api.init();
  document.documentElement.setAttribute("lang", api.current);
  window.I18N = api;
})();
