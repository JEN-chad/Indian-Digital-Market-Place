import React from "react";
import { MessageBubble } from "./message-bubble.tsx";
import { SystemMessage } from "./system-message.tsx";

interface Message {
  id: string;
  dealId: string;
  senderId: string;
  content: string;
  type: string;
  documentUrl?: string | null;
  isRead: boolean;
  createdAt: string | Date;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  onDownloadDocument?: (url: string) => void;
}

export function MessageList({ messages, currentUserId, onDownloadDocument }: MessageListProps) {
  // Helper to check if two dates represent the same calendar day
  const isSameDay = (d1: Date | string, d2: Date | string) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Helper to format date header (Today, Yesterday, or full date)
  const formatHeaderDate = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      return "Today";
    }

    if (
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate()
    ) {
      return "Yesterday";
    }

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Render list of messages with date separators
  const renderedElements: React.ReactNode[] = [];

  for (let i = 0; i < messages.length; i++) {
    const currentMsg = messages[i];
    const prevMsg = i > 0 ? messages[i - 1] : null;

    // Insert date separator if it is the first message or on a new day
    if (!prevMsg || !isSameDay(currentMsg.createdAt, prevMsg.createdAt)) {
      renderedElements.push(
        <div key={`date-sep-${currentMsg.id}`} className="flex justify-center my-5 w-full">
          <span className="px-3.5 py-1 text-[9px] font-mono font-bold uppercase text-brand-dark/45 bg-brand-cream/40 border border-black/[0.04] tracking-wider rounded-none">
            {formatHeaderDate(currentMsg.createdAt)}
          </span>
        </div>
      );
    }

    const isSystem =
      currentMsg.type === "system" ||
      currentMsg.senderId === "00000000-0000-0000-0000-000000000000";
    const isMine = currentMsg.senderId === currentUserId;

    if (isSystem) {
      renderedElements.push(
        <div key={currentMsg.id}>
          <SystemMessage message={currentMsg} />
        </div>
      );
    } else {
      renderedElements.push(
        <div key={currentMsg.id}>
          <MessageBubble
            message={currentMsg}
            isMine={isMine}
            onDownloadDocument={onDownloadDocument}
          />
        </div>
      );
    }
  }

  return <div className="space-y-4 py-4 px-2">{renderedElements}</div>;
}
