import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface KycSubmittedEmailProps {
  name: string;
  kycType: "individual" | "company";
  submittedDocs: string[];
}

export default function KycSubmittedEmail({
  name,
  kycType,
  submittedDocs = [],
}: KycSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>KYC Documents Received & Under Review</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>We've received your KYC documents</Heading>
            <Text style={paragraph}>
              Hello {name},
            </Text>
            <Text style={paragraph}>
              Thank you for submitting your verification details. We have successfully received your documents for <strong>{kycType === "individual" ? "Individual" : "Corporate"} Identity Verification</strong>.
            </Text>
            
            <Section style={boxContainer}>
              <Text style={boxTitle}>Submission Details:</Text>
              <Text style={boxContent}>
                <strong>Expected review time:</strong> 24–48 hours<br />
                <strong>Verification Type:</strong> {kycType.toUpperCase()}<br />
                <strong>Documents Submitted:</strong>
                <ul style={list}>
                  {submittedDocs.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </Text>
            </Section>
            
            <Text style={paragraph}>
              You'll be notified once approved. You can also monitor your KYC approval status inside the FMI Onboarding dashboard at any time.
            </Text>
            
            <Text style={disclaimer}>
              If you didn't initiate this request, please contact our support team immediately.
            </Text>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              FMI Exchange Inc. &bull; Mumbai, India &bull; Secure Digital Mergers & Acquisitions
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#FDFCFB",
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const logo = {
  fontSize: "32px",
  fontWeight: "bold",
  fontStyle: "italic",
  color: "#1D4429",
  margin: "0",
  letterSpacing: "-1px",
};

const logoSubtitle = {
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  color: "#1A1A1A",
  opacity: "0.6",
  margin: "4px 0 0 0",
};

const contentSection = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: "4px",
  padding: "40px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
};

const heading = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#1A1A1A",
  margin: "0 0 20px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#1A1A1A",
  opacity: "0.8",
  margin: "0 0 16px 0",
};

const boxContainer = {
  background: "#F7F5F0",
  border: "1px solid rgba(29, 68, 41, 0.1)",
  borderRadius: "4px",
  margin: "24px 0",
  padding: "16px 20px",
};

const boxTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#1D4429",
  margin: "0 0 10px 0",
};

const boxContent = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#1A1A1A",
  margin: "0",
};

const list = {
  margin: "6px 0 0 0",
  paddingLeft: "20px",
};

const disclaimer = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#1A1A1A",
  opacity: "0.5",
  margin: "24px 0 0 0",
};

const hr = {
  borderColor: "rgba(0, 0, 0, 0.08)",
  margin: "30px 0 20px 0",
};

const footer = {
  fontSize: "11px",
  color: "#1A1A1A",
  opacity: "0.4",
  textAlign: "center" as const,
  margin: "0",
};
