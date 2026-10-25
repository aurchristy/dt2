// =============================================================================
// Firebase Service for SmartBelanja Kos
// Using Modular Firebase JS SDK v13.1.0 with Cloud Firestore
// =============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC22miYpoBcKToQAUa9ZEr-jqhn-7T2W24",
  authDomain: "myshoppingtrackerdt2.firebaseapp.com",
  projectId: "myshoppingtrackerdt2",
  storageBucket: "myshoppingtrackerdt2.firebasestorage.app",
  messagingSenderId: "928324131512",
  appId: "1:928324131512:web:b2600896cb6e6cc5ce324d"
};

let db = null;
let isInitialized = false;
let syncStatus = "connecting"; // "connecting", "synced", "syncing", "offline", "error"

// Listeners to notify UI on status changes
const statusListeners = [];
function notifyStatus(newStatus, detail = "") {
  syncStatus = newStatus;
  statusListeners.forEach((fn) => fn(newStatus, detail));
}

// 1. Initialize Firebase App & Firestore
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  // Enable offline IndexedDb persistence so it works in supermarket basements
  enableIndexedDbPersistence(db).then(() => {
    console.log("Firebase Firestore offline persistence enabled!");
  }).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence failed: Multiple tabs open.");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence not supported in this browser.");
    }
  });

  isInitialized = true;
  notifyStatus("synced", "Tersambung ke Firebase");
  console.log("Firebase initialized successfully for projectId:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  notifyStatus("error", error.message);
}

// Firebase Cloud Sync API object attached to window for app.js
window.FirebaseSync = {
  isReady: () => isInitialized && db !== null,
  getStatus: () => syncStatus,
  onStatusChange: (callback) => {
    statusListeners.push(callback);
    callback(syncStatus);
  },

  // Save / Sync Budget Limit to Firestore
  async saveBudgetLimit(limit) {
    if (!this.isReady()) return;
    notifyStatus("syncing", "Menyimpan limit...");
    try {
      const docRef = doc(db, "app_data", "budget_settings");
      await setDoc(docRef, {
        budgetLimit: Number(limit),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      notifyStatus("synced", "Limit tersimpan");
    } catch (err) {
      console.warn("Firestore saveBudgetLimit warning:", err);
      notifyStatus("offline", "Tersimpan lokal (Offline/Rules)");
    }
  },

  // Save / Sync Active Cart to Firestore
  async saveCart(cartItems) {
    if (!this.isReady()) return;
    notifyStatus("syncing", "Menyimpan troli...");
    try {
      const docRef = doc(db, "app_data", "active_cart");
      await setDoc(docRef, {
        items: cartItems,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      notifyStatus("synced", "Troli cloud tersinkron");
    } catch (err) {
      console.warn("Firestore saveCart warning:", err);
      notifyStatus("offline", "Tersimpan lokal (Offline/Rules)");
    }
  },

  // Save / Sync Price Benchmark Database to Firestore
  async saveBenchmarkDB(benchmarkDB) {
    if (!this.isReady()) return;
    notifyStatus("syncing", "Menyimpan acuan harga...");
    try {
      const docRef = doc(db, "app_data", "price_benchmarks");
      await setDoc(docRef, {
        catalog: benchmarkDB,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      notifyStatus("synced", "Acuan harga cloud tersinkron");
    } catch (err) {
      console.warn("Firestore saveBenchmarkDB warning:", err);
      notifyStatus("offline", "Tersimpan lokal (Offline/Rules)");
    }
  },

  // Save Completed Receipt / Shopping Trip
  async saveHistoryTrip(trip) {
    if (!this.isReady()) return;
    notifyStatus("syncing", "Menyimpan struk digital...");
    try {
      const docRef = doc(db, "history_trips", trip.id);
      await setDoc(docRef, {
        ...trip,
        createdAt: new Date().toISOString()
      });
      notifyStatus("synced", "Struk tersimpan di cloud");
    } catch (err) {
      console.warn("Firestore saveHistoryTrip warning:", err);
      notifyStatus("offline", "Tersimpan lokal (Offline/Rules)");
    }
  },

  // Fetch all Initial Data from Firestore (Cloud-first hydration with Local fallback)
  async loadAllCloudData() {
    if (!this.isReady()) return null;
    notifyStatus("syncing", "Mengambil data cloud...");
    try {
      // 1. Budget
      const budgetDoc = await getDoc(doc(db, "app_data", "budget_settings"));
      let budgetLimit = null;
      if (budgetDoc.exists()) {
        budgetLimit = budgetDoc.data().budgetLimit;
      }

      // 2. Active Cart
      const cartDoc = await getDoc(doc(db, "app_data", "active_cart"));
      let cart = null;
      if (cartDoc.exists() && Array.isArray(cartDoc.data().items)) {
        cart = cartDoc.data().items;
      }

      // 3. Price Benchmarks
      const benchDoc = await getDoc(doc(db, "app_data", "price_benchmarks"));
      let benchmarkDB = null;
      if (benchDoc.exists() && benchDoc.data().catalog) {
        benchmarkDB = benchDoc.data().catalog;
      }

      // 4. History Trips
      let historyTrips = null;
      const historySnap = await getDocs(collection(db, "history_trips"));
      if (!historySnap.empty) {
        historyTrips = [];
        historySnap.forEach((d) => {
          historyTrips.push(d.data());
        });
        historyTrips.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      }

      notifyStatus("synced", "Sinkronisasi cloud selesai");
      return {
        budgetLimit,
        cart,
        benchmarkDB,
        historyTrips
      };
    } catch (err) {
      console.warn("Firestore loadAllCloudData warning (using local data):", err);
      notifyStatus("offline", "Menggunakan data lokal");
      return null;
    }
  },

  // Setup real-time listener for multi-device synchronization
  subscribeToCloudUpdates(onUpdateCallback) {
    if (!this.isReady()) return () => {};

    try {
      const unsubCart = onSnapshot(doc(db, "app_data", "active_cart"), (docSnap) => {
        if (docSnap.exists() && docSnap.data().items) {
          onUpdateCallback("cart", docSnap.data().items);
        }
      }, (err) => console.warn("Cart subscription warning:", err));

      const unsubBudget = onSnapshot(doc(db, "app_data", "budget_settings"), (docSnap) => {
        if (docSnap.exists() && docSnap.data().budgetLimit) {
          onUpdateCallback("budgetLimit", docSnap.data().budgetLimit);
        }
      }, (err) => console.warn("Budget subscription warning:", err));

      return () => {
        unsubCart();
        unsubBudget();
      };
    } catch (e) {
      console.warn("Failed to subscribe to cloud updates:", e);
      return () => {};
    }
  }
};

// Dispatch a custom window event indicating Firebase is ready to use
window.dispatchEvent(new CustomEvent("firebase-ready"));
