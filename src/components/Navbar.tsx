import React, { useState } from "react";
import { BookOpen, MapPin, ToggleLeft, ToggleRight, School, User, ShoppingCart, ShieldCheck } from "lucide-react";

interface NavbarProps {
  currentRole: "parent" | "supplier";
  setRole: (role: "parent" | "supplier") => void;
  cartCount: number;
  onOpenCart: () => void;
  activeLocation: string;
  setActiveLocation: (loc: string) => void;
}

export default function Navbar({
  currentRole,
  setRole,
  cartCount,
  onOpenCart,
  activeLocation,
  setActiveLocation
}: NavbarProps) {
  const [showLocationList, setShowLocationList] = useState(false);

  const locations = [
    "Ngong Road Townhouses Apt 12, Nairobi",
    "Kawangware Ward 4 (Near Stage), Nairobi",
    "Kibera Olympic Area (Apt 9-C), Nairobi",
    "Kilimani Wood Avenue Residency, Nairobi",
    "Kasarani Sports View Phase 1, Nairobi"
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-xs">
      <div id="nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-lg flex items-center justify-center shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-sans font-bold text-lg text-stone-900 tracking-tight">SomaLink</span>
                <span className="bg-amber-100 text-amber-800 text-xxs font-semibold px-1.5 py-0.5 rounded-sm">CBC</span>
              </div>
              <p className="font-mono text-xxs text-stone-500">Kenyan Supplier Network</p>
            </div>
          </div>

          {/* Location Bar (Desktop) */}
          <div className="hidden md:flex items-center space-x-2 relative">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <button
              onClick={() => setShowLocationList(!showLocationList)}
              className="text-xs bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-colors border border-stone-200"
            >
              <span className="max-w-[200px] truncate">{activeLocation}</span>
              <span className="text-stone-400 text-[10px]">▼</span>
            </button>
            {showLocationList && (
              <div className="absolute top-10 left-0 w-72 bg-white border border-stone-200 rounded-lg shadow-lg py-1.5 z-10">
                <p className="px-3 py-1 font-sans font-semibold text-stone-500 text-[11px] uppercase tracking-wider">Select Delivery Location</p>
                {locations.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveLocation(loc);
                      setShowLocationList(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-stone-50 transition-colors flex items-center space-x-2 ${
                      activeLocation === loc ? "text-emerald-700 font-semibold bg-emerald-50/50" : "text-stone-700"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 flex-none" />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls Toggles and Actions */}
          <div className="flex items-center space-x-4">
            {/* Parent vs Supplier Role Switcher Toggle */}
            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
              <button
                onClick={() => setRole("parent")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === "parent"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Parent</span>
              </button>
              <button
                onClick={() => setRole("supplier")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === "supplier"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Supplier</span>
              </button>
            </div>

            {/* Shopping Cart button (parents only) */}
            {currentRole === "parent" && (
              <button
                onClick={onOpenCart}
                className="relative bg-emerald-50 text-emerald-800 hover:bg-emerald-100 p-2 rounded-lg transition-colors border border-emerald-200 flex items-center justify-center cursor-pointer"
                aria-label="Open Shopping Cart"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 font-sans font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Secure Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 text-stone-400">
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span className="font-mono text-stone-500 text-xxs">M-Pesa Verified</span>
            </div>
          </div>
        </div>

        {/* Mobile Location Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-stone-100 min-h-10">
          <div className="flex items-center space-x-1 text-stone-600 max-w-full">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-none" />
            <button
              onClick={() => setShowLocationList(!showLocationList)}
              className="text-xxs font-medium text-stone-800 truncate"
            >
              {activeLocation}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
