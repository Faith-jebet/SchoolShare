import React, { useState } from "react";
import { MessageSquare, Calendar, PlusCircle, ShoppingBag, FolderOpen, ArrowUpRight, Check, CheckCircle2, UserCheck, DollarSign, Clock, HelpCircle } from "lucide-react";
import { CustomSourcingRequest, Supplier } from "../types";

interface CustomSourcedBoardProps {
  requests: CustomSourcingRequest[];
  onPostRequest: (reqData: any) => void;
  onSubmitOffer: (requestId: string, offerData: any) => void;
  onAcceptOffer: (requestId: string, offerId: string) => void;
  currentRole: "parent" | "supplier";
  allSuppliers: Supplier[];
}

export default function CustomSourcedBoard({
  requests,
  onPostRequest,
  onSubmitOffer,
  onAcceptOffer,
  currentRole,
  allSuppliers
}: CustomSourcedBoardProps) {
  const [showPostingForm, setShowPostingForm] = useState(false);
  const [filter, setFilter] = useState<"All" | "Open" | "Fulfilled">("All");

  // Posting Form State
  const [className, setClassName] = useState("Grade 5 Agriculture");
  const [description, setDescription] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("2026-06-10");
  const [parentName, setParentName] = useState("Faith Kiprono");
  const [parentPhone, setParentPhone] = useState("+254 701 444 333");
  const [locationName, setLocationName] = useState("Ngong Road Townhouses Apt 12, Nairobi");

  // Offer Submission State for Suppliers
  const [biddingOnRequestId, setBiddingOnRequestId] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState(300);
  const [bidDelivery, setBidDelivery] = useState(120);
  const [bidTime, setBidTime] = useState(12);
  const [bidRemarks, setBidRemarks] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState(allSuppliers[0]?.id || "");

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onPostRequest({
      parentName,
      parentPhone,
      locationName,
      className,
      description,
      requiredByDate
    });

    setDescription("");
    setShowPostingForm(false);
    alert("Your custom sourcing request has been broadcasted to all local Nairobi merchants!");
  };

  const handleOfferSubmit = (requestId: string) => {
    if (!bidRemarks.trim() || bidPrice <= 0) {
      alert("Please fill in price and clear remarks on how you will source this.");
      return;
    }

    onSubmitOffer(requestId, {
      supplierId: selectedSupplierId,
      priceKES: bidPrice,
      deliveryFeeKES: bidDelivery,
      estimatedDeliveryHours: bidTime,
      remarks: bidRemarks
    });

    setBiddingOnRequestId(null);
    setBidRemarks("");
    alert("Sourcing bid proposal submitted successfully to the parent!");
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "All") return true;
    return r.status === filter;
  });

  return (
    <div id="custom-sourced-board-wrapper" className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs mb-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4 mb-4 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-xs text-stone-900 uppercase tracking-wider">Custom Sourcing & Crafting forums</h2>
            <p className="font-sans text-[11px] text-stone-500">For hard-to-find loam soil packages, traditional musical instruments, or custom lab science components.</p>
          </div>
        </div>

        {currentRole === "parent" && (
          <button
            onClick={() => setShowPostingForm(!showPostingForm)}
            className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-850 text-white font-extrabold text-[11px] px-3.5 py-2.5 rounded-lg transition-all"
            id="toggle-sourcing-btn"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Special Request</span>
          </button>
        )}
      </div>

      {/* Posting form panel */}
      {showPostingForm && currentRole === "parent" && (
        <form onSubmit={handlePostSubmit} className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6 relative">
          <h3 className="font-sans font-bold text-stone-900 text-xs mb-3">Register Special Supply Request</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase">CBC Class Assessment Module</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-md p-2 mt-1 text-xs text-stone-800"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase">Required Before Date</label>
              <input
                type="date"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-md p-2 mt-1 text-xs text-stone-800"
                required
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-[10px] font-bold text-stone-500 uppercase">Detailed supply list or custom crafting descriptions</label>
            <textarea
              placeholder="Provide exact needs e.g., 'Requires 2 kg of natural loam soil mixed with coffee husks packed inside sealed plastic bags' or 'Need a hand-woven traditional reed kayamba shaker for Music term assessments...'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-md p-2 mt-1 text-xs text-stone-800 h-24 font-sans focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase">Parent Contact Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full bg-stone-100 border border-stone-200 rounded-md p-2 mt-1 text-xs text-stone-500/80 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase">Parent Phone (M-Pesa Connected)</label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full bg-stone-100 border border-stone-200 rounded-md p-2 mt-1 text-xs text-stone-500/80 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase">Nairobi Delivery Estate Target</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-stone-100 border border-stone-200 rounded-md p-2 mt-1 text-xs text-stone-500/80 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={() => setShowPostingForm(false)}
              className="px-3.5 py-1.5 border border-stone-250 text-stone-700 bg-white hover:bg-stone-50 rounded-md text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs"
            >
              Broadcast Request
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-4 border-b border-stone-100 pb-2">
        <span className="text-[10px] font-bold uppercase text-stone-400">Filter Forum:</span>
        {(["All", "Open", "Fulfilled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xxs px-3 py-1 rounded border transition-colors font-medium ${
              filter === f
                ? "bg-stone-900 border-stone-900 text-white font-bold"
                : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {f === "All" ? "All Board" : f === "Open" ? "Open Requests" : "Fulfilled / Sourced"}
          </button>
        ))}
      </div>

      {/* Request panels loop */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex flex-col items-center justify-center">
          <FolderOpen className="w-8 h-8 text-stone-300 animate-pulse" />
          <p className="font-sans font-bold text-stone-700 text-xs mt-3 uppercase">Board Empty</p>
          <p className="font-sans text-[10px] text-stone-400 mt-1 max-w-sm">No special sourcing threads are currently registered matching this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredRequests.map((req) => {
            const isFulfilled = req.status === "Fulfilled";

            return (
              <div
                key={req.id}
                className={`border rounded-lg p-4 transition-all ${
                  isFulfilled
                    ? "border-emerald-200 bg-emerald-50/5/5"
                    : "border-stone-200 bg-stone-50/10 hover:border-stone-300 hover:shadow-xs"
                }`}
              >
                {/* Header detail */}
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono">
                      Ref #{req.id.toUpperCase()}
                    </span>
                    <span className="font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded ml-2 font-sans">
                      {req.className}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      isFulfilled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Sourcing details description */}
                <p className="font-sans text-stone-900 text-xs font-semibold leading-relaxed mt-2.5">
                  "{req.description}"
                </p>

                {/* Request details row */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-stone-550 border-t border-b border-stone-100 py-2 my-2 bg-stone-50/50 px-2 rounded">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Needed by: <span className="font-bold text-stone-800">{req.requiredByDate}</span></span>
                  </span>
                  <span>Estate: <span className="font-bold text-stone-800">{req.locationName.split(",")[0]}</span></span>
                  <span>Contact: <span className="font-bold text-stone-850">{req.parentName}</span></span>
                </div>

                {/* Bids Submitted Sub-section */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-stone-800 text-[11px] flex items-center space-x-1">
                      <span>Bids/Quotes from Suppliers ({req.offers.length})</span>
                    </h4>

                    {/* Submit bid clicker for suppliers */}
                    {currentRole === "supplier" && !isFulfilled && biddingOnRequestId !== req.id && (
                      <button
                        onClick={() => {
                          setBiddingOnRequestId(req.id);
                          setBidRemarks(`I will personally source the materials requested for the ${req.className} lesson.`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded transition-all cursor-pointer"
                        id={`supplier-bid-btn-${req.id}`}
                      >
                        Submit Bid Quote
                      </button>
                    )}
                  </div>

                  {/* Supplier offer form */}
                  {biddingOnRequestId === req.id && (
                    <div className="bg-white border-2 border-emerald-500 rounded-lg p-3.5 mt-3 shadow-xs">
                      <h5 className="font-sans font-bold text-stone-900 text-[11px] mb-2">Write Your Sourcing Proposal</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase">Store Node</label>
                          <select
                            value={selectedSupplierId}
                            onChange={(e) => setSelectedSupplierId(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded p-1.5 text-xxs font-sans text-stone-800"
                          >
                            {allSuppliers.map((s) => (
                              <option key={s.id} value={s.id}>{s.name.split(" ")[0]}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase">Material Price (KES)</label>
                          <input
                            type="number"
                            value={bidPrice}
                            onChange={(e) => setBidPrice(Number(e.target.value))}
                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 mt-0.5 text-xxs text-stone-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase">Boda Delivery Fee (KES)</label>
                          <input
                            type="number"
                            value={bidDelivery}
                            onChange={(e) => setBidDelivery(Number(e.target.value))}
                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 mt-0.5 text-xxs text-stone-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase">Est. Sourcing Delay (Hrs)</label>
                          <input
                            type="number"
                            value={bidTime}
                            onChange={(e) => setBidTime(Number(e.target.value))}
                            className="w-full bg-stone-50 border border-stone-200 rounded p-1 mt-0.5 text-xxs text-stone-800"
                          />
                        </div>
                      </div>

                      <div className="mt-2 text-xxs">
                        <label className="block text-[9px] font-bold text-stone-500 uppercase">Sourcing details (Required)</label>
                        <textarea
                          value={bidRemarks}
                          onChange={(e) => setBidRemarks(e.target.value)}
                          placeholder="Explain exactly where and how you will find this rare item with delivery details..."
                          className="w-full bg-stone-50 border border-stone-200 rounded p-1.5 mt-0.5 text-xxs text-stone-800 h-10 resize-none font-sans"
                        />
                      </div>

                      <div className="flex justify-end space-x-2 mt-3.5">
                        <button
                          onClick={() => setBiddingOnRequestId(null)}
                          className="px-2.5 py-1.5 border border-stone-300 text-stone-600 hover:bg-stone-50 rounded text-[10px] font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleOfferSubmit(req.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                          id={`submit-merchant-bid-btn-${req.id}`}
                        >
                          Submit Proposal Quote
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bids itemized lists */}
                  {req.offers.length > 0 ? (
                    <div className="flex flex-col space-y-2 mt-2.5">
                      {req.offers.map((offer) => {
                        const isAcceptedOffer = offer.isAccepted;

                        return (
                          <div
                            key={offer.id}
                            className={`p-3 rounded border text-xs flex justify-between items-start gap-4 transition-all ${
                              isAcceptedOffer
                                ? "bg-emerald-50 border-emerald-400 border-2"
                                : "bg-white border-stone-200"
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {isAcceptedOffer ? (
                                <div className="bg-emerald-600 text-white p-1 rounded-full mt-0.5 flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </div>
                              ) : (
                                <div className="bg-stone-100 text-stone-600 p-1 rounded-full mt-0.5 flex-none font-sans font-bold text-[8px] w-5 h-5 flex items-center justify-center">
                                  BID
                                </div>
                              )}
                              <div>
                                <p className="font-sans font-extrabold text-stone-900 text-xs">
                                  {offer.supplierName}
                                </p>
                                <p className="text-[10px] text-stone-600 mt-0.5 italic leading-relaxed">
                                  "{offer.remarks}"
                                </p>
                                <div className="flex items-center space-x-3 mt-1.5 text-[9px] text-stone-500 font-medium">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3.5 h-3.5 flex-none" />
                                    <span>Ready in: {offer.estimatedDeliveryHours} hrs</span>
                                  </span>
                                  <span>Ph: {offer.supplierPhone}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex flex-col justify-between items-end flex-none h-full">
                              <div>
                                <p className="font-sans font-bold text-stone-950 font-mono text-[11px]">
                                  KES {offer.priceKES}
                                </p>
                                <p className="text-[9px] text-stone-400 font-mono">
                                  + KES {offer.deliveryFeeKES} delivery
                                </p>
                              </div>

                              {/* Parent "Accept Sourced Material" CTA */}
                              {currentRole === "parent" && !isFulfilled && (
                                <button
                                  onClick={() => onAcceptOffer(req.id, offer.id)}
                                  className="mt-2 flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                                  id={`accept-custom-offer-${offer.id}`}
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Accept & Pay</span>
                                </button>
                              )}

                              {isAcceptedOffer && (
                                <span className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Accepted Offer</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xxs text-stone-400 mt-2.5 italic">
                      No suppliers have placed offers yet. Merchants are notified and sourcing coordinates currently.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
