import React, { useState, useRef } from "react";
import { Send, Paperclip, FileText, Loader2, X } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string, type: "text" | "document", documentUrl?: string) => Promise<void>;
  onTyping?: () => void;
  disabled?: boolean;
  dealId: string;
}

export function MessageInput({ onSendMessage, onTyping, disabled, dealId }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;

    try {
      setSending(true);
      if (attachment) {
        // Send attachment message
        await onSendMessage(attachment.name, "document", attachment.url);
        setAttachment(null);
      } else {
        // Send text message
        const messageText = text;
        setText("");
        await onSendMessage(messageText, "text");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = () => {
    if (onTyping) {
      onTyping();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Simulate/mimic a secure upload to Compliance servers
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      // Setup a simulated Cloudinary secure URL
      const mockCloudinaryUrl = `https://res.cloudinary.com/fmi-digital/document/upload/v1620000000/${encodeURIComponent(
        file.name
      )}`;
      
      setAttachment({
        name: file.name,
        url: mockCloudinaryUrl,
      });
    } catch (err) {
      console.error("Failed to upload document attachment:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-black/10 bg-white p-3 shrink-0">
      {/* File Attachment Preview Banner */}
      {attachment && (
        <div className="mb-3 px-3 py-2 border border-brand-green/20 bg-brand-green/5 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-green" />
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-bold uppercase tracking-tight text-brand-green">
                Attachment Ready for Transmission
              </p>
              <p className="text-[11px] font-mono text-brand-dark/70 truncate uppercase">
                {attachment.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="p-1 hover:bg-black/5 text-brand-dark/40 hover:text-brand-dark transition-all rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        />

        {/* Attachment Trigger */}
        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={disabled || uploading || sending}
          className={`p-2.5 border transition-all shrink-0 focus:outline-none ${
            disabled || uploading || sending
              ? "bg-black/5 border-black/5 text-brand-dark/20 cursor-not-allowed"
              : "border-black/10 bg-white text-brand-dark/65 hover:bg-black/5 hover:border-black/25 cursor-pointer"
          }`}
          title="Attach Compliance Document"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-green" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        {/* Main Text Input */}
        <input
          type="text"
          value={attachment ? `Transmission format: ${attachment.name}` : text}
          onChange={(e) => !attachment && setText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled || sending || uploading || !!attachment}
          placeholder={
            attachment
              ? "Attachment loaded. Click send to transmit."
              : "Secure transaction query..."
          }
          className="flex-1 px-3 py-2.5 border border-black/10 focus:border-brand-green text-xs font-mono focus:outline-none placeholder:text-brand-dark/30 disabled:bg-black/[0.02]"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || sending || uploading || (!text.trim() && !attachment)}
          className={`p-2.5 flex items-center justify-center border transition-all shrink-0 focus:outline-none ${
            (text.trim() || attachment) && !sending && !uploading
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
