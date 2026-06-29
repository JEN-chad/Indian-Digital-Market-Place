import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { formatCurrency } from "../../../lib/utils.ts";
import { analyzeListing } from "../../actions/admin.ts";

interface ListingReviewModalProps {
  listing: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export function ListingReviewModal({ listing, isOpen, onClose, onApprove, onReject }: ListingReviewModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !listing) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeListing(listing.id);
      if (res.success) {
        setAiAnalysis(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(listing.id);
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason) return;
    setIsProcessing(true);
    await onReject(listing.id, rejectionReason);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-black/10 w-full max-w-5xl h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-black/10 bg-gray-50">
          <div>
            <h3 className="font-bold text-lg">{listing.title}</h3>
            <p className="text-xs text-gray-500">Submitted by: {listing.seller?.name || 'Unknown'} ({listing.seller?.email || 'N/A'})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Listing Preview */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-black/10">
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 border border-black/5">
                  <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Asking Price</p>
                  <p className="font-bold">{formatCurrency(listing.askingPrice)}</p>
                </div>
                <div className="bg-gray-50 p-3 border border-black/5">
                  <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Revenue</p>
                  <p className="font-bold">{formatCurrency(listing.monthlyRevenue)}/mo</p>
                </div>
                <div className="bg-gray-50 p-3 border border-black/5">
                  <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Profit</p>
                  <p className="font-bold text-brand-green">{formatCurrency(listing.monthlyProfit)}/mo</p>
                </div>
                <div className="bg-gray-50 p-3 border border-black/5">
                  <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Asset Type</p>
                  <p className="font-bold capitalize">{listing.assetType}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-2 border-b border-black/10 pb-1">Description</h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{listing.description}</div>
              </div>

              <div>
                <h4 className="font-bold mb-2 border-b border-black/10 pb-1">Reason for Sale</h4>
                <div className="text-sm text-gray-700">{listing.reasonForSale}</div>
              </div>

            </div>
          </div>

          {/* Right Side: AI Analysis & Actions */}
          <div className="w-full md:w-96 bg-gray-50 p-6 flex flex-col">
            
            <div className="flex-1">
              {!aiAnalysis ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">AI Listing Analysis</h4>
                    <p className="text-xs text-gray-500">Run a quality check on this listing before approving.</p>
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAnalyzing ? "Analyzing..." : "Run AI Check"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <h4 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-600" /> AI Score</h4>
                    <span className={`text-xl font-bold ${aiAnalysis.score >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                      {aiAnalysis.score}/10
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-3">{aiAnalysis.summary}</p>
                  </div>

                  {aiAnalysis.redFlags?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-3">
                      <h5 className="text-xs font-bold text-red-800 flex items-center gap-1 mb-2"><AlertTriangle className="w-3 h-3" /> Red Flags</h5>
                      <ul className="text-xs text-red-700 list-disc pl-4 space-y-1">
                        {aiAnalysis.redFlags.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.improvements?.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-3">
                      <h5 className="text-xs font-bold text-blue-800 mb-2">Suggested Improvements</h5>
                      <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
                        {aiAnalysis.improvements.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-black/10 space-y-3">
              {isRejecting ? (
                <div className="space-y-2">
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full text-xs p-2 border border-black/20 focus:outline-none focus:border-red-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleReject}
                      disabled={isProcessing || !rejectionReason}
                      className="flex-1 bg-red-600 text-white py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                    <button 
                      onClick={() => setIsRejecting(false)}
                      disabled={isProcessing}
                      className="flex-1 bg-gray-200 text-black py-2 text-xs font-bold uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full bg-brand-green text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-green/90 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve Listing
                  </button>
                  <button 
                    onClick={() => setIsRejecting(true)}
                    disabled={isProcessing}
                    className="w-full bg-white border border-red-200 text-red-600 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject / Request Changes
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
