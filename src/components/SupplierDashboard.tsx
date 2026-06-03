import React, { useState } from "react";
import { Package, Truck, ClipboardList, CheckCircle2, User, DollarSign, Plus, Edit, RotateCcw } from "lucide-react";
import { Order, MaterialItem, Supplier, CustomSourcingRequest } from "../types";

interface SupplierDashboardProps {
  orders: Order[];
  materials: MaterialItem[];
  suppliers: Supplier[];
  customRequests: CustomSourcingRequest[];
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onSubmitOffer: (requestId: string, offerData: any) => void;
}

export default function SupplierDashboard({
  orders,
  materials,
  suppliers,
  customRequests,
  onUpdateOrderStatus,
  onSubmitOffer
}: SupplierDashboardProps) {
  // Let user pick which supplier duka they want to represent for simulation
  const [activeSupplierId, setActiveSupplierId] = useState<string>("sup_cynthia");

  const activeSupplier = suppliers.find((s) => s.id === activeSupplierId) || suppliers[0];

  // Filters orders placed specifically to this supplier
  const supplierOrders = orders.filter((o) => o.supplierId === activeSupplierId);

  // Filters materials listed specifically by this supplier
  const supplierMaterials = materials.filter((m) => m.supplierId === activeSupplierId);

  const handleStatusProgress = (orderId: string, currentStatus: string) => {
    let nextStatus = currentStatus;
    if (currentStatus === "Processing") nextStatus = "Rider Assigned";
    else if (currentStatus === "Rider Assigned") nextStatus = "In Transit";
    else if (currentStatus === "In Transit") nextStatus = "Delivered";

    onUpdateOrderStatus(orderId, nextStatus);
    alert(`Order #${orderId} progressed successfully to: "${nextStatus}" status! Boda Courier dispatched.`);
  };

  return (
    <div id="supplier-dashboard-container" className="flex flex-col space-y-6">
      {/* Supplier Profile Switcher Selector */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 text-white font-bold p-2 rounded-lg text-xs">
            Duka
          </div>
          <div>
            <h2 className="font-sans font-bold text-xs text-stone-900 uppercase">Simulated Merchant Station</h2>
            <p className="font-sans text-[11px] text-stone-500">Select which store to manage and dispatch items from:</p>
          </div>
        </div>

        <select
          value={activeSupplierId}
          onChange={(e) => setActiveSupplierId(e.target.value)}
          className="bg-stone-50 border border-stone-200 text-stone-800 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.locationName.split(",")[0]})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Incoming Parent Orders Pipeline */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex-1">
            <h3 className="font-sans font-bold text-xs text-stone-905 uppercase tracking-wider mb-4 pb-2 border-b border-stone-100 flex items-center space-x-1.5 text-stone-800">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <span>Incoming Parent Orders ({supplierOrders.length})</span>
            </h3>

            {supplierOrders.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <Package className="w-8 h-8 text-stone-200 animate-pulse" />
                <p className="font-sans text-stone-500 text-xs mt-3 select-none">No active incoming orders from local parents.</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 max-h-[500px] overflow-y-auto">
                {supplierOrders.map((ord) => {
                  const statusColors =
                    ord.status === "Pending Payment"
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : ord.status === "Processing"
                      ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                      : ord.status === "In Transit"
                      ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                      : "bg-emerald-50 border-emerald-100 text-emerald-800";

                  return (
                    <div
                      key={ord.id}
                      className="border border-stone-200 rounded-lg p-3.5 hover:border-stone-300 transition-all"
                    >
                      {/* Top status parameters */}
                      <div className="flex justify-between items-center bg-stone-50/50 p-1.5 rounded border border-stone-100">
                        <span className="font-mono text-xxs font-bold text-stone-800">ORDER: #{ord.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors}`}>
                          {ord.status}
                        </span>
                      </div>

                      {/* Items loop summary */}
                      <div className="mt-3.5 space-y-2.5">
                        {ord.items.map((it, i) => (
                          <div key={i} className="flex justify-between items-start text-xs border-b border-stone-100/50 pb-1.5">
                            <div>
                              <p className="font-semibold text-stone-900">{it.name}</p>
                              <p className="text-[10px] text-stone-500">Unit cost: <span className="font-mono">{it.priceKES} KES</span></p>
                            </div>
                            <span className="bg-stone-100 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                              Qty: {it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Summary financials */}
                      <div className="mt-3 bg-stone-50 rounded p-2 text-right text-xs">
                        <p className="text-[10px] text-stone-500">Subtotal: {ord.subtotalKES} KES | Dispatch courier: {ord.deliveryFeeKES} KES</p>
                        <p className="font-sans font-extrabold text-stone-950 mt-1">Total checkout: {ord.totalKES} KES</p>
                      </div>

                      {/* Parent customer profile */}
                      <div className="mt-3 flex items-start space-x-2 text-[10px] text-stone-600 bg-stone-50/50 p-2 border border-stone-100/60 rounded">
                        <User className="w-3.5 h-3.5 text-stone-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-stone-950">{ord.parentName} ({ord.parentPhone})</p>
                          <p className="text-[9px] truncate max-w-[200px]">{ord.parentLocationName}</p>
                        </div>
                      </div>

                      {/* Interactive dispatch controls */}
                      {ord.status !== "Delivered" && (
                        <div className="mt-3.5 flex justify-end">
                          <button
                            onClick={() => handleStatusProgress(ord.id, ord.status)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-md transition-all shadow-xs flex items-center space-x-1"
                          >
                            <Truck className="w-4 h-4 text-white" />
                            <span>
                              {ord.status === "Pending Payment" && "Awaiting Parent Payment"}
                              {ord.status === "Processing" && "Assign Boda Rider"}
                              {ord.status === "Rider Assigned" && "Mark Packed & Dispatched"}
                              {ord.status === "In Transit" && "Confirm Arrived & Delivered"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Store Stock Listing & Customized sourcing coordinator */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          {/* Inventory Manager Panel */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
            <h3 className="font-sans font-bold text-xs text-stone-901 uppercase tracking-wider mb-4 pb-2 border-b border-stone-100 flex items-center space-x-1.5 text-stone-800">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Duka Stock Catalog ({supplierMaterials.length})</span>
            </h3>

            <div className="flex flex-col space-y-3 max-h-[250px] overflow-y-auto">
              {supplierMaterials.map((mat) => (
                <div key={mat.id} className="flex justify-between items-center p-3 border border-stone-200 rounded-lg hover:border-emerald-500/20 hover:bg-emerald-50/5 transition-all text-xs">
                  <div>
                    <h4 className="font-sans font-bold text-stone-950">{mat.name}</h4>
                    <span className="text-[9px] text-stone-500 font-mono italic">
                      KES {mat.priceKES} / {mat.unit} | Grade: {mat.grade}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    mat.stockStatus === "In Stock" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {mat.stockStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick instructions for Supplier role */}
          <div className="bg-amber-50/40 border border-amber-200 text-stone-900 rounded-xl p-4">
            <h4 className="font-sans font-extrabold text-xs text-amber-900">💡 Merchant Instructions</h4>
            <p className="font-sans text-[11px] leading-relaxed mt-1 text-stone-700">
              When parents submit orders or search materials, they see items from your active catalog.
              If they require specialized items (like loam soil or custom instruments), they post on the 
              <strong> Sourcing & Crafting forum </strong>. Jump over to that tab to bid or offer prices!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
