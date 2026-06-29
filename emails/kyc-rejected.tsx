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
  Button,
} from "@react-email/components";

interface KycRejectedEmailProps {
  name: string;
  reason: string;
}

export default function KycRejectedEmail({ name, reason }: KycRejectedEmailProps) {
  const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
  return (
    <Html>
      <Head />
      <Preview>Your KYC could not be verified</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>Your KYC could not be verified</Heading>
            <Text style={paragraph}>
              Hello {name},
            </Text>
            <Text style={paragraph}>
              Thank you for submitting your identity verification documents. Unfortunately, we were unable to approve your KYC verification at this time.
            </Text>
            
            <Section style={boxContainer}>
              <Text style={boxTitle}>Rejection Reason:</Text>
              <Text style={boxContent}>{reason || "Document details mismatch or image blurriness. Please ensure clear scans are provided."}</Text>
            </Section>

            <Text style={paragraph}>
              <strong>Instructions:</strong> Please resubmit with clear, legible copies of your PAN card, Aadhaar card, or corporate registration files. Make sure the names on all documents match your FMI account name.
            </Text>
            
            <Section style={ctaContainer}>
              <Button style={button} href={`${baseUrl}/onboarding/role`}>
                Resubmit KYC
              </Button>
            </Section>
            
            <Text style={disclaimer}>
              If you believe this was an error or need help understanding the requirement, please reply to this email to contact our compliance support team.
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
  color: "#D32F2F", // warning/rejection red
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
  background: "#FFEBEE",
  border: "1px solid rgba(211, 47, 47, 0.15)",
  borderRadius: "4px",
  margin: "24px 0",
  padding: "16px 20px",
};

const boxTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#C62828",
  margin: "0 0 8px 0",
};

const boxContent = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#1A1A1A",
  margin: "0",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#1D4429",
  borderRadius: "4px",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
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
