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

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to FMI — Premium Business Acquisitions</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>Welcome to FMI, {name}!</Heading>
            <Text style={paragraph}>
              We are thrilled to welcome you to FMI, the premier digital marketplace for buying and selling private businesses, SaaS companies, and digital assets in India.
            </Text>
            <Text style={paragraph}>
              FMI is designed for serious acquisition entrepreneurs and business owners. To ensure a secure and trusted transaction environment for all participants, all accounts must undergo identity and entity verification before unlocking full platform features.
            </Text>

            <Section style={ctaContainer}>
              <Button style={button} href={`${process.env.VITE_APP_URL || "http://localhost:3000"}/onboarding/role`}>
                Complete Your Onboarding
              </Button>
            </Section>

            <Text style={paragraph}>
              <strong>Next Steps to Get Started:</strong>
              <ul style={list}>
                <li>Set your primary role (Buyer, Seller, or both).</li>
                <li>Submit your KYC documents (PAN / Aadhaar or Company Registration).</li>
                <li>Unlock verified listings and start participating in deals!</li>
              </ul>
            </Text>
            
            <Text style={disclaimer}>
              If you have any questions or need assistance during onboarding, please reach out to our dedicated verification support team.
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

const list = {
  margin: "8px 0",
  paddingLeft: "20px",
  fontSize: "14px",
  lineHeight: "24px",
  color: "#1A1A1A",
  opacity: "0.8",
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
