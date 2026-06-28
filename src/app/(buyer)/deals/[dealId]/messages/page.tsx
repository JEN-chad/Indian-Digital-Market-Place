import React, { useEffect, useState, useRef } from "react";
import { DealRoomLayout } from "../../../../../components/deal-room/deal-room-layout.tsx";
import { fetchDealMessages, submitDealMessage } from "../../../../../actions/deals.ts";
import { getPusherClient } from "../../../../../../lib/pusher.ts";
import { Send, User, MessageSquare, Loader2 } from "lucide-react";

interface DealSubpageProps {
  dealId: string;
  deal?: any;
  refresh?: () => void;
}

export function BuyerDealMessagesTab({ dealId, deal }: DealSubpageProps) {
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const getMyUserId = () => {
    try {
      const saved = localStorage.getItem("fmi_auth_user");
      return saved ? JSON.parse(saved)?.id : null;
    } catch {
      return null;
    }
  };

  const myUserId = getMyUserId();

  const loadMessages = async () => {
    const result = await fetchDealMessages(dealId);
    if (result.success) {
      setMessagesList(result.messages || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();

    // Set up polling for chat backup
    const interval = setInterval(loadMessages, 4000);

    // Set up Pusher subscription
    let channel: any = null;
    try {
      const pusher = getPusherClient();
      channel = pusher.subscribe(`deal-${dealId}`);
      channel.bind("new-message", () => {
        loadMessages();
      });
    } catch (e) {
      console.warn("Pusher subscribe failed in BuyerDealMessagesTab:", e);
    }

    return () => {
      clearInterval(interval);
      if (channel) {
        try {
          const pusher = getPusherClient();
          pusher.unsubscribe(`deal-${dealId}`);
        } catch (err) {}
      }
    };
  }, [dealId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    const contentToSend = text;
    setText(""); // Instant clear for snappy UI

    const result = await submitDealMessage(dealId, contentToSend);
    if (!result.success) {
      // Restore input on failure
      setText(contentToSend);
    } else {
      loadMessages();
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
        <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
        <p className="text-[10px] font-mono text-brand-dark/40 uppercase mt-3">SYNCHRONIZING CHAT THREAD...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] border border-black/10 bg-brand-cream/5 font-sans rounded-none overflow-hidden">
      {/* Thread Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-brand-dark/20" />
            <p className="text-xs font-bold text-brand-dark">Secure Message Thread Initiated</p>
            <p className="text-[11px] text-brand-dark/50 max-w-xs">
              This channel is encrypted. All conversations are covered by the mutual NDA. Type a message below to coordinate due diligence.
            </p>
          </div>
        ) : (
          messagesList.map((msg) => {
            const isSystem = msg.type === "system" || msg.senderId === "00000000-0000-0000-0000-000000000000";
            const isMine = msg.senderId === myUserId;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2 animate-fade-in">
                  <div className="bg-brand-cream border border-brand-green/20 px-3 py-1.5 max-w-md text-center">
                    <p className="text-[10px] font-mono font-bold uppercase text-brand-green tracking-wide">
                      SYSTEM TRANSACTION LOG
                    </p>
                    <p className="text-[11px] text-brand-dark/70 leading-relaxed mt-0.5">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={msg.id} 
                className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div className={`max-w-xs sm:max-w-md p-3 border space-y-1 ${
                  isMine 
                    ? "bg-brand-dark text-white border-brand-dark/10" 
                    : "bg-white text-brand-dark border-black/[0.05]"
                }`}>
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className={`text-[9px] font-mono font-bold tracking-wider uppercase ${isMine ? "text-brand-green" : "text-brand-dark/50"}`}>
                      {isMine ? "YOU (BUYER)" : msg.senderName || "SELLER"}
                    </span>
                    <span className="text-[8px] font-mono opacity-40">
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t border-black/10 p-3 bg-white flex gap-2.5 items-center shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Secure transaction query..."
          className="flex-1 px-3 py-2.5 border border-black/10 focus:border-brand-green text-xs font-mono focus:outline-none"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className={`p-2.5 flex items-center justify-center border transition-all shrink-0 focus:outline-none ${
            text.trim() && !sending
              ? "bg-brand-dark border-brand-dark text-white hover:bg-brand-green cursor-pointer"
              : "bg-black/5 border-black/5 text-brand-dark/20 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

export default function BuyerDealMessagesPage({ dealId }: { dealId: string }) {
  return (
    <DealRoomLayout dealId={dealId} activeTab="messages" role="buyer">
      <BuyerDealMessagesTab dealId={dealId} />
    </DealRoomLayout>
  );
}
