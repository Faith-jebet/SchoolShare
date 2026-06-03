import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CBCParser from "./components/CBCParser";
import SupplierMarketplace from "./components/SupplierMarketplace";
import CustomSourcedBoard from "./components/CustomSourcedBoard";
import ActiveDeliveryTracker from "./components/ActiveDeliveryTracker";
import SupplierDashboard from "./components/SupplierDashboard";
import { Supplier, MaterialItem, Order, CustomSourcingRequest } from "./types";
import { Sparkles, ShoppingBag, X, Check, MapPin, Bike, Smartphone, AlertCircle, HelpCircle } from "lucide-react";

export default function App() {
  const [currentRole, setRole] = useState<"parent" | "supplier">("parent");
  const [activeLocation, setActiveLocation] = useState("Ngong Road Townhouses Apt 12, Nairobi");
  const [activeTab, setActiveTab] = useState<"marketplace" | "scanner" | "sourcing" | "tracker" | "dashboard">("scanner");

  // Core Data State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomSourcingRequest[]>([]);

  // Cart State (Fulfill per supplier)
  const [cart, setCart] = useState<Order["items"]>([] as Order["items"]);
  const [showCart, setShowCart] = useState(false);

  // M-Pesa push simulation states
  const [showMpesaPushModal, setShowMpesaPushModal] = useState(false);
  const [mpesaPin, setMpesaPin] = useState("");
  const [mpesaOrderTarget, setMpesaOrderTarget] = useState<Order | null>(null);

  // Selected order focused for live Boda tracking map
  const [selectedOrderForTracker, setSelectedOrderForTracker] = useState<Order | null>(null);

  // Parent profile references
  const parentName = "Faith Kiprono";
  const parentPhone = "+254 701 444 333";

  // Coordinates of dynamic locations
  const locationCoordinates: Record<string, { x: number; y: number }> = {
    "Ngong Road Townhouses Apt 12, Nairobi": { x: 50, y: 40 },
    "Kawangware Ward 4 (Near Stage), Nairobi": { x: 35, y: 45 },
    "Kibera Olympic Area (Apt 9-C), Nairobi": { x: 48, y: 56 },
    "Kilimani Wood Avenue Residency, Nairobi": { x: 55, y: 32 },
    "Kasarani Sports View Phase 1, Nairobi": { x: 75, y: 22 }
  };

  // Fetch all core datasets from server
  const fetchAllData = async () => {
    try {
      const [resSuppliers, resMaterials, resRequests, resOrders] = await Promise.all([
        fetch("/api/suppliers"),
        fetch("/api/materials"),
        fetch("/api/custom-requests"),
        fetch("/api/orders?phone=" + parentPhone)
      ]);

      if (resSuppliers.ok) setSuppliers(await resSuppliers.json());
      if (resMaterials.ok) setMaterials(await resMaterials.json());
      if (resRequests.ok) setCustomRequests(await resRequests.json());
      if (resOrders.ok) {
        const ords = await resOrders.json();
        setOrders(ords);

        // Auto-focus first active transit order if present on mount
        const activeTransit = ords.find((o: Order) => o.status === "In Transit" || o.status === "Rider Assigned" || o.status === "Processing" || o.status === "Picked Up");
        if (activeTransit && !selectedOrderForTracker) {
          setSelectedOrderForTracker(activeTransit);
        }
      }
    } catch (e) {
      console.error("Backend offline. Fallback structures in place.", e);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll orders status every 6 seconds to track animated boda riders
    const interval = setInterval(() => {
      fetchAllData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync role-based default tabs
  useEffect(() => {
    if (currentRole === "supplier") {
      setActiveTab("dashboard");
    } else {
      setActiveTab("scanner");
    }
  }, [currentRole]);

  // Add Item to Cart
  const handleAddToCart = (material: MaterialItem) => {
    setCart((prev) => {
      // Direct checkout is locked to one store at a time for logical logistics
      const hasDifferentSupplier = prev.some((item) => item.supplierId !== material.supplierId);
      if (hasDifferentSupplier) {
        alert(`You already have items in your cart from another supplier. In Nairobi CBC operations, we ship orders per local merchant to save boda boda delivery costs! Please checkout or clear your current items first.`);
        return prev;
      }

      const existingIndex = prev.findIndex((item) => item.materialId === material.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            materialId: material.id,
            name: material.name,
            priceKES: material.priceKES,
            quantity: 1,
            supplierId: material.supplierId,
          }
        ];
      }
    });
    alert(`"${material.name}" added to shopping basket successfully.`);
  };

  // Add multiple items to cart (e.g. from Scanner)
  const handleAddMultipleToCart = (itemsToAdd: Array<{ id: string; name: string; priceKES: number; supplierId: string }>) => {
    setCart((prev) => {
      let updated = [...prev];
      const selectedSupplierId = itemsToAdd[0]?.supplierId;

      const hasDifferent = prev.some((item) => item.supplierId !== selectedSupplierId);
      if (hasDifferent) {
        alert("Cleared out previous items from a separate store to bundle this AI-parsed list together!");
        updated = [];
      }

      itemsToAdd.forEach((newItem) => {
        const matchIdx = updated.findIndex((u) => u.materialId === newItem.id);
        if (matchIdx !== -1) {
          updated[matchIdx].quantity += 1;
        } else {
          updated.push({
            materialId: newItem.id,
            name: newItem.name,
            priceKES: newItem.priceKES,
            quantity: 1,
            supplierId: newItem.supplierId,
          });
        }
      });
      return updated;
    });
  };

  // Modify Cart Quantities
  const handleUpdateCartQty = (matId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.materialId === matId) {
            return { ...item, quantity: Math.max(1, item.quantity + delta) };
          }
          return item;
        });
    });
  };

  const handleRemoveFromCart = (matId: string) => {
    setCart((prev) => prev.filter((it) => it.materialId !== matId));
  };

  // Standard checkout action
  const handleCheckout = async (paymentMethod: "M-Pesa" | "Cash on Delivery") => {
    if (cart.length === 0) return;

    const currentCoords = locationCoordinates[activeLocation] || { x: 50, y: 50 };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName,
          parentPhone,
          parentLocationName: activeLocation,
          parentCoordinates: currentCoords,
          supplierId: cart[0].supplierId,
          items: cart,
          paymentMethod
        })
      });

      if (res.ok) {
        const orderCreated: Order = await res.json();
        setCart([]);
        setShowCart(false);

        if (paymentMethod === "M-Pesa") {
          // Trigger Safaricom push overlay
          setMpesaOrderTarget(orderCreated);
          setShowMpesaPushModal(true);
        } else {
          // Direct processing
          setSelectedOrderForTracker(orderCreated);
          setActiveTab("tracker");
          alert("Order created successfully via Cash on Delivery! Packing coordinates are dispatching.");
          fetchAllData();
        }
      }
    } catch (e) {
      console.error(e);
      alert("Failing to connect to full-stack dispatch. Simulating secure fallback checkout.");
    }
  };

  // Submit Simulated Safaricom PIN to complete checkout
  const handleConfirmMpesaPin = async () => {
    if (!mpesaOrderTarget) return;

    try {
      const res = await fetch(`/api/orders/${mpesaOrderTarget.id}/mpesa-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true })
      });

      if (res.ok) {
        const payload = await res.json();
        const updatedOrder = payload.order;
        setSelectedOrderForTracker(updatedOrder);
        setShowMpesaPushModal(false);
        setMpesaPin("");
        setActiveTab("tracker");
        alert(`M-PESA checkout successful! SMS Transaction Receipt Code: ${updatedOrder.mpesaTransId}. Tracking your Boda courier.`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
      setShowMpesaPushModal(false);
    }
  };

  // Supplier update action (Fulfill status steps)
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Post Sourcing Forums Request
  const handlePostSourcingRequest = async (reqData: any) => {
    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqData)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Supplier Bid quote
  const handleSubmitSupplierOffer = async (requestId: string, offerData: any) => {
    try {
      const res = await fetch(`/api/custom-requests/${requestId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Parent accepts supplier custom quote bid
  const handleAcceptSupplierOffer = async (requestId: string, offerId: string) => {
    try {
      const res = await fetch(`/api/custom-requests/${requestId}/offers/${offerId}/accept`, {
        method: "POST"
      });
      if (res.ok) {
        const payload = await res.json();
        alert(`Congratulations! You have accepted the bid. A direct premium delivery order #${payload.generatedOrder.id} has been automatically initiated with the supplier and boda boda courier.`);
        setSelectedOrderForTracker(payload.generatedOrder);
        setActiveTab("tracker");
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cart total calculations
  const cartSubtotal = cart.reduce((acc, it) => acc + (it.priceKES * it.quantity), 0);
  const activeSupplierDetails = suppliers.find((s) => s.id === cart[0]?.supplierId);
  const cartDeliveryFee = activeSupplierDetails ? activeSupplierDetails.averageDeliveryFeeKES : 100;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans" id="somalink-application-root">
      {/* Navbar Section */}
      <Navbar
        currentRole={currentRole}
        setRole={setRole}
        cartCount={cart.reduce((acc, it) => acc + it.quantity, 0)}
        onOpenCart={() => setShowCart(true)}
        activeLocation={activeLocation}
        setActiveLocation={setActiveLocation}
      />

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grow w-full">
        {/* Quick welcome notification block */}
        <div className="bg-linear-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 select-none">
            <Sparkles className="w-48 h-48" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="bg-amber-400 text-stone-950 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
              Kenya Competency-Based Curriculum support
            </span>
            <h1 className="font-sans font-black text-2xl sm:text-3xl tracking-tight mt-3 text-white">
              SomaLink School Supply Network
            </h1>
            <p className="font-sans text-xs sm:text-sm text-stone-200 mt-2 leading-relaxed">
              Skip long distance coordinates to downtown markets. SomaLink links Nairobi parents directly to nearby vetted school material suppliers inside Kawangware and Kibera, ensuring affordable, timely Boda Boda deliveries.
            </p>
          </div>
        </div>

        {/* Tab navigation headers */}
        <div className="flex border-b border-stone-200 mb-6 overflow-x-auto space-x-1.5 scrollbar-none min-h-12 items-center">
          {currentRole === "parent" ? (
            <>
              <button
                onClick={() => setActiveTab("scanner")}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "scanner"
                    ? "border-emerald-600 text-emerald-800 font-extrabold"
                    : "border-transparent text-stone-500 hover:text-stone-850"
                }`}
              >
                ✨ AI homework Scanner
              </button>
              <button
                onClick={() => setActiveTab("marketplace")}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "marketplace"
                    ? "border-emerald-600 text-emerald-800 font-extrabold"
                    : "border-transparent text-stone-500 hover:text-stone-850"
                }`}
              >
                🏬 Shop School Supplies
              </button>
              <button
                onClick={() => setActiveTab("sourcing")}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "sourcing"
                    ? "border-emerald-600 text-emerald-800 font-extrabold"
                    : "border-transparent text-stone-500 hover:text-stone-850"
                }`}
              >
                🤝 Custom Materials forums
              </button>
              <button
                onClick={() => setActiveTab("tracker")}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === "tracker"
                    ? "border-emerald-600 text-emerald-800 font-extrabold"
                    : "border-transparent text-stone-500 hover:text-stone-850"
                }`}
              >
                <span>🛵 Boda GPRS radar</span>
                {orders.some((o) => o.status === "In Transit") && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "border-emerald-600 text-emerald-800 font-extrabold"
                  : "border-transparent text-stone-500 hover:text-stone-850"
              }`}
            >
              💼 Merchant Dispatch Portal
            </button>
          )}
        </div>

        {/* Tab body rendering switcher */}
        {activeTab === "scanner" && (
          <CBCParser
            onAddSelectedItems={handleAddMultipleToCart}
            catalogMaterials={materials}
          />
        )}

        {activeTab === "marketplace" && (
          <SupplierMarketplace
            suppliers={suppliers}
            materials={materials}
            onAddToCart={handleAddToCart}
            activeLocation={activeLocation}
          />
        )}

        {activeTab === "sourcing" && (
          <CustomSourcedBoard
            requests={customRequests}
            onPostRequest={handlePostSourcingRequest}
            onSubmitOffer={handleSubmitSupplierOffer}
            onAcceptOffer={handleAcceptSupplierOffer}
            currentRole={currentRole}
            allSuppliers={suppliers}
          />
        )}

        {activeTab === "tracker" && (
          <div className="flex flex-col space-y-4">
            {/* If no order is selected but there is one available, offer selectors */}
            {selectedOrderForTracker ? (
              <ActiveDeliveryTracker
                order={selectedOrderForTracker}
                onUpdateDeliveryStatus={handleUpdateOrderStatus}
                currentRole={currentRole}
              />
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <Bike className="w-10 h-10 text-stone-300 animate-pulse" />
                <h3 className="font-sans font-bold text-stone-800 text-xs mt-3 uppercase">No active transit deliveries</h3>
                <p className="font-sans text-[11px] text-stone-500 max-w-sm mt-1">
                  Once you order stationery or accept a custom quote bid from our suppliers, your live Boda Boda dispatch map displays here.
                </p>
                <button
                  onClick={() => setActiveTab("marketplace")}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition"
                >
                  Go to Marketplace
                </button>
              </div>
            )}

            {/* Order histories references */}
            {orders.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs mt-4">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide border-b border-stone-100 pb-2 mb-3">Order Delivery history</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrderForTracker(o)}
                      className={`cursor-pointer p-3 rounded-lg border text-xs flex justify-between items-center transition-all ${
                        selectedOrderForTracker?.id === o.id
                          ? "border-emerald-600 bg-emerald-50/10"
                          : "border-stone-100 hover:border-stone-200 bg-stone-50/50"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-stone-900">Order: #{o.id}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">{o.supplierName.split(" ")[0]} • Total: {o.totalKES} KES</p>
                      </div>

                      <div className="text-right">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          o.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {o.status}
                        </span>
                        <p className="text-[8px] text-stone-400 mt-1 font-mono">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && currentRole === "supplier" && (
          <SupplierDashboard
            orders={orders}
            materials={materials}
            suppliers={suppliers}
            customRequests={customRequests}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSubmitOffer={handleSubmitSupplierOffer}
          />
        )}
      </main>

      {/* Slide-out Shopping Cart Sidebar Drawer */}
      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end transition-opacity animate-fade-in" id="cart-drawer-overlay">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-sans font-bold text-stone-950 text-sm">SomaLink Supply Basket</h3>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart list stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-stone-200 animate-pulse" />
                  <h4 className="font-bold text-stone-800 text-xs mt-3 uppercase">Basket is Empty</h4>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-xs">Scan school homework sheets or click Marketplace '+ Add to Cart' items first!</p>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-50 text-emerald-950 p-3 rounded-lg border border-emerald-100/80 mb-4 text-xs font-medium">
                    📍 Standard dispatch courier Boda Boda of {activeSupplierDetails?.name || "merchant"} has been assigned to coordinate.
                  </div>

                  {cart.map((it) => (
                    <div key={it.materialId} className="flex justify-between items-start border-b border-stone-100 pb-3 gap-4">
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs">{it.name}</h4>
                        <p className="font-mono text-[10px] text-stone-500 mt-1">KES {it.priceKES}</p>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <button
                          onClick={() => handleUpdateCartQty(it.materialId, -1)}
                          className="w-6 h-6 border border-stone-300 rounded hover:bg-stone-50 flex items-center justify-center text-xs text-stone-800 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-stone-950 px-1 text-xs">{it.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(it.materialId, 1)}
                          className="w-6 h-6 border border-stone-300 rounded hover:bg-stone-50 flex items-center justify-center text-xs text-stone-800 cursor-pointer"
                        >
                          +
                        </button>

                        <button
                          onClick={() => handleRemoveFromCart(it.materialId)}
                          className="text-stone-450 hover:text-rose-600 pl-2 text-xxs block border-l border-stone-200 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer Pricing & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col space-y-3">
                <div className="text-stone-650 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>CBC Materials Total</span>
                    <span className="font-mono font-bold text-stone-900">{cartSubtotal} KES</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Boda Boda Logistics fee</span>
                    <span className="font-mono font-bold text-stone-900">{cartDeliveryFee} KES</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-250 font-bold text-stone-900 text-sm">
                    <span>Amount Payable</span>
                    <span className="font-mono">{cartTotal} KES</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleCheckout("M-Pesa")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12px] py-3 rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    id="checkout-mpesa-btn"
                  >
                    <Smartphone className="w-4 h-4 text-white" />
                    <span>Pay with simulated M-PESA Express</span>
                  </button>
                  <button
                    onClick={() => handleCheckout("Cash on Delivery")}
                    className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold text-[11px] py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1 border border-stone-200 cursor-pointer"
                  >
                    <span>Cash on Delivery</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Modal representing simulated Safaricom M-Pesa push authentication */}
      {showMpesaPushModal && mpesaOrderTarget && (
        <div className="fixed inset-0 bg-stone-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-emerald-950/20 border-2 border-emerald-500 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl relative overflow-hidden">
            <div className="bg-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#1E3A20]">
              <Smartphone className="w-6 h-6 shrink-0" />
            </div>

            <span className="bg-emerald-900 text-emerald-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-emerald-800">
              Safaricom M-Pesa SIM Push
            </span>

            <h3 className="font-sans font-black text-white text-base mt-3">Enter M-PESA PIN</h3>
            <p className="font-sans text-[11px] text-stone-300 mt-2">
              Authorize payment of <strong>KES {mpesaOrderTarget.totalKES}</strong> to SomaLink Suppliers Merchant Till <strong>342981</strong>.
            </p>

            {/* Simulated keypad input line */}
            <div className="mt-4 relative">
              <input
                type="password"
                maxLength={4}
                value={mpesaPin}
                onChange={(e) => setMpesaPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-stone-900 border-2 border-stone-800 focus:border-emerald-500 rounded-lg py-3 text-center text-xl tracking-widest font-mono text-white focus:outline-none"
              />
              <span className="text-[9px] text-stone-500 block mt-1.5 font-mono">
                *Simulated Secure Sandbox: enter any 4 digits (e.g., 1234)
              </span>
            </div>

            <div className="flex space-x-2 mt-5">
              <button
                onClick={() => setShowMpesaPushModal(false)}
                className="flex-1 bg-stone-900 border border-stone-850 hover:bg-stone-850 text-stone-350 py-2 rounded-lg text-xs font-bold transition"
              >
                Cancel PIN
              </button>
              <button
                onClick={handleConfirmMpesaPin}
                disabled={mpesaPin.length < 4}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition disabled:opacity-40"
              >
                Send PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer footer information */}
      <footer className="bg-white border-t border-stone-250 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-sans font-semibold text-stone-900 text-xs">SomaLink CBC © 2026</p>
          <p className="text-[10px] text-stone-500 mt-1">
            Built for Nairobi class assessment challenges, matching material inventories in Kibera, Kawangware, and Kilimani with immediate courier routing.
          </p>
        </div>
      </footer>
    </div>
  );
}
