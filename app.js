/**
 * SmartBelanja Kos - PWA Grocery & Budget Safety Tracker
 * Specially designed for university student (Rian) pushing a supermarket cart.
 */

// =============================================================================
// 1. DATA STATE & BENCHMARK DATABASE
// =============================================================================

// Default Benchmark Prices from "Last Month" for typical Indonesian student groceries
const INITIAL_BENCHMARK_DATABASE = {
  "beras ramos 5kg": {
    name: "Beras Ramos 5kg",
    category: "Beras & Pokok",
    unit: "kg",
    lastPrice: 62000,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 60000 },
      { date: "2026-09-02", price: 62000 }
    ]
  },
  "minyak goreng bimoli 2l": {
    name: "Minyak Goreng Bimoli 2L",
    category: "Minyak & Bumbu",
    unit: "liter",
    lastPrice: 36000,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 35000 },
      { date: "2026-09-02", price: 36000 }
    ]
  },
  "telur ayam negri 1kg": {
    name: "Telur Ayam Negri 1kg",
    category: "Beras & Pokok",
    unit: "kg",
    lastPrice: 25000,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 26000 },
      { date: "2026-09-02", price: 25000 }
    ]
  },
  "indomie goreng": {
    name: "Indomie Goreng",
    category: "Makanan Instan",
    unit: "pcs",
    lastPrice: 3100,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 3000 },
      { date: "2026-09-02", price: 3100 }
    ]
  },
  "sabun cuci rinso 800g": {
    name: "Sabun Cuci Rinso 800g",
    category: "Sabun & Kebersihan",
    unit: "pack",
    lastPrice: 24000,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 24000 },
      { date: "2026-09-02", price: 24000 }
    ]
  },
  "pasta gigi pepsodent 190g": {
    name: "Pasta Gigi Pepsodent 190g",
    category: "Sabun & Kebersihan",
    unit: "pcs",
    lastPrice: 14500,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 14500 },
      { date: "2026-09-02", price: 14500 }
    ]
  },
  "sabun mandi lifebuoy 4x110g": {
    name: "Sabun Mandi Lifebuoy 4x110g",
    category: "Sabun & Kebersihan",
    unit: "pack",
    lastPrice: 18000,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 17500 },
      { date: "2026-09-02", price: 18000 }
    ]
  },
  "kecap manis bango 550ml": {
    name: "Kecap Manis Bango 550ml",
    category: "Minyak & Bumbu",
    unit: "pack",
    lastPrice: 21500,
    recordedDate: "2026-09-02",
    history: [
      { date: "2026-08-01", price: 21000 },
      { date: "2026-09-02", price: 21500 }
    ]
  }
};

// Initial realistic cart session to demonstrate all features immediately for Rian
const INITIAL_DEMO_CART = [
  {
    id: "item-1",
    name: "Beras Ramos 5kg",
    category: "Beras & Pokok",
    unit: "kg",
    qty: 1,
    unitPrice: 68000, // Price INCREASED vs 62000 -> 🔴 Red Up Arrow
    discount: { type: "none" },
    isDeferred: false
  },
  {
    id: "item-2",
    name: "Minyak Goreng Bimoli 2L",
    category: "Minyak & Bumbu",
    unit: "liter",
    qty: 1,
    unitPrice: 34000, // Price DECREASED vs 36000 -> 🟢 Green Down Arrow
    discount: { type: "none" },
    isDeferred: false
  },
  {
    id: "item-3",
    name: "Sabun Cuci Rinso 800g",
    category: "Sabun & Kebersihan",
    unit: "pack",
    qty: 1,
    unitPrice: 28000, // Shelf clearance promo: 50% + 20% stacked promo!
    discount: {
      type: "tiered",
      disc1: 50,
      disc2: 20
    },
    isDeferred: false
  },
  {
    id: "item-4",
    name: "Indomie Goreng",
    category: "Makanan Instan",
    unit: "pcs",
    qty: 10,
    unitPrice: 3100, // Price EQUAL vs 3100 -> ⚪ Equal Sign
    discount: { type: "none" },
    isDeferred: false
  },
  {
    id: "item-5",
    name: "Telur Ayam Negri 1kg",
    category: "Beras & Pokok",
    unit: "kg",
    qty: 1,
    unitPrice: 28500, // Price INCREASED vs 25000 -> 🔴 Red Up Arrow
    discount: { type: "none" },
    isDeferred: false
  }
];

// App State
const state = {
  budgetLimit: 400000,
  cart: [],
  benchmarkDB: {},
  historyTrips: [],
  activeCategory: "ALL",
  soundEnabled: true,
  currentDiscType: "tiered"
};

// =============================================================================
// 2. AUDIO & HAPTIC FEEDBACK (Ergonomic for one-hand shopping)
// =============================================================================
let audioCtx = null;
function playTapSound(type = "click") {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === "click") {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "warning") {
      osc.frequency.setValueAtTime(350, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    // AudioContext might be restricted until user interaction
  }

  // Trigger mobile vibration if supported
  if (navigator.vibrate) {
    if (type === "warning") navigator.vibrate([60, 40, 60]);
    else navigator.vibrate(25);
  }
}

