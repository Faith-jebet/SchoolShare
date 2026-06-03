import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2, Info, AlertCircle, CheckCircle, ShoppingCart } from "lucide-react";
import { AIParsingResult, AIParsedItem } from "../types";

interface CBCParserProps {
  onAddSelectedItems: (itemsToAdd: Array<{ id: string; name: string; priceKES: number; supplierId: string }>) => void;
  catalogMaterials: Array<{ id: string; name: string; priceKES: number; supplierId: string; supplierName: string }>;
}

export default function CBCParser({ onAddSelectedItems, catalogMaterials }: CBCParserProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsingResult, setParsingResult] = useState<AIParsingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const presets = [
    {
      title: "📞 Teacher WhatsApp (Grade 4 Clay & Crafts)",
      text: "Parents take note: For tomorrow's Grade 4 Art & Craft assessment, child must bring 1 standard block of modeling clay (pottery riverbed clay is preferred), 2 different colored manila papers of size A3, or an alternative. Please ensure they arrive on time as the assessment starts at 8 AM. Class Teacher, Kawangware."
    },
    {
      title: "🏡 Home Science Prep (Grade 5 Chef task)",
      text: "Dear Parents, Term 1 Home Science practical involves basic cookery and food presentation. Your child is required to provide a white cotton protection apron and matching chef cap for safety lessons, plus a pair of kitchen rubber gloves. Let us support our learners' skills."
    },
    {
      title: "🌱 Agriculture Project (Grade 6 Seeds & Planting)",
      text: "Project Brief: Grade 6 Agriculture transplanting seedlings lesson. Materials mandatory: 1 seed packet of fast-germinating maize or beans, small starter soil tester and 4 small plastics recycling tins or plant pots. We will set up the garden behind the staffroom. Deadline: Monday."
    },
    {
      title: "笛 Class Music Practical Checklist (Grade 6 Flute)",
      text: "CBC Practical checklist for Grade 6 Music lesson: Every scholar must have a Soprano Recorder Flute key of C (double hole). Learners will be tested on playing national anthem scales. Traditional cowhide rattle (Kayamba) also accepted as support percussive instrument."
    }
  ];

  const handleParse = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    setParsingResult(null);

    const activeText = textToParse;
    setInputText(activeText);

    try {
      const response = await fetch("/api/gemini/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText }),
      });

      if (!response.ok) {
        throw new Error("SomaLink API issue. Retrying scanning with offline catalog.");
      }

      const data = await response.json();
      setParsingResult(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("An error occurred during scanning. Attempting local scan...");
    } finally {
      setIsLoading(false);
    }
  };

  // Add all matched items in result to parent cart
  const handleAddAllMatched = () => {
    if (!parsingResult) return;
    const itemsToAdd: any[] = [];

    parsingResult.items.forEach((item: any) => {
      if (item.matchedMaterialId) {
        itemsToAdd.push({
          id: item.matchedMaterialId,
          name: item.name,
          priceKES: item.matchedPriceKES,
          supplierId: item.matchedSupplierId,
        });
      }
    });

    if (itemsToAdd.length > 0) {
      onAddSelectedItems(itemsToAdd);
      alert(`Successfully added ${itemsToAdd.length} locally-matched CBC items directly to your shopping cart!`);
    } else {
      alert("No pre-matched direct merchant items were found. Try requesting a Custom Sourcing Quote below!");
    }
  };

  const handleAddSingleItem = (item: any) => {
    if (item.matchedMaterialId) {
      onAddSelectedItems([{
        id: item.matchedMaterialId,
        name: item.name,
        priceKES: item.matchedPriceKES,
        supplierId: item.matchedSupplierId,
      }]);
      alert(`Added "${item.name}" to cart from ${item.matchedSupplierName}`);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs mb-6" id="cbc-parser-section">
      <div className="flex items-center space-x-2.5 mb-2">
        <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="font-sans font-bold text-[16px] text-stone-950">AI CBC Homework & supply list Scanner</h2>
          <p className="font-sans text-xs text-stone-500">Paste teachers' instructions or WhatsApp requests to identify materials instantly.</p>
        </div>
      </div>

      {/* Grid: Inputs & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Left Side: Text Area */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Parents, paste your school diary checklist, homework printout or WhatsApp broadcast text here... e.g. 'Tomorrow Grade 4 pupils should bring modeling clay and 3 manila papers...'"
            className="w-full h-40 bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all font-sans resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="font-sans text-[10px] text-stone-400">
              *Local alternative advice automatically calculated for budget constraints.
            </span>
            <button
              onClick={() => handleParse(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>AI Analyze List</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Kenyan Prompt Presets */}
        <div className="lg:col-span-5 flex flex-col bg-stone-50/50 rounded-lg p-3 border border-stone-100 h-full">
          <h3 className="font-sans font-semibold text-stone-700 text-xs mb-2 flex items-center space-x-1">
            <span>Try Quick Kenyan Presets</span>
          </h3>
          <div className="flex flex-col space-y-2 overflow-y-auto max-h-[145px]">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(p.text);
                  handleParse(p.text);
                }}
                className="text-left bg-white border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/10 p-2 rounded-md transition-all group"
              >
                <p className="font-sans font-bold text-[11px] text-stone-800 group-hover:text-emerald-700 transition-colors">
                  {p.title}
                </p>
                <p className="text-[10px] text-stone-500 truncate">{p.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parsing Status Loading Indicators */}
      {isLoading && (
        <div className="mt-6 border border-stone-100 rounded-lg bg-stone-50/50 p-6 flex flex-col items-center justify-center space-y-3.5">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-center">
            <span className="font-sans text-xs font-semibold text-stone-800 block">SomaLink AI Curriculum Engine Active</span>
            <span className="font-sans text-[10px] text-stone-400 mt-1 block">Detecting CBC class modules, matching Kawangware stock, and formulating budget tips...</span>
          </div>
        </div>
      )}

      {/* Scanned Outcomes Display */}
      {parsingResult && !isLoading && (
        <div className="mt-6 border border-amber-200/60 rounded-xl bg-amber-50/5 p-4 sm:p-5 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 flex space-x-2 text-[10px] font-mono text-amber-800 bg-amber-100 rounded-bl-lg">
            <span>Class: {parsingResult.grade}</span>
            {parsingResult.assessmentTopic && (
              <>
                <span>|</span>
                <span>Topic: {parsingResult.assessmentTopic}</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <h3 className="font-sans font-extrabold text-stone-900 text-sm">AI Scan Diagnosis & Mapped Products</h3>
          </div>

          {/* Results Items Rows */}
          <div className="flex flex-col space-y-4">
            {parsingResult.items.map((item, index) => {
              const importanceStyles =
                item.importance === "Mandatory"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : item.importance === "Recommended"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-stone-50 text-stone-600 border-stone-200";

              return (
                <div
                  key={index}
                  className="bg-white border border-stone-200/80 rounded-lg p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start"
                >
                  {/* Title & Subject */}
                  <div className="md:col-span-4 lg:col-span-3">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className={`text-[10px] uppercase font-bold border px-1.5 py-0.5 rounded ${importanceStyles}`}>
                        {item.importance}
                      </span>
                      <span className="text-xxs font-mono text-stone-500 bg-stone-100 px-1 py-0.5 rounded">
                        {item.subject}
                      </span>
                    </div>
                    <p className="font-sans font-bold text-stone-900 text-xs mt-1.5">{item.name}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Estimated Qty: <span className="font-semibold">{item.quantity}</span></p>
                    <p className="text-xxs text-emerald-700 font-mono mt-1">Est. Price: {item.estimatedPriceKESRange}</p>
                  </div>

                  {/* Contextual Budget Alternative Pitch */}
                  <div className="md:col-span-5 lg:col-span-6 bg-stone-50 rounded-md p-2.5 border border-stone-100">
                    <p className="font-sans font-bold text-[10px] text-amber-800 flex items-center space-x-1">
                      <Info className="w-3 h-3 flex-none" />
                      <span>Jua Kali Homemade Alternative (Eco-Action):</span>
                    </p>
                    <p className="text-[10px] text-stone-700 leading-relaxed mt-1 italic">
                      "{item.localAlternativeSuggestion}"
                    </p>
                  </div>

                  {/* Store Connection Box */}
                  <div className="md:col-span-3 lg:col-span-3 flex flex-col justify-end h-full text-right">
                    {item.matchedSupplierId ? (
                      <div className="flex flex-col space-y-1.5 items-end">
                        <span className="text-[10px] text-emerald-800 bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded font-medium flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600 flex-none" />
                          <span className="truncate max-w-[120px]">{item.matchedSupplierName}</span>
                        </span>
                        <p className="text-xxs text-stone-500 font-sans">
                          Price in stock: <span className="font-bold text-stone-900">{item.matchedPriceKES} KES</span>
                        </p>
                        <button
                          onClick={() => handleAddSingleItem(item)}
                          className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-md transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3 text-white" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-2 border border-dashed border-stone-200 bg-stone-50/50 rounded-md flex flex-col items-center justify-center">
                        <p className="text-xxs text-stone-500 font-medium">Bespoke Item</p>
                        <span className="text-[9px] text-stone-400 mt-0.5">Not standard stock</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Local Action recommendations from scan */}
          <div className="mt-5 border-t border-stone-200/80 pt-4">
            <h4 className="font-sans font-bold text-stone-800 text-[11px] mb-1.5">Action Tips from Nairobi Supply Experts:</h4>
            <ul className="list-disc pl-4 space-y-1">
              {parsingResult.recommendedLocalActions.map((tip, i) => (
                <li key={i} className="text-[10px] text-stone-600">
                  {tip}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 mt-4 items-center">
              <button
                onClick={handleAddAllMatched}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-4 py-2.5 rounded-lg transition-colors shadow-xs"
              >
                1-Click Add All Matched Items to Cart
              </button>
              <span className="text-[10px] text-stone-400 italic">
                *Items immediately paired with local vendors Musa Stationery and Mama Cynthia.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
