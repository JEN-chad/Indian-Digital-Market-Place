import React, { useEffect, useRef } from "react";
import { MessageList } from "./message-list.tsx";
import { MessageInput } from "./message-input.tsx";
import { TypingIndicator } from "./typing-indicator.tsx";
import { useMessages } from "../../hooks/use-messages.ts";
import { MessageSquare, ShieldAlert, Loader2, ArrowDown, User } from "lucide-react";

interface ChatWindowProps {
  dealId: string;
  deal?: any;
}

export function ChatWindow({ dealId, deal }: ChatWindowProps) {
  const getStoredUserId = () => {
    try {
      const saved = localStorage.getItem("fmi_auth_user");
      return saved ? JSON.parse(saved)?.id : null;
    } catch {
      return null;
    }
  };

  const userId = getStoredUserId();
  const { messages, loading, typingUser, sendMessage, triggerTyping } = useMessages(dealId, userId);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isClosed = deal?.stage === "closed" || deal?.stage === "cancelled";
  const otherPartyName = deal
    ? userId === deal.buyerId
      ? deal.sellerName || "Seller"
      : deal.buyerName || "Buyer"
    : "Participant";

  // Auto-scroll to bottom on new messages or when typing state changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUser]);

  const handleDownloadDocument = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-brand-cream/5 border border-black/10 py-16">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[10px] font-mono text-brand-dark/40 uppercase mt-4 tracking-widest">
          SYNCHRONIZING ENCRYPTED TRANSACTION CHAT...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[550px] border border-black/10 bg-brand-cream/[0.03] font-sans rounded-none overflow-hidden shadow-sm">
      {/* Header Info */}
      <div className="px-4 py-3 bg-white border-b border-black/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green">
            <User className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-tight text-brand-dark">
              {otherPartyName}
            </h4>
            <p className="text-[9px] font-mono text-brand-green uppercase tracking-wider font-bold">
              Verified Counterparty • NDA Secured
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-right font-mono">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider">
            SECURE PORTAL ACTIVE
          </span>
        </div>
      </div>

      {/* Main Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-cream/[0.02]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6 space-y-3">
            <div className="p-3.5 bg-brand-dark/5 border border-black/5 rounded-none">
              <MessageSquare className="w-7 h-7 text-brand-dark/30" />
            </div>
            <p className="text-xs font-bold text-brand-dark uppercase tracking-wider font-mono">
              Secure Message Thread Initiated
            </p>
            <p className="text-[11px] text-brand-dark/50 max-w-sm leading-relaxed">
              This channel is end-to-end coordinated under FMI Safe Custody. All messages, documents, and negotiations are formal contract assets. Type a query below to coordinate with the counterparty.
            </p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={userId}
            onDownloadDocument={handleDownloadDocument}
          />
        )}

        {/* Real-time Typing Indicator */}
        {typingUser && (
          <div className="py-2">
            <TypingIndicator senderName={typingUser} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input or Archival Alert */}
      {isClosed ? (
        <div className="border-t border-black/10 p-4 bg-brand-cream/30 text-center flex flex-col items-center justify-center gap-1.5 shrink-0 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-brand-dark/50" />
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/60">
            TRANSACTION ROOM ARCHIVED
          </p>
          <p className="text-[11px] text-brand-dark/50 max-w-xs leading-relaxed">
            This deal has been successfully closed. Secure messaging has been frozen and logged in compliance archives.
          </p>
        </div>
      ) : (
        <MessageInput
          onSendMessage={sendMessage}
          onTyping={triggerTyping}
          dealId={dealId}
          disabled={false}
        />
      )}
    </div>
  );
}
export default ChatWindow;
