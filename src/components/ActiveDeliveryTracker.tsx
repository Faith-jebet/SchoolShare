import React, { useState } from "react";
import { Bike, MapPin, Navigation, Phone, CheckSquare, MessageSquare, Send, CheckCircle, ShieldCheck, HelpCircle } from "lucide-react";
import { Order, BodaRider } from "../types";

interface ActiveDeliveryTrackerProps {
  order: Order;
  onUpdateDeliveryStatus?: (orderId: string, status: any) => void;
  currentRole: "parent" | "supplier";
}

export default function ActiveDeliveryTracker({
  order,
  onUpdateDeliveryStatus,
  currentRole
}: ActiveDeliveryTrackerProps) {
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "parent" | "rider" | "system"; text: string; time: string }>>([
    { sender: "system", text: "Order placed successfully. Waiting for school supply merchant to pack items...", time: "Just now" },
    { sender: "rider", text: "Habari! I am John, your Boda Rider. I am heading to the merchant store to collect your CBC supplies.", time: "2 mins ago" }
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "parent", text: inputText, time: "Just now" }
    ]);
    setInputText("");

    // Simulate auto response from the Boda Boda rider
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "rider",
          text: "Sawa kabisa. I have noted the details. I am currently bypassing the Ngong Road traffic jam, arriving soon!",
          time: "Just now"
        }
      ]);
    }, 1500);
  };

  const rider = order.rider;
  const isTransit = order.status === "In Transit" || order.status === "Picked Up";
  const isDelivered = order.status === "Delivered";

  // Coordinates mapping
  const parentX = order.parentCoordinates?.x || 50;
  const parentY = order.parentCoordinates?.y || 50;
  const supplierX = 35; // Default reference Kawangware
  const supplierY = 40;

  // Rider coordinates fallback
  const riderX = rider?.currentCoordinates?.x || supplierX;
  const riderY = rider?.currentCoordinates?.y || supplierY;

  return (
    <div id="active-delivery-tracker" className="bg-stone-900 text-stone-100 rounded-xl p-5 shadow-lg border border-stone-800">
      <div className="flex justify-between items-start border-b border-stone-800 pb-4 mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-600 text-white p-2 rounded-lg animate-pulse">
            <Bike className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-xs text-white uppercase tracking-wider">Live Boda Courier Transit</h2>
            <p className="font-sans text-[11px] text-stone-400">Order: #{order.id} | Supplier: {order.supplierName}</p>
          </div>
        </div>

        <span className="font-mono text-xxs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-1 rounded font-bold">
          STATUS: {order.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Real-time relative-SVG Transit Map */}
        <div className="lg:col-span-8 bg-stone-950 rounded-xl border border-stone-800 p-2.5 flex flex-col justify-between relative overflow-hidden h-[300px] sm:h-[350px]">
          {/* MAP BACKGROUND DESIGN */}
          <div className="absolute inset-0 opacity-15 select-none pointer-events-none">
            {/* Nairobi simulated roads */}
            <svg width="100%" height="100%">
              {/* Ngong Road */}
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="4" strokeLinecap="round" />
              {/* Naivasha Road */}
              <line x1="40%" y1="0" x2="40%" y2="100%" stroke="white" strokeWidth="3" />
              {/* Ring Road Bypass */}
              <path d="M 0,20 Q 50,55 100,20" fill="none" stroke="white" strokeWidth="3" />
              {/* Label Markers on map */}
              <text x="5%" y="45%" fill="white" fontSize="9" fontWeight="bold">Ngong Rd</text>
              <text x="35%" y="10%" fill="white" fontSize="9" fontWeight="bold">Naivasha Rd</text>
              <text x="65%" y="15%" fill="white" fontSize="9" fontWeight="bold">Kilimani Bypass</text>
              <text x="10%" y="85%" fill="white" fontSize="8">Kawangware Stage</text>
              <text x="55%" y="85%" fill="white" fontSize="8">Kibera Olympic</text>
            </svg>
          </div>

          {/* Map Info Bar */}
          <div className="bg-stone-900/90 border border-stone-800 p-2 rounded-lg text-xxs text-stone-400 z-10 flex justify-between items-center">
            <span>Simulated Nairobi delivery path: Kawangware to Ngong Rd Townhouses</span>
            <span className="flex items-center space-x-1 font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>GPRS Active</span>
            </span>
          </div>

          {/* Markers overlay */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
            {/* 1. Supplier Node */}
            <div
              style={{ left: `${supplierX}%`, top: `${supplierY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-auto cursor-pointer"
            >
              <div className="bg-amber-500 text-stone-950 p-1.5 rounded-full shadow-md border-2 border-stone-900">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="bg-stone-900 text-stone-200 text-[9px] px-1.5 py-0.5 rounded font-sans font-semibold mt-1">
                Store
              </span>
            </div>

            {/* 2. Parent Destination Node */}
            <div
              style={{ left: `${parentX}%`, top: `${parentY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-auto cursor-pointer"
            >
              <div className="bg-emerald-600 text-white p-1.5 rounded-full shadow-md border-2 border-stone-900 animate-pulse">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <span className="bg-stone-900 text-stone-200 text-[9px] px-1.5 py-0.5 rounded font-sans font-semibold mt-1">
                Home (Faith)
              </span>
            </div>

            {/* 3. Boda Boda Rider Motorcycle */}
            {rider && (
              <div
                style={{ left: `${riderX}%`, top: `${riderY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 z-20 pointer-events-auto"
              >
                <div className="bg-white text-stone-950 p-2 rounded-full shadow-lg border-2 border-emerald-600 animate-bounce">
                  <Bike className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-xs mt-1">
                  John {order.status === "Delivered" ? "Arrived!" : "Transit"}
                </span>
              </div>
            )}
          </div>

          {/* Map Footer metrics */}
          <div className="bg-stone-900/95 border border-stone-800 p-3 rounded-lg z-10 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-[10px] text-stone-400">Merchant distance</p>
              <p className="font-extrabold text-white font-mono mt-0.5">1.8 KM</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400">Courier Service</p>
              <p className="font-extrabold text-emerald-400 mt-0.5">Kawangware Stage Boda</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400">Total delivery cost</p>
              <p className="font-extrabold text-amber-400 mt-0.5">100 KES</p>
            </div>
          </div>
        </div>

        {/* Right Side: Delivery logs & Live messenger */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 flex-1 flex flex-col justify-between max-h-[240px] md:max-h-[280px]">
            <h3 className="font-sans font-bold text-white text-[11px] uppercase tracking-wider mb-2 pb-1 border-b border-stone-800 flex items-center justify-between">
              <span>Boda Boda Courier chat</span>
              {rider && <span className="text-[10px] text-emerald-400 italic">Plate: {rider.vehicleNo}</span>}
            </h3>

            {/* Chat Body messages loops */}
            <div className="overflow-y-auto space-y-2 pr-1 h-36">
              {chatMessages.map((msg, idx) => {
                const align =
                  msg.sender === "parent"
                    ? "align-self-end bg-emerald-600 text-white ml-auto"
                    : msg.sender === "rider"
                    ? "bg-stone-800 text-stone-100 mr-auto"
                    : "bg-stone-900 text-stone-400 text-center mx-auto max-w-[90%]";

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-xxs font-sans max-w-[85%] ${align}`}
                  >
                    <p className="leading-snug">{msg.text}</p>
                    <span className="text-[8px] text-stone-400 mt-1 block text-right font-mono">{msg.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Input typing panel */}
            <form onSubmit={handleSendChat} className="flex space-x-1.5 mt-2 border-t border-stone-800 pt-2 flex-none">
              <input
                type="text"
                placeholder="Message rider..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-stone-900 border border-stone-850 rounded p-1 text-xxs text-white focus:outline-none focus:border-emerald-600 font-sans"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xxs flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

          {/* Rider profile and contacts shortcuts */}
          {rider && (
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Assigned Rider Profile</p>
              <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className="bg-stone-850 p-2 rounded-full border border-stone-800">
                    <Bike className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-white text-xs">{rider.name}</h4>
                    <p className="text-[10px] text-stone-400">Stage: Kawangware Area Route</p>
                  </div>
                </div>

                <a
                  href={`tel:${rider.phone}`}
                  className="flex items-center space-x-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded text-xxs hover:bg-emerald-600 hover:text-white transition-all font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              </div>

              {/* M-Pesa transaction guarantee seal */}
              {order.mpesaTransId && (
                <div className="mt-3.5 bg-stone-900 p-2 rounded border border-stone-800 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-none animate-pulse" />
                  <div>
                    <p className="text-[9px] text-stone-400 uppercase font-mono tracking-wider font-extrabold">M-PESA GPRS GUARANTEE</p>
                    <p className="text-[10px] text-stone-300">Transaction Code: <span className="font-bold text-white font-mono">{order.mpesaTransId}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
