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

interface KycApprovedEmailProps {
  name: string;
}

export default function KycApprovedEmail({ name }: KycApprovedEmailProps) {
  const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
  return (
    <Html>
      <Head />
      <Preview>🎉 Your KYC has been approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>🎉 Your KYC has been approved!</Heading>
            <Text style={paragraph}>
              Hello {name},
            </Text>
            <Text style={paragraph}>
              Excellent news! Our compliance team has reviewed and verified your identity documents. Your FMI account is now fully active and verified.
            </Text>
            <Text style={paragraph}>
              <strong>You can now make offers and access deal rooms.</strong> You also have the capability to unlock confidential documents by signing digital NDAs, message sellers directly, or create your own digital asset listing.
            </Text>
            
            <Section style={ctaContainer}>
              <Button style={buttonPrimary} href={`${baseUrl}/listings`}>
                Browse Businesses
              </Button>
              <span style={spacer}>or</span>
              <Button style={buttonSecondary} href={`${baseUrl}/seller/listings/new`}>
                Create Your Listing
              </Button>
            </Section>
            
            <Text style={disclaimer}>
              We are excited to support your acquisition journey. Let's make your next transaction seamless.
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
  color: "#1D4429",
  margin: "0 0 20px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#1A1A1A",
  opacity: "0.8",
  margin: "0 0 16px 0",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const buttonPrimary = {
  backgroundColor: "#1D4429",
  borderRadius: "4px",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 18px",
};

const buttonSecondary = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #1D4429",
  borderRadius: "4px",
  color: "#1D4429",
  fontSize: "13px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 18px",
};

const spacer = {
  display: "inline-block",
  margin: "0 10px",
  fontSize: "12px",
  color: "#1A1A1A",
  opacity: "0.5",
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
