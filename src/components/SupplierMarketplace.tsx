import React, { useState } from "react";
import { Search, MapPin, Sparkles, Filter, Store, Package, Plus, Star, Compass, Clock, PhoneCall } from "lucide-react";
import { Supplier, MaterialItem } from "../types";

interface SupplierMarketplaceProps {
  suppliers: Supplier[];
  materials: MaterialItem[];
  onAddToCart: (item: MaterialItem) => void;
  activeLocation: string;
}

export default function SupplierMarketplace({
  suppliers,
  materials,
  onAddToCart,
  activeLocation
}: SupplierMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const grades = ["All", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
  const subjects = ["All", "Art & Craft", "Mathematics", "Science & Tech", "Home Science", "Music & PE", "Languages"];

  // Filter Materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = selectedGrade === "All" || m.grade === selectedGrade;
    const matchesSubject = selectedSubject === "All" || m.subject === selectedSubject;
    const matchesSupplier = !selectedSupplierId || m.supplierId === selectedSupplierId;

    return matchesSearch && matchesGrade && matchesSubject && matchesSupplier;
  });

  return (
    <div id="supplier-marketplace-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Suppliers List */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-100">
            <Store className="w-4.5 h-4.5 text-emerald-600" />
            <h2 className="font-sans font-bold text-xs text-stone-900 uppercase tracking-wider">Active Local Suppliers</h2>
          </div>
          <p className="font-sans text-[10px] text-stone-400 mt-2">
            Showing merchants vetted for Nairobi school requirements nearby <span className="font-semibold text-stone-600">{activeLocation.split(",")[0]}</span>.
          </p>

          <div className="mt-3.5 flex flex-col space-y-3">
            <button
              onClick={() => setSelectedSupplierId(null)}
              className={`text-left p-3 rounded-lg border transition-all text-xs flex justify-between items-center ${
                !selectedSupplierId
                  ? "border-emerald-600 bg-emerald-50/10 text-emerald-950 font-bold"
                  : "border-stone-200 bg-stone-50/50 text-stone-600 font-medium hover:bg-stone-50 hover:border-stone-300"
              }`}
            >
              <span className="flex items-center space-x-2">
                <Compass className="w-3.5 h-3.5" />
                <span>All Suppliers ({suppliers.length})</span>
              </span>
              <span className="text-[10px] bg-stone-250/30 text-stone-500 px-1.5 py-0.5 rounded">Catalog</span>
            </button>

            {suppliers.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSupplierId(s.id)}
                className={`cursor-pointer text-left p-3.5 rounded-lg border transition-all relative ${
                  selectedSupplierId === s.id
                    ? "border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600/50"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs"
                }`}
              >
                {/* Store Name & Owner Details */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${s.avatarColor}`}>
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-stone-950 text-xs">{s.name}</h3>
                      <p className="text-[10px] text-stone-500">Mzee {s.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="font-bold text-[10px] text-stone-850">{s.rating}</span>
                  </div>
                </div>

                {/* Local market coordinates/distance and Delivery terms */}
                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-stone-100 pt-2 text-[10px] text-stone-600">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{s.distanceKm} km away</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>~{s.deliveryTimeMins} mins (Boda)</span>
                  </span>
                </div>

                <div className="mt-2 text-xxs flex justify-between items-center text-stone-500">
                  <span>Category: <span className="font-medium text-stone-700">{s.featuredCategory}</span></span>
                  {s.hasMpesaTill && (
                    <span className="bg-emerald-50 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">M-Pesa Till</span>
                  )}
                </div>

                {/* Click focus overlay indicator */}
                {selectedSupplierId === s.id && (
                  <div className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-0.5">
                    <Plus className="w-2.5 h-2.5 rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel: Catalog Items & Searching */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Search & Filter Header */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          {/* Top Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search school books, clay, math sticks, seedlings kits, aprons..."
              className="w-full bg-stone-50 hover:bg-stone-100/50 text-stone-900 border border-stone-200 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all font-sans"
            />
          </div>

          <div className="mt-3 flex flex-col space-y-2.5 pt-2">
            {/* Grade Level Badge Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1 flex-none">
                <Filter className="w-3 h-3" />
                <span>Grade:</span>
              </span>
              {grades.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`text-xxs px-2.5 py-1 rounded-full border transition-all flex-none font-semibold ${
                    selectedGrade === g
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {g === "All" ? "All Grades" : g}
                </button>
              ))}
            </div>

            {/* Subject Area Badge Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1 flex-none">
                <Package className="w-3 h-3" />
                <span>Subject:</span>
              </span>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`text-xxs px-2.5 py-1 rounded-full border transition-all flex-none font-semibold ${
                    selectedSubject === sub
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Materials Grid list */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <Package className="w-10 h-10 text-stone-300 animate-pulse" />
            <h3 className="font-sans font-bold text-stone-800 text-xs mt-3 uppercase">No matching CBC materials in stock</h3>
            <p className="font-sans text-[11px] text-stone-500 max-w-sm mt-1">
              No general store lists matching those parameters. Try posting inside our parent-supplier custom forums so merchants can source it specifically!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => {
              const stockColors =
                mat.stockStatus === "In Stock"
                  ? "bg-emerald-100 text-emerald-800"
                  : mat.stockStatus === "Low Stock"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800";

              return (
                <div
                  key={mat.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all duration-300 relative group"
                >
                  {/* Top badges bar */}
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xxs font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded uppercase font-mono">
                        {mat.grade} | {mat.subject}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${stockColors}`}>
                        {mat.stockStatus}
                      </span>
                    </div>

                    <h3 className="font-sans font-extrabold text-stone-900 text-xs mt-2 group-hover:text-emerald-700 transition-colors">
                      {mat.name}
                    </h3>
                    <p className="text-[10px] text-stone-600 leading-relaxed mt-1.5 font-sans italic">
                      "{mat.description}"
                    </p>
                  </div>

                  {/* Sourcing delays warning */}
                  {mat.approxCompletionHours && mat.stockStatus === "Low Stock" && (
                    <p className="text-[10px] text-amber-700 bg-amber-50/50 p-1.5 rounded-md mt-2 border border-amber-150 font-sans">
                      ⚠️ Merchant takes ~{mat.approxCompletionHours} hrs to finish crafting.
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-stone-400">Sold by {mat.supplierName.split(" ")[0]}</p>
                      <p className="font-sans font-extrabold text-stone-950 text-xs mt-0.5">
                        KES {mat.priceKES} <span className="font-mono text-[9px] text-stone-500 font-normal">/ {mat.unit}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onAddToCart(mat)}
                      className="bg-stone-900 hover:bg-emerald-600 text-white hover:text-white font-extrabold text-[10px] px-3 py-2 rounded-lg flex items-center space-x-1 transition-all shadow-xs cursor-pointer"
                      id={`add-to-cart-${mat.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
