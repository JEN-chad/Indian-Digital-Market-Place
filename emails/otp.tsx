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

interface FmiOtpEmailProps {
  otp: string;
}

export default function FmiOtpEmail({ otp }: FmiOtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your FMI Verification Code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>Verify Your Identity</Heading>
            <Text style={paragraph}>
              Thank you for using FMI, the premium digital marketplace for Indian business acquisitions.
            </Text>
            <Text style={paragraph}>
              Please use the verification code below to complete your authentication. This code is valid for 10 minutes.
            </Text>
            
            <Section style={otpContainer}>
              <Text style={otpText}>{otp}</Text>
            </Section>
            
            <Text style={disclaimer}>
              If you did not request this, please ignore this email or contact support if you suspect unauthorized activity.
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

const otpContainer = {
  background: "#F7F5F0",
  border: "1px solid rgba(29, 68, 41, 0.15)",
  borderRadius: "4px",
  margin: "24px 0",
  padding: "16px",
  textAlign: "center" as const,
};

const otpText = {
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "6px",
  color: "#1D4429",
  margin: "0",
  fontFamily: '"JetBrains Mono", monospace',
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
