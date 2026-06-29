import { Resend } from "resend";
import * as React from "react";

// Import all templates
import FmiOtpEmail from "../emails/otp.tsx";
import KycSubmittedEmail from "../emails/kyc-submitted.tsx";
import KycApprovedEmail from "../emails/kyc-approved.tsx";
import KycRejectedEmail from "../emails/kyc-rejected.tsx";
import ListingSubmittedEmail from "../emails/listing-submitted.tsx";
import ListingApprovedEmail from "../emails/listing-approved.tsx";
import NewOfferSellerEmail from "../emails/new-offer-seller.tsx";
import OfferAcceptedBuyerEmail from "../emails/offer-accepted-buyer.tsx";
import OfferCounteredEmail from "../emails/offer-countered.tsx";
import DealStageChangeEmail from "../emails/deal-stage-change.tsx";
import DealClosedEmail from "../emails/deal-closed.tsx";
import WelcomeEmail from "../emails/welcome.tsx";

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

const templateMap: Record<string, React.ComponentType<any>> = {
  "otp": FmiOtpEmail,
  "welcome": WelcomeEmail,
  "kyc-submitted": KycSubmittedEmail,
  "kyc-approved": KycApprovedEmail,
  "kyc-rejected": KycRejectedEmail,
  "listing-submitted": ListingSubmittedEmail,
  "listing-approved": ListingApprovedEmail,
  "new-offer-seller": NewOfferSellerEmail,
  "offer-accepted-buyer": OfferAcceptedBuyerEmail,
  "offer-countered": OfferCounteredEmail,
  "deal-stage-change": DealStageChangeEmail,
  "deal-closed": DealClosedEmail,
};

export async function sendEmail({
  to,
  subject,
  template,
  data,
}: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  try {
    const Component = templateMap[template];
    if (!Component) {
      throw new Error(`Email template "${template}" not found.`);
    }

    const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";
    console.log(`Sending email to ${to} using template "${template}"...`);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "re_mock_key_for_development") {
      console.log(`[MOCK EMAIL SENT]
  From: ${emailFrom}
  To: ${to}
  Subject: ${subject}
  Template: ${template}
  Data:`, JSON.stringify(data, null, 2));
      return { success: true, mock: true };
    }

    const resend = getResend();
    try {
      const response = await resend.emails.send({
        from: emailFrom,
        to,
        subject,
        react: React.createElement(Component, data),
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      console.log(`Email sent successfully. ID: ${response.data?.id}`);
      return { success: true, id: response.data?.id };
    } catch (primaryErr: any) {
      console.warn(`Primary email send failed: ${primaryErr.message}. Trying fallback 'onboarding@resend.dev'...`);
      const response = await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        react: React.createElement(Component, data),
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      console.log(`Email sent successfully using fallback sender.`);
      return { success: true, id: response.data?.id };
    }
  } catch (err: any) {
    console.error(`Error sending email to ${to} with template ${template}:`, err);
    // Return status object to catch errors without crashing the main action
    return { success: false, error: err.message || "Email sending failed" };
  }
}