// =============================================================================
// 3. STORAGE & INITIALIZATION
// =============================================================================
function loadState() {
  const savedBudget = localStorage.getItem("sb_budget");
  if (savedBudget) state.budgetLimit = parseInt(savedBudget, 10);

  const savedCart = localStorage.getItem("sb_cart");
  if (savedCart) {
    try {
      state.cart = JSON.parse(savedCart);
    } catch (e) {
      state.cart = [];
    }
  } else {
    // First run: load Rian's initial realistic demo cart
    state.cart = JSON.parse(JSON.stringify(INITIAL_DEMO_CART));
  }

  const savedDB = localStorage.getItem("sb_benchmark_db");
  if (savedDB) {
    try {
      state.benchmarkDB = JSON.parse(savedDB);
    } catch (e) {
      state.benchmarkDB = INITIAL_BENCHMARK_DATABASE;
    }
  } else {
    state.benchmarkDB = JSON.parse(JSON.stringify(INITIAL_BENCHMARK_DATABASE));
  }

  const savedHistory = localStorage.getItem("sb_history");
  if (savedHistory) {
    try {
      state.historyTrips = JSON.parse(savedHistory);
    } catch (e) {
      state.historyTrips = [];
    }
  } else {
    // Seed one previous month receipt so Rian sees past comparison right away
    state.historyTrips = [
      {
        id: "trip-sept-2026",
        date: "2026-09-02",
        store: "Superindo Swalayan",
        total: 160600,
        savings: 12000,
        itemsCount: 5,
        items: [
          { name: "Beras Ramos 5kg", qty: 1, unitPrice: 62000, finalPrice: 62000 },
          { name: "Minyak Goreng Bimoli 2L", qty: 1, unitPrice: 36000, finalPrice: 36000 },
          { name: "Indomie Goreng", qty: 10, unitPrice: 3100, finalPrice: 31000 },
          { name: "Telur Ayam Negri 1kg", qty: 1, unitPrice: 25000, finalPrice: 25000 },
          { name: "Sabun Cuci Rinso 800g", qty: 1, unitPrice: 24000, finalPrice: 24000 }
        ]
      }
    ];
  }
}

function saveState(skipFirebase = false) {
  localStorage.setItem("sb_budget", state.budgetLimit.toString());
  localStorage.setItem("sb_cart", JSON.stringify(state.cart));
  localStorage.setItem("sb_benchmark_db", JSON.stringify(state.benchmarkDB));
  localStorage.setItem("sb_history", JSON.stringify(state.historyTrips));

  if (!skipFirebase && window.FirebaseSync && window.FirebaseSync.isReady()) {
    window.FirebaseSync.saveBudgetLimit(state.budgetLimit);
    window.FirebaseSync.saveCart(state.cart);
    window.FirebaseSync.saveBenchmarkDB(state.benchmarkDB);
  }
}

// =============================================================================
// 4. MATHEMATICAL FORMULAS & COMPUTATION LOGIC (F-02, F-03, F-04)
// =============================================================================

// Format Rupiah
function formatRupiah(num) {
  if (isNaN(num)) return "Rp 0";
  return "Rp " + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Calculate Item Final Unit Price & Total (F-02 & F-03 Tiered Discount)
function calculateItemPricing(item) {
  const baseUnitPrice = Number(item.unitPrice) || 0;
  const qty = Number(item.qty) || 1;
  let finalUnitPrice = baseUnitPrice;
  let discountAmountPerUnit = 0;
  let discountLabel = "";

  if (item.discount && item.discount.type !== "none") {
    if (item.discount.type === "tiered") {
      // Tiered / Stacked discount: base * (1 - d1) * (1 - d2)
      const d1 = Math.min(100, Math.max(0, Number(item.discount.disc1) || 0));
      const d2 = Math.min(100, Math.max(0, Number(item.discount.disc2) || 0));
      const step1 = baseUnitPrice * (1 - d1 / 100);
      const step2 = step1 * (1 - d2 / 100);
      finalUnitPrice = step2;
      discountAmountPerUnit = baseUnitPrice - finalUnitPrice;
      discountLabel = `Diskon ${d1}% + ${d2}%`;
    } else if (item.discount.type === "percent") {
      const p = Math.min(100, Math.max(0, Number(item.discount.percent) || 0));
      finalUnitPrice = baseUnitPrice * (1 - p / 100);
      discountAmountPerUnit = baseUnitPrice - finalUnitPrice;
      discountLabel = `Diskon ${p}%`;
    } else if (item.discount.type === "flat") {
      const flat = Math.max(0, Number(item.discount.flatAmount) || 0);
      discountAmountPerUnit = Math.min(baseUnitPrice, flat);
      finalUnitPrice = Math.max(0, baseUnitPrice - flat);
      discountLabel = `Hemat ${formatRupiah(flat)}`;
    }
  }

  const lineTotal = finalUnitPrice * qty;
  const lineBaseTotal = baseUnitPrice * qty;
  const totalSavings = (baseUnitPrice - finalUnitPrice) * qty;

  return {
    baseUnitPrice,
    finalUnitPrice,
    qty,
    lineTotal,
    lineBaseTotal,
    totalSavings,
    discountLabel
  };
}

// Compare Current Input Price with Last Month Benchmark (F-04)
function getPriceComparison(itemName, currentUnitPrice) {
  const key = itemName.trim().toLowerCase();
  const benchmark = state.benchmarkDB[key];

  if (!benchmark || !benchmark.lastPrice) {
    return {
      status: "new",
      text: "Item Baru (Belum ada catatan)",
      diff: 0,
      percent: 0,
      arrow: "✨",
      className: "price-new",
      lastPrice: null
    };
  }

  const oldPrice = benchmark.lastPrice;
  const curr = Number(currentUnitPrice);
  const diff = curr - oldPrice;
  const percent = Math.round((diff / oldPrice) * 100);

  if (diff > 0) {
    // 🔴 Red Up Arrow (Price Increased)
    return {
      status: "up",
      text: `↑ +${formatRupiah(diff)} (+${percent}%) vs bln lalu (${formatRupiah(oldPrice)})`,
      diff,
      percent,
      arrow: "↑",
      className: "price-up",
      lastPrice: oldPrice
    };
  } else if (diff < 0) {
    // 🟢 Green Down Arrow (Price Decreased)
    return {
      status: "down",
      text: `↓ -${formatRupiah(Math.abs(diff))} (${percent}%) Lebih Murah! vs ${formatRupiah(oldPrice)}`,
      diff,
      percent,
      arrow: "↓",
      className: "price-down",
      lastPrice: oldPrice
    };
  } else {
    // ⚪ Equal Sign (Stable Price)
    return {
      status: "equal",
      text: `= Sama dengan bln lalu (${formatRupiah(oldPrice)})`,
      diff: 0,
      percent: 0,
      arrow: "=",
      className: "price-equal",
      lastPrice: oldPrice
    };
  }
}

// Compute Entire Cart Totals & Safety Cap
function computeCartTotals() {
  let grandTotal = 0;
  let totalSavings = 0;
  let activeItemsCount = 0;

  state.cart.forEach((item) => {
    if (!item.isDeferred) {
      const calc = calculateItemPricing(item);
      grandTotal += calc.lineTotal;
      totalSavings += calc.totalSavings;
      activeItemsCount += item.qty;
    }
  });

  const remaining = state.budgetLimit - grandTotal;
  const percentage = Math.min(100, Math.round((grandTotal / state.budgetLimit) * 100));

  let safetyStatus = "safe";
  let badgeText = "Aman di Kasir";
  let badgeIcon = "check-circle";

  if (percentage >= 100 || grandTotal > state.budgetLimit) {
    safetyStatus = "danger";
    badgeText = "Bahaya! Kurangi Barang";
    badgeIcon = "alert-triangle";
  } else if (percentage >= 75) {
    safetyStatus = "warning";
    badgeText = "Waspada Mendekati Limit";
    badgeIcon = "alert-circle";
  }

  return {
    grandTotal,
    totalSavings,
    activeItemsCount,
    remaining,
    percentage,
    safetyStatus,
    badgeText,
    badgeIcon
  };
}

// =============================================================================
// 5. UI RENDERING & DOM UPDATES
// =============================================================================

// Offline SVG Icons Map (Ensures icons render 100% reliably even offline in supermarket basements)
const SVG_ICONS = {
  "shopping-cart": `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  "shopping-basket": `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.6-7.4"/><path d="m4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg>`,
  "wallet": `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  "history": `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,
  "shield-check": `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  "check-circle": `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  "alert-triangle": `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  "alert-circle": `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  "plus": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  "trash-2": `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  "tag": `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><circle cx="7" cy="7" r=".5" fill="currentColor"/></svg>`,
  "scale": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
  "receipt": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-8"/><path d="M16 12h-8"/><path d="M10 16h-2"/></svg>`,
  "receipt-text": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>`,
  "database": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
  "sparkles": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  "volume-2": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  "volume-x": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`,
  "x": `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  "download": `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  "badge-percent": `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="15" y1="9" x2="9" y2="15"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/></svg>`
};

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
      return;
    } catch (e) {
      console.warn("Lucide CDN error, using fallback SVGs", e);
    }
  }

  // Fallback to inline SVGs
  document.querySelectorAll("[data-lucide]").forEach((el) => {
    const iconName = el.getAttribute("data-lucide");
    if (SVG_ICONS[iconName]) {
      el.innerHTML = SVG_ICONS[iconName];
    }
  });
}

