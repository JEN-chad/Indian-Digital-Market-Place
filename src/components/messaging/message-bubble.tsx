import React from "react";
import { motion } from "motion/react";
import { FileText, Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    content: string;
    type: string;
    documentUrl?: string | null;
    createdAt: string | Date;
    isRead: boolean;
    senderName?: string | null;
    senderAvatarUrl?: string | null;
  };
  isMine: boolean;
  onDownloadDocument?: (url: string) => void;
}

export function MessageBubble({ message, isMine, onDownloadDocument }: MessageBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isDocument = message.type === "document" || !!message.documentUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[70%] ${
        isMine ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}
    >
      {/* Avatar / Initials */}
      <div className="flex-shrink-0">
        {message.senderAvatarUrl ? (
          <img
            src={message.senderAvatarUrl}
            alt={message.senderName || "User"}
            className="w-8 h-8 rounded-full border border-black/10 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-dark/10 border border-brand-dark/20 flex items-center justify-center text-[10px] font-mono font-bold text-brand-dark">
            {getInitials(message.senderName || (isMine ? "Me" : "Other"))}
          </div>
        )}
      </div>

      {/* Bubble Body */}
      <div className="flex flex-col space-y-1">
        {/* Name and time header */}
        <div className={`flex items-center gap-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] font-mono font-bold text-brand-dark/70 tracking-tight">
            {message.senderName || (isMine ? "Me" : "Participant")}
          </span>
          <span className="text-[8px] font-mono text-brand-dark/40">{formattedTime}</span>
        </div>

        {/* Bubble contents */}
        <div
          className={`p-3 border font-sans text-xs leading-relaxed break-words whitespace-pre-wrap ${
            isMine
              ? "bg-brand-dark text-white border-brand-dark/20 rounded-l-md rounded-br-md"
              : "bg-white text-brand-dark border-black/[0.08] rounded-r-md rounded-bl-md shadow-sm"
          }`}
        >
          {isDocument ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-sm ${isMine ? "bg-white/10" : "bg-brand-cream"}`}>
                  <FileText className={`w-5 h-5 ${isMine ? "text-brand-green" : "text-brand-dark"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-[11px] truncate uppercase tracking-tight">
                    {message.content || "Uploaded Document"}
                  </p>
                  <p className="text-[9px] opacity-60">FORMAL TRANSACTION RECORD</p>
                </div>
              </div>
              {message.documentUrl && (
                <button
                  type="button"
                  onClick={() => onDownloadDocument?.(message.documentUrl!)}
                  className={`mt-1 py-1.5 px-3 border text-[10px] font-mono font-bold uppercase tracking-wider text-center transition-all ${
                    isMine
                      ? "border-white/20 bg-white/5 hover:bg-white/15 text-white"
                      : "border-black/10 bg-black/5 hover:bg-black/10 text-brand-dark"
                  }`}
                >
                  Download Document
                </button>
              )}
            </div>
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        {/* Read receipts */}
        {isMine && (
          <div className="flex items-center justify-end gap-1 text-[8px] font-mono text-brand-dark/40">
            <span>{message.isRead ? "Read" : "Sent"}</span>
            {message.isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-brand-green shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-brand-dark/40 shrink-0" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
