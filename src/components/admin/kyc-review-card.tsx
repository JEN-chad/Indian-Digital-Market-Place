import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Check, XCircle, FileText } from "lucide-react";

interface KycReviewCardProps {
  kycData: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string, reason: string) => Promise<void>;
}

export function KycReviewCard({ kycData, isOpen, onClose, onApprove, onReject }: KycReviewCardProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !kycData) return null;

  const { kyc, user } = kycData;

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(user.id);
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason) return;
    setIsProcessing(true);
    await onReject(user.id, rejectionReason);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-black/10 w-full max-w-6xl h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-black/10 bg-gray-50">
          <div>
            <h3 className="font-bold text-lg">KYC Review: {user.name}</h3>
            <p className="text-xs text-gray-500">Submitted: {new Date(kyc.createdAt).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side: Documents Viewer */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100 border-r border-black/10">
            <h4 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Provided Documents</h4>
            
            <div className="space-y-6">
              {kyc.panDocUrl && (
                <div className="bg-white p-2 border border-black/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-2">PAN Card</p>
                  <img src={kyc.panDocUrl} alt="PAN Document" className="w-full h-auto border border-black/5" />
                </div>
              )}
              {kyc.aadhaarDocUrl && (
                <div className="bg-white p-2 border border-black/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-2">Aadhaar Card</p>
                  <img src={kyc.aadhaarDocUrl} alt="Aadhaar Document" className="w-full h-auto border border-black/5" />
                </div>
              )}
              {kyc.selfieUrl && (
                <div className="bg-white p-2 border border-black/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-2">Live Selfie</p>
                  <img src={kyc.selfieUrl} alt="Selfie" className="w-full max-w-sm mx-auto h-auto border border-black/5" />
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Data & Actions */}
          <div className="w-full md:w-96 bg-white p-6 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-black/10 pb-1">Personal Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-bold">{user.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-bold">{user.email}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">PAN Number</dt><dd className="font-bold uppercase">{kyc.panNumber}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Aadhaar (Last 4)</dt><dd className="font-bold">{kyc.aadhaarLast4}</dd></div>
                </dl>
              </div>

              {kyc.companyName && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-black/10 pb-1">Business Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Company</dt><dd className="font-bold">{kyc.companyName}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">CIN</dt><dd className="font-bold">{kyc.cin}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">GSTIN</dt><dd className="font-bold">{kyc.gstin}</dd></div>
                  </dl>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-black/10 pb-1">Bank Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Account Name</dt><dd className="font-bold">{kyc.bankAccountName}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Account No.</dt><dd className="font-bold">{kyc.bankAccountNumber}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">IFSC</dt><dd className="font-bold">{kyc.bankIfsc}</dd></div>
                </dl>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-black/10 space-y-3">
              {isRejecting ? (
                <div className="space-y-2">
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (sent to user)..."
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
                    <Check className="w-4 h-4" /> Verify & Approve
                  </button>
                  <button 
                    onClick={() => setIsRejecting(true)}
                    disabled={isProcessing}
                    className="w-full bg-white border border-red-200 text-red-600 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-50 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject KYC
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