function renderAll() {
  renderCart();
  renderSafetyCap();
  renderHistory();
  renderPriceDatabase();
  renderStandaloneCalculators();
  renderIcons();
}

// Render Safety Cap Card (F-05)
function renderSafetyCap() {
  const totals = computeCartTotals();
  const card = document.getElementById("safetyCapCard");
  const badge = document.getElementById("safetyBadge");
  const totalSpendEl = document.getElementById("displayTotalSpend");
  const budgetLimitEl = document.getElementById("displayBudgetLimit");
  const progressBar = document.getElementById("safetyProgressBar");
  const remainingEl = document.getElementById("displayRemainingBudget");
  const emergencyAlert = document.getElementById("emergencyAlert");

  card.className = `safety-cap-card status-${totals.safetyStatus}`;
  badge.className = `safety-badge ${totals.safetyStatus}`;
  badge.innerHTML = `<i data-lucide="${totals.badgeIcon}" style="width:12px;height:12px;"></i> ${totals.badgeText}`;

  totalSpendEl.textContent = formatRupiah(totals.grandTotal);
  budgetLimitEl.textContent = formatRupiah(state.budgetLimit);

  progressBar.className = `safety-progress-bar ${totals.safetyStatus}`;
  progressBar.style.width = `${Math.min(100, (totals.grandTotal / state.budgetLimit) * 100)}%`;

  if (totals.remaining >= 0) {
    remainingEl.className = "sisa-uang";
    remainingEl.innerHTML = `Sisa Uang Saku: <strong>${formatRupiah(totals.remaining)}</strong> (${100 - totals.percentage}% aman)`;
  } else {
    remainingEl.className = "sisa-uang minus";
    remainingEl.innerHTML = `Defisit Uang Saku: <strong>-${formatRupiah(Math.abs(totals.remaining))}</strong>!`;
  }

  // Emergency Cashier Panic Alert
  if (totals.grandTotal > state.budgetLimit) {
    emergencyAlert.classList.add("show");
  } else {
    emergencyAlert.classList.remove("show");
  }

  // Sticky Bar & Badges
  document.getElementById("barTotalDisplay").textContent = formatRupiah(totals.grandTotal);
  const cartBadge = document.getElementById("navCartBadge");
  if (state.cart.length > 0) {
    cartBadge.style.display = "inline-block";
    cartBadge.textContent = state.cart.length;
  } else {
    cartBadge.style.display = "none";
  }
}

