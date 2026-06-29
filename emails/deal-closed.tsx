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

interface DealClosedEmailProps {
  userName: string;
  listingTitle: string;
  dealValue: number;
  parties: string;
  closedDate: string;
  reviewUrl: string;
}

export default function DealClosedEmail({
  userName,
  listingTitle,
  dealValue,
  parties,
  closedDate,
  reviewUrl,
}: DealClosedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>🎉 Congratulations — Deal Closed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>🎉 Congratulations — Deal Closed!</Heading>
            <Text style={paragraph}>
              Hello {userName},
            </Text>
            <Text style={paragraph}>
              We are absolutely thrilled to inform you that the transaction has officially closed, and escrow funds have been successfully released.
            </Text>
            
            <Section style={boxContainer}>
              <Text style={boxTitle}>Deal Summary:</Text>
              <Text style={boxContent}>
                <strong>Listing:</strong> {listingTitle}<br />
                <strong>Parties Involved:</strong> {parties}<br />
                <strong>Deal Value:</strong> ₹{Number(dealValue).toLocaleString("en-IN")}<br />
                <strong>Closure Date:</strong> {closedDate}
              </Text>
            </Section>

            <Text style={paragraph}>
              As a verified member of FMI, your feedback is highly valuable to us and the community. <strong>Please leave a review for your counterparty</strong> to help maintain our trusted marketplace standard.
            </Text>
            
            <Section style={ctaContainer}>
              <Button style={button} href={reviewUrl}>
                Submit Feedback / Review
              </Button>
            </Section>
            
            <Text style={paragraph}>
              Thank you for trusting FMI with your business transaction. We wish you the absolute best in your future business endeavors.
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
  textAlign: "center" as const,
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
