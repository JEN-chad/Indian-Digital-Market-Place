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

interface ListingSubmittedEmailProps {
  sellerName: string;
  listingTitle: string;
}

export default function ListingSubmittedEmail({
  sellerName,
  listingTitle,
}: ListingSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your listing has been submitted for review</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>Your listing has been submitted for review</Heading>
            <Text style={paragraph}>
              Hello {sellerName},
            </Text>
            <Text style={paragraph}>
              Thank you for submitting your listing <strong>"{listingTitle}"</strong> for review on FMI.
            </Text>
            
            <Section style={boxContainer}>
              <Text style={boxTitle}>What happens next?</Text>
              <Text style={boxContent}>
                <strong>Expected review:</strong> 24–48 hours<br />
                <strong>Status:</strong> Pending Curation Review<br />
                <strong>Tips:</strong> Our team will verify the loaded financial statements and traffic analytics. We will notify you via email as soon as it goes live on the marketplace.
              </Text>
            </Section>
            
            <Text style={paragraph}>
              If we need additional clarification or document verification (like verified P&L or domain ownership proofs), one of our acquisition advisors will contact you directly.
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