// Render Cart Items List (F-01, F-02, F-04)
function renderCart() {
  const listEl = document.getElementById("cartItemsList");
  const emptyState = document.getElementById("cartEmptyState");
  const floatingBar = document.getElementById("cartFloatingBar");
  const counterEl = document.getElementById("cartItemCounter");

  // Filter items
  const filtered = state.cart.filter((item) => {
    if (state.activeCategory === "ALL") return true;
    return item.category === state.activeCategory;
  });

  counterEl.textContent = `(${state.cart.length} barang)`;

  if (state.cart.length === 0) {
    listEl.innerHTML = "";
    emptyState.style.display = "block";
    floatingBar.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  floatingBar.style.display = "flex";

  listEl.innerHTML = filtered.map((item) => {
    const calc = calculateItemPricing(item);
    const comparison = getPriceComparison(item.name, item.unitPrice);

    return `
      <div class="cart-item-card ${item.isDeferred ? 'is-deferred' : ''}" data-id="${item.id}">
        <div class="item-top-row">
          <div class="item-title-col">
            <span class="item-category-tag">${escapeHTML(item.category)}</span>
            <div class="item-name">${escapeHTML(item.name)}</div>
            
            <!-- Realtime Price Fluctuation Indicator (F-04) -->
            <div class="fluctuation-badge ${comparison.className}">
              <span>${comparison.arrow}</span>
              <span>${comparison.text}</span>
            </div>
          </div>
          
          <button class="item-delete-btn" onclick="removeItem('${item.id}')" title="Hapus dari troli">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>

        <div class="item-pricing-row">
          <div class="unit-price-text">
            <span>${formatRupiah(item.unitPrice)} / ${item.unit}</span>
            ${calc.discountLabel ? `<span class="discount-tag-pill"><i data-lucide="tag" style="width:10px;height:10px;"></i> ${calc.discountLabel}</span>` : ''}
          </div>
          
          <button onclick="toggleDeferItem('${item.id}')" style="background:none; border:none; font-size:11px; font-weight:700; color:${item.isDeferred ? 'var(--primary)' : 'var(--text-light)'}; cursor:pointer;">
            ${item.isDeferred ? '↩ Masukkan Lagi' : '⏸ Tunda Beli'}
          </button>
        </div>

        <div class="item-action-row">
          <!-- Large Numeric Stepper (F-02 Ergonomics) -->
          <div class="quantity-stepper">
            <button class="stepper-btn" onclick="updateItemQty('${item.id}', -1)" aria-label="Kurangi Qty">-</button>
            <span class="stepper-value" onclick="promptDirectQty('${item.id}')">${item.qty}</span>
            <button class="stepper-btn" onclick="updateItemQty('${item.id}', 1)" aria-label="Tambah Qty">+</button>
          </div>

          <!-- Line Item Total -->
          <div class="item-line-total">
            <div class="line-total-label">Subtotal</div>
            ${calc.totalSavings > 0 ? `<span class="line-total-strike">${formatRupiah(calc.lineBaseTotal)}</span>` : ''}
            <span class="line-total-amount">${formatRupiah(calc.lineTotal)}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Render Receipts History Tab (F-06)
function renderHistory() {
  const container = document.getElementById("historyTripsContainer");
  if (!container) return;

  if (state.historyTrips.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">
        Belum ada riwayat struk belanja. Selesaikan belanjaan di troli untuk mencatat struk pertama!
      </div>
    `;
    return;
  }

  container.innerHTML = state.historyTrips.map((trip) => {
    return `
      <div class="history-trip-card" onclick="viewTripDetail('${trip.id}')">
        <div class="history-trip-top">
          <span class="history-date">📅 ${trip.date} • ${escapeHTML(trip.store)}</span>
          <span class="history-total">${formatRupiah(trip.total)}</span>
        </div>
        <div class="history-meta">
          <span>${trip.itemsCount} jenis kebutuhan</span>
          <span style="color: var(--primary); font-weight:700;">Hemat: ${formatRupiah(trip.savings || 0)}</span>
        </div>
      </div>
    `;
  }).join("");
}

// Render Price Database Catalog (F-06 Benchmark)
function renderPriceDatabase() {
  const container = document.getElementById("priceDatabaseContainer");
  const query = (document.getElementById("dbSearchInput")?.value || "").toLowerCase().trim();
  if (!container) return;

  const keys = Object.keys(state.benchmarkDB).filter((key) => {
    if (!query) return true;
    return key.includes(query) || state.benchmarkDB[key].category.toLowerCase().includes(query);
  });

  if (keys.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:16px; color:var(--text-muted); font-size:12px;">
        Barang tidak ditemukan di acuan harga.
      </div>
    `;
    return;
  }

  container.innerHTML = keys.map((key) => {
    const item = state.benchmarkDB[key];
    return `
      <div class="db-item-row">
        <div>
          <div class="db-item-name">${escapeHTML(item.name)}</div>
          <div class="db-item-cat">${escapeHTML(item.category)} • Satuan: ${item.unit}</div>
        </div>
        <div>
          <div class="db-item-price">${formatRupiah(item.lastPrice)}</div>
          <div style="font-size: 10px; color: var(--text-muted); text-align: right;">Bulan lalu</div>
        </div>
      </div>
    `;
  }).join("");
}

// Standalone Promo & Unit Price Comparison (Tools Tab)
function renderStandaloneCalculators() {
  // 1. Tiered Discount Calculator Live Math (F-03)
  const basePrice = Number(document.getElementById("calcBasePrice")?.value) || 0;
  const d1 = Number(document.getElementById("calcDisc1")?.value) || 0;
  const d2 = Number(document.getElementById("calcDisc2")?.value) || 0;
  const breakdownEl = document.getElementById("calcBreakdownResult");

  if (breakdownEl) {
    const step1Cut = basePrice * (d1 / 100);
    const step1Price = basePrice - step1Cut;
    const step2Cut = step1Price * (d2 / 100);
    const finalPrice = step1Price - step2Cut;
    const totalHemat = basePrice - finalPrice;
    const effectivePercent = basePrice > 0 ? ((totalHemat / basePrice) * 100).toFixed(1) : 0;

    breakdownEl.innerHTML = `
      <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Hasil Perhitungan Diskon ${d1}% + ${d2}%:</div>
      <div>1. Diskon pertama (${d1}%): <span style="color:var(--danger);">- ${formatRupiah(step1Cut)}</span> → Sisa ${formatRupiah(step1Price)}</div>
      <div>2. Diskon kedua (${d2}% dari sisa): <span style="color:var(--danger);">- ${formatRupiah(step2Cut)}</span></div>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-weight: 800; font-size: 14px; color: var(--primary);">
        Harga Akhir: ${formatRupiah(finalPrice)}
      </div>
      <div style="font-size: 11px; color: #b45309; margin-top: 2px;">
        💡 Total Hemat ${formatRupiah(totalHemat)} (Diskon real <strong>${effectivePercent}%</strong>, BUKAN ${d1 + d2}%!)
      </div>
    `;
  }

  // 2. Unit Price Comparison Math (3x1L vs 5L)
  const qtyA = Number(document.getElementById("optA_qty")?.value) || 1;
  const priceA = Number(document.getElementById("optA_price")?.value) || 0;
  const qtyB = Number(document.getElementById("optB_qty")?.value) || 1;
  const priceB = Number(document.getElementById("optB_price")?.value) || 0;

  const unitA = priceA / qtyA;
  const unitB = priceB / qtyB;

  const unitA_el = document.getElementById("optA_unitPrice");
  const unitB_el = document.getElementById("optB_unitPrice");
  const boxA = document.getElementById("boxOptA");
  const boxB = document.getElementById("boxOptB");
  const verdictBanner = document.getElementById("verdictBanner");

  if (unitA_el && unitB_el && verdictBanner) {
    unitA_el.textContent = `${formatRupiah(unitA)} / unit`;
    unitB_el.textContent = `${formatRupiah(unitB)} / unit`;

    if (unitA < unitB) {
      boxA.className = "comparison-box winner";
      boxB.className = "comparison-box";
      const diffUnit = unitB - unitA;
      verdictBanner.innerHTML = `
        <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
        <span>Pilihan A lebih hemat <strong>${formatRupiah(diffUnit)}/unit</strong>! Lebih murah beli kemasan kecil/ecer ini.</span>
      `;
    } else if (unitB < unitA) {
      boxB.className = "comparison-box winner";
      boxA.className = "comparison-box";
      const diffUnit = unitA - unitB;
      verdictBanner.innerHTML = `
        <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
        <span>Pilihan B lebih hemat <strong>${formatRupiah(diffUnit)}/unit</strong>! Lebih hemat borong kemasan besar/jerigen ini.</span>
      `;
    } else {
      boxA.className = "comparison-box";
      boxB.className = "comparison-box";
      verdictBanner.innerHTML = `
        <i data-lucide="info" style="width: 16px; height: 16px;"></i>
        <span>Harga per unit kedua pilihan sama persis (${formatRupiah(unitA)}/unit).</span>
      `;
    }
  }
}

// =============================================================================
// 6. CART ACTIONS & STEPPERS (F-02 Realtime Ergonomics)
// =============================================================================

function updateItemQty(itemId, delta) {
  const item = state.cart.find((i) => i.id === itemId);
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeItem(itemId);
  } else {
    item.qty = newQty;
    playTapSound("click");
    saveState();
    renderAll();
  }
}

function promptDirectQty(itemId) {
  const item = state.cart.find((i) => i.id === itemId);
  if (!item) return;
  const input = prompt(`Masukkan jumlah untuk ${item.name}:`, item.qty);
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val > 0) {
      item.qty = val;
      playTapSound("click");
      saveState();
      renderAll();
    }
  }
}

function removeItem(itemId) {
  state.cart = state.cart.filter((i) => i.id !== itemId);
  playTapSound("click");
  saveState();
  renderAll();
  showToast("Barang dikeluarkan dari troli");
}

function toggleDeferItem(itemId) {
  const item = state.cart.find((i) => i.id === itemId);
  if (!item) return;
  item.isDeferred = !item.isDeferred;
  playTapSound("click");
  saveState();
  renderAll();
  showToast(item.isDeferred ? "Barang ditunda sementara" : "Barang dimasukkan kembali");
}

// Emergency auto-trim: Find deferred or non-staple items to bring under budget
function autoTrimCart() {
  const totals = computeCartTotals();
  if (totals.grandTotal <= state.budgetLimit) {
    showToast("Budget troli sudah aman!");
    return;
  }

  // Defer non-staples first (Lainnya, Makanan Instan) or highest price
  const nonStaples = state.cart.filter((i) => !i.isDeferred && (i.category === "Lainnya" || i.category === "Makanan Instan"));
  if (nonStaples.length > 0) {
    nonStaples[0].isDeferred = true;
    showToast(`Ditunda sementara: ${nonStaples[0].name} agar tidak boncos di kasir`);
  } else {
    // Defer the most expensive item
    const sorted = [...state.cart].filter(i => !i.isDeferred).sort((a, b) => (b.unitPrice * b.qty) - (a.unitPrice * a.qty));
    if (sorted.length > 0) {
      sorted[0].isDeferred = true;
      showToast(`Ditunda sementara: ${sorted[0].name} untuk mengamankan sisa uang saku`);
    }
  }
  playTapSound("warning");
  saveState();
  renderAll();
}

// =============================================================================
// 7. ADD / EDIT ITEM BOTTOM SHEET MODAL (F-01, F-03, F-04)
// =============================================================================

const modalOverlay = document.getElementById("itemModalOverlay");
const itemForm = document.getElementById("itemForm");
const inputName = document.getElementById("inputItemName");
const selectCategory = document.getElementById("selectItemCategory");
const selectUnit = document.getElementById("selectItemUnit");
const inputQty = document.getElementById("inputItemQty");
const inputPrice = document.getElementById("inputItemPrice");
const checkDiscount = document.getElementById("checkHasDiscount");
const discountBox = document.getElementById("discountInputsContainer");
const pricePreviewBanner = document.getElementById("pricePreviewBanner");
const modalSubtotalPreview = document.getElementById("modalSubtotalPreview");
const modalDiscountPreview = document.getElementById("modalDiscountPreview");

function openAddItemModal(prefillData = null) {
  itemForm.reset();
  document.getElementById("editItemId").value = "";
  document.getElementById("modalTitle").textContent = "Tambah Barang ke Troli";
  document.getElementById("btnSubmitItem").textContent = "Masukkan ke Troli";
  
  state.currentDiscType = "tiered";
  updateDiscountTabsUI();
  checkDiscount.checked = false;
  discountBox.classList.remove("active");
  pricePreviewBanner.classList.remove("show");

  if (prefillData) {
    inputName.value = prefillData.name || "";
    selectCategory.value = prefillData.category || "Beras & Pokok";
    selectUnit.value = prefillData.unit || "kg";
    inputQty.value = prefillData.qty || 1;
    inputPrice.value = prefillData.unitPrice || "";
  }

  updateModalLiveCalculation();
  modalOverlay.classList.add("active");
  playTapSound("click");
}

function closeAddItemModal() {
  modalOverlay.classList.remove("active");
}

function updateModalLiveCalculation() {
  const name = inputName.value.trim();
  const basePrice = Number(inputPrice.value) || 0;
  const qty = Number(inputQty.value) || 1;

  // 1. Live Price Fluctuation Check vs Last Month (F-04)
  if (name.length >= 3) {
    const comp = getPriceComparison(name, basePrice);
    pricePreviewBanner.className = `price-preview-banner show ${comp.className}`;
    pricePreviewBanner.innerHTML = `<strong>${comp.arrow} Evaluasi Harga Rak:</strong> ${comp.text}`;
  } else {
    pricePreviewBanner.className = "price-preview-banner";
  }

  // 2. Live Tiered Discount Breakdown (F-03)
  let finalPrice = basePrice;
  let savings = 0;
  let desc = "";

  if (checkDiscount.checked) {
    discountBox.classList.add("active");
    if (state.currentDiscType === "tiered") {
      const d1 = Number(document.getElementById("inputDisc1")?.value) || 0;
      const d2 = Number(document.getElementById("inputDisc2")?.value) || 0;
      const p1 = basePrice * (1 - d1 / 100);
      const p2 = p1 * (1 - d2 / 100);
      finalPrice = p2;
      savings = basePrice - finalPrice;
      const effective = basePrice > 0 ? ((savings / basePrice) * 100).toFixed(1) : 0;
      desc = `Diskon bertingkat (${d1}% + ${d2}%): Hemat ${formatRupiah(savings)} / unit (Efektif ${effective}%).`;
    } else if (state.currentDiscType === "percent") {
      const p = Number(document.getElementById("inputSinglePercent")?.value) || 0;
      finalPrice = basePrice * (1 - p / 100);
      savings = basePrice - finalPrice;
      desc = `Diskon ${p}%: Hemat ${formatRupiah(savings)} / unit.`;
    } else if (state.currentDiscType === "flat") {
      const flat = Number(document.getElementById("inputFlatAmount")?.value) || 0;
      savings = Math.min(basePrice, flat);
      finalPrice = Math.max(0, basePrice - flat);
      desc = `Potongan langsung: Hemat ${formatRupiah(savings)} / unit.`;
    }
  } else {
    discountBox.classList.remove("active");
    desc = "Tidak ada promo diskon.";
  }

  modalDiscountPreview.textContent = desc;
  const total = finalPrice * qty;
  modalSubtotalPreview.textContent = formatRupiah(total);
}

function updateDiscountTabsUI() {
  document.querySelectorAll(".disc-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.disctype === state.currentDiscType);
  });
  document.getElementById("fieldTiered").style.display = state.currentDiscType === "tiered" ? "block" : "none";
  document.getElementById("fieldPercent").style.display = state.currentDiscType === "percent" ? "block" : "none";
  document.getElementById("fieldFlat").style.display = state.currentDiscType === "flat" ? "block" : "none";
}

// Handle Form Submission (Save to Cart)
itemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = inputName.value.trim();
  const category = selectCategory.value;
  const unit = selectUnit.value;
  const qty = Number(inputQty.value) || 1;
  const unitPrice = Number(inputPrice.value) || 0;

  if (!name || unitPrice <= 0) {
    alert("Harap masukkan nama produk dan harga satuan yang valid.");
    return;
  }

  let discount = { type: "none" };
  if (checkDiscount.checked) {
    if (state.currentDiscType === "tiered") {
      discount = {
        type: "tiered",
        disc1: Number(document.getElementById("inputDisc1").value) || 0,
        disc2: Number(document.getElementById("inputDisc2").value) || 0
      };
    } else if (state.currentDiscType === "percent") {
      discount = {
        type: "percent",
        percent: Number(document.getElementById("inputSinglePercent").value) || 0
      };
    } else if (state.currentDiscType === "flat") {
      discount = {
        type: "flat",
        flatAmount: Number(document.getElementById("inputFlatAmount").value) || 0
      };
    }
  }

  const newItem = {
    id: "item-" + Date.now(),
    name,
    category,
    unit,
    qty,
    unitPrice,
    discount,
    isDeferred: false
  };

  state.cart.push(newItem);
  playTapSound("success");
  saveState();
  closeAddItemModal();
  renderAll();
  showToast(`"${name}" masuk ke troli!`);
});

// =============================================================================
// 8. CHECKOUT & RECORDING STRUK HISTORY (F-06)
// =============================================================================
const checkoutModal = document.getElementById("checkoutModalOverlay");

function openCheckoutModal() {
  if (state.cart.length === 0) {
    alert("Troli masih kosong! Tambahkan barang terlebih dahulu.");
    return;
  }
  const totals = computeCartTotals();
  document.getElementById("chkItemCount").textContent = `${totals.activeItemsCount} unit (${state.cart.filter(i=>!i.isDeferred).length} macam)`;
  document.getElementById("chkTotalSavings").textContent = formatRupiah(totals.totalSavings);
  document.getElementById("chkGrandTotal").textContent = formatRupiah(totals.grandTotal);
  checkoutModal.classList.add("active");
  playTapSound("click");
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("active");
}

document.getElementById("btnConfirmSaveReceipt")?.addEventListener("click", () => {
  const store = document.getElementById("inputStoreName")?.value || "Superindo";
  const totals = computeCartTotals();
  const dateStr = new Date().toISOString().split("T")[0];

  // 1. Build receipt
  const receiptItems = state.cart.filter(i => !i.isDeferred).map(i => {
    const calc = calculateItemPricing(i);
    return {
      name: i.name,
      category: i.category,
      unit: i.unit,
      qty: i.qty,
      unitPrice: i.unitPrice,
      finalPrice: calc.finalUnitPrice
    };
  });

  const newTrip = {
    id: "trip-" + Date.now(),
    date: dateStr,
    store,
    total: totals.grandTotal,
    savings: totals.totalSavings,
    itemsCount: receiptItems.length,
    items: receiptItems
  };

  // 2. Update benchmark database with current trip prices for future comparisons!
  receiptItems.forEach((item) => {
    const key = item.name.trim().toLowerCase();
    if (!state.benchmarkDB[key]) {
      state.benchmarkDB[key] = {
        name: item.name,
        category: item.category,
        unit: item.unit,
        lastPrice: item.finalPrice,
        recordedDate: dateStr,
        history: [{ date: dateStr, price: item.finalPrice }]
      };
    } else {
      state.benchmarkDB[key].lastPrice = item.finalPrice;
      state.benchmarkDB[key].recordedDate = dateStr;
      state.benchmarkDB[key].history.push({ date: dateStr, price: item.finalPrice });
    }
  });

  state.historyTrips.unshift(newTrip);
  state.cart = []; // Empty cart after checkout

  // Sync completed receipt to Firebase
  if (window.FirebaseSync && window.FirebaseSync.isReady()) {
    window.FirebaseSync.saveHistoryTrip(newTrip);
  }

  playTapSound("success");
  saveState();
  closeCheckoutModal();
  renderAll();
  showToast("Struk belanja berhasil disimpan & acuan harga diperbarui!");
});

// View past trip detail
function viewTripDetail(tripId) {
  const trip = state.historyTrips.find((t) => t.id === tripId);
  if (!trip) return;

  const itemsList = trip.items
    ? trip.items.map((i) => `• ${i.name} (${i.qty}x) = ${formatRupiah(i.finalPrice * i.qty)}`).join("\n")
    : "Data item tidak tersedia";

  alert(`🧾 Struk Digital: ${trip.store}\nTanggal: ${trip.date}\nTotal Belanja: ${formatRupiah(trip.total)}\nHemat Promo: ${formatRupiah(trip.savings || 0)}\n\nDaftar Belanjaan:\n${itemsList}`);
}

// =============================================================================
// 9. EVENT LISTENERS & SETUP
// =============================================================================

function setupEvents() {
  // Navigation Tabs Switching
  document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-view").forEach((view) => view.classList.remove("active"));

      btn.classList.add("active");
      const targetView = document.getElementById(btn.dataset.tab);
      if (targetView) targetView.classList.add("active");
      playTapSound("click");
    });
  });

  // Category Filter Chips
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.activeCategory = chip.dataset.category;
      playTapSound("click");
      renderCart();
      if (window.lucide) window.lucide.createIcons();
    });
  });

  // Modal open/close
  document.getElementById("btnOpenAddModal")?.addEventListener("click", () => openAddItemModal());
  document.getElementById("btnCloseItemModal")?.addEventListener("click", closeAddItemModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeAddItemModal();
  });

  document.getElementById("btnFinishTrip")?.addEventListener("click", openCheckoutModal);
  document.getElementById("btnCloseCheckoutModal")?.addEventListener("click", closeCheckoutModal);
  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) closeCheckoutModal();
  });

  // Sound Toggle
  document.getElementById("btnSoundToggle")?.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    const icon = document.getElementById("soundIcon");
    if (state.soundEnabled) {
      icon.setAttribute("data-lucide", "volume-2");
      showToast("Suara sentuhan aktif");
      playTapSound("click");
    } else {
      icon.setAttribute("data-lucide", "volume-x");
      showToast("Suara dinonaktifkan");
    }
    renderIcons();
  });

  // Fast preset chips in modal
  document.querySelectorAll("#fastChipsBar .preset-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parts = btn.dataset.preset.split("|");
      inputName.value = parts[0];
      selectCategory.value = parts[1];
      selectUnit.value = parts[2];
      inputQty.value = parts[3];
      inputPrice.value = parts[4];
      updateModalLiveCalculation();
      playTapSound("click");
    });
  });

  // Modal inputs change live updates
  [inputName, inputPrice, inputQty, checkDiscount].forEach((el) => {
    el?.addEventListener("input", updateModalLiveCalculation);
  });

  checkDiscount?.addEventListener("change", updateModalLiveCalculation);

  // Discount type selector in modal
  document.querySelectorAll(".disc-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentDiscType = btn.dataset.disctype;
      updateDiscountTabsUI();
      updateModalLiveCalculation();
      playTapSound("click");
    });
  });

  ["inputDisc1", "inputDisc2", "inputSinglePercent", "inputFlatAmount"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", updateModalLiveCalculation);
  });

  // Quick Demo Button
  document.getElementById("btnQuickDemo")?.addEventListener("click", () => {
    state.cart = JSON.parse(JSON.stringify(INITIAL_DEMO_CART));
    saveState();
    renderAll();
    showToast("Belanjaan kos Rian berhasil dimuat!");
    playTapSound("success");
  });

  document.getElementById("btnSeedInitial")?.addEventListener("click", () => {
    state.cart = JSON.parse(JSON.stringify(INITIAL_DEMO_CART));
    saveState();
    renderAll();
    showToast("Belanjaan kos Rian siap di troli!");
    playTapSound("success");
  });

  // Clear Cart
  document.getElementById("btnClearCart")?.addEventListener("click", () => {
    if (confirm("Kosongkan troli belanjaan saat ini?")) {
      state.cart = [];
      saveState();
      renderAll();
      showToast("Troli telah dikosongkan");
    }
  });

  // Cashier emergency auto-trim
  document.getElementById("btnAutoTrimCart")?.addEventListener("click", autoTrimCart);

  // Standalone Calculators live bindings
  ["calcBasePrice", "calcDisc1", "calcDisc2"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderStandaloneCalculators);
  });

  ["optA_qty", "optA_price", "optB_qty", "optB_price"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderStandaloneCalculators);
  });

  // Search in Price DB
  document.getElementById("dbSearchInput")?.addEventListener("input", () => {
    renderPriceDatabase();
    renderIcons();
  });

  // Budget allowance save
  document.getElementById("btnSaveBudgetSetting")?.addEventListener("click", () => {
    const val = Number(document.getElementById("inputAllowanceAmount").value);
    if (val > 0) {
      state.budgetLimit = val;
      saveState();
      renderAll();
      showToast(`Limit uang saku disimpan: ${formatRupiah(val)}`);
      playTapSound("success");
    }
  });

  document.getElementById("btnEditLimit")?.addEventListener("click", () => {
    // Switch to Budget tab
    document.querySelector('.nav-tab-btn[data-tab="tabBudget"]')?.click();
  });

  // Reset all
  document.getElementById("btnResetAll")?.addEventListener("click", () => {
    if (confirm("Reset ulang semua data ke default pabrik?")) {
      localStorage.clear();
      loadState();
      renderAll();
      showToast("Data berhasil direset ulang");
    }
  });

  // Export JSON
  document.getElementById("btnExportData")?.addEventListener("click", () => {
    const exportObj = {
      budgetLimit: state.budgetLimit,
      cart: state.cart,
      benchmarkDB: state.benchmarkDB,
      historyTrips: state.historyTrips
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SmartBelanja-Backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("File backup berhasil diunduh!");
  });
}

function setAllowancePreset(amount) {
  document.getElementById("inputAllowanceAmount").value = amount;
  state.budgetLimit = amount;
  saveState();
  renderAll();
  showToast(`Limit diset ke ${formatRupiah(amount)}`);
  playTapSound("click");
}

function showToast(msg) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast.timeoutId);
  toast.timeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// PWA Service Worker Registration & Install Prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('Service Worker registered with scope:', reg.scope);
    }).catch((err) => {
      console.log('Service Worker registration failed:', err);
    });
  });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('pwaBanner');
  if (banner) banner.style.display = 'flex';
});

document.getElementById('btnInstallPwa')?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    deferredPrompt = null;
    document.getElementById('pwaBanner').style.display = 'none';
  } else {
    alert("Untuk memasang di HP: buka menu browser (titik 3 atau ikon Share) lalu pilih 'Tambahkan ke Layar Utama' / 'Install App'.");
  }
});

// =============================================================================
// 10. FIREBASE CLOUD INTEGRATION & REALTIME HYDRATION
// =============================================================================

function updateCloudStatusUI(status, detail = "") {
  const badge = document.getElementById("cloudStatusBadge");
  const text = document.getElementById("cloudStatusText");
  if (!badge || !text) return;

  badge.className = `cloud-status-pill status-${status}`;
  if (status === "synced") {
    text.textContent = "Cloud Aktif";
    badge.title = `Firebase Firestore: ${detail || "Tersambung & Tersinkron"}`;
  } else if (status === "syncing") {
    text.textContent = "Menyimpan...";
    badge.title = detail || "Menyinkronkan perubahan ke cloud...";
  } else if (status === "offline") {
    text.textContent = "Offline";
    badge.title = `Mode Offline: ${detail || "Data tetap aman di penyimpanan lokal HP"}`;
  } else if (status === "connecting") {
    text.textContent = "Menghubungkan";
    badge.title = "Menghubungkan ke Firebase...";
  }
}

async function initFirebaseSync() {
  if (!window.FirebaseSync) return;

  // Listen to connection / sync status changes
  window.FirebaseSync.onStatusChange((status, detail) => {
    updateCloudStatusUI(status, detail);
  });

  // Tap status pill to manually force sync or show info
  document.getElementById("cloudStatusBadge")?.addEventListener("click", async () => {
    playTapSound("click");
    showToast("Menyinkronkan data dengan Firebase Cloud...");
    saveState();
    const cloudData = await window.FirebaseSync.loadAllCloudData();
    if (cloudData) {
      if (cloudData.budgetLimit) state.budgetLimit = cloudData.budgetLimit;
      if (cloudData.cart) state.cart = cloudData.cart;
      if (cloudData.benchmarkDB) state.benchmarkDB = cloudData.benchmarkDB;
      if (cloudData.historyTrips) state.historyTrips = cloudData.historyTrips;
      saveState(true);
      renderAll();
      showToast("Sinkronisasi cloud berhasil!");
    } else {
      showToast("Data tersimpan aman di HP (Offline/Local)");
    }
  });

  // Initial cloud hydration
  try {
    const cloud = await window.FirebaseSync.loadAllCloudData();
    if (cloud) {
      let hasChanges = false;
      if (cloud.budgetLimit && cloud.budgetLimit !== state.budgetLimit) {
        state.budgetLimit = cloud.budgetLimit;
        hasChanges = true;
      }
      if (Array.isArray(cloud.cart) && cloud.cart.length > 0) {
        state.cart = cloud.cart;
        hasChanges = true;
      }
      if (cloud.benchmarkDB && Object.keys(cloud.benchmarkDB).length > 0) {
        state.benchmarkDB = Object.assign({}, state.benchmarkDB, cloud.benchmarkDB);
        hasChanges = true;
      }
      if (Array.isArray(cloud.historyTrips) && cloud.historyTrips.length > 0) {
        state.historyTrips = cloud.historyTrips;
        hasChanges = true;
      }

      if (hasChanges) {
        saveState(true); // save to localStorage without redundant cloud write
        renderAll();
        showToast("Data cloud Firebase berhasil disinkronkan!");
      }
    }

    // Subscribe to multi-device real-time updates
    window.FirebaseSync.subscribeToCloudUpdates((field, data) => {
      if (field === "cart" && Array.isArray(data)) {
        state.cart = data;
        saveState(true);
        renderCart();
        renderSafetyCap();
      } else if (field === "budgetLimit" && typeof data === "number") {
        state.budgetLimit = data;
        saveState(true);
        renderSafetyCap();
      }
    });
  } catch (err) {
    console.warn("Initial Firebase sync notice:", err);
  }
}

// App Startup
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupEvents();
  renderAll();

  // Initialize Firebase integration if module is already ready
  if (window.FirebaseSync) {
    initFirebaseSync();
  } else {
    window.addEventListener("firebase-ready", () => {
      initFirebaseSync();
    });
  }
});
