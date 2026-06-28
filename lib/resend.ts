import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("Resend API key is missing. Emails will not send.");
      resendInstance = new Resend("re_mock_key_for_development");
    } else {
      resendInstance = new Resend(apiKey);
    }
  }
  return resendInstance;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@fmi.in";
