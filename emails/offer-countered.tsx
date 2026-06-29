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

interface OfferCounteredEmailProps {
  receiverName: string;
  listingTitle: string;
  originalAmount: number;
  counterAmount: number;
  viewCounterUrl: string;
}

export default function OfferCounteredEmail({
  receiverName,
  listingTitle,
  originalAmount,
  counterAmount,
  viewCounterUrl,
}: OfferCounteredEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>A counter offer has been made on {listingTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>The seller has made a counter offer</Heading>
            <Text style={paragraph}>
              Hello {receiverName},
            </Text>
            <Text style={paragraph}>
              The seller for <strong>"{listingTitle}"</strong> has responded to your offer with a counter-offer.
            </Text>
            
            <Section style={comparisonContainer}>
              <Section style={col}>
                <Text style={colTitle}>Original Offer</Text>
                <Text style={originalAmountStyle}>₹{Number(originalAmount).toLocaleString("en-IN")}</Text>
              </Section>
              <Section style={col}>
                <Text style={colTitle}>Counter Offer</Text>
                <Text style={counterAmountStyle}>₹{Number(counterAmount).toLocaleString("en-IN")}</Text>
              </Section>
            </Section>
            
            <Section style={ctaContainer}>
              <Button style={button} href={viewCounterUrl}>
                View Counter Offer
              </Button>
            </Section>
            
            <Text style={paragraph}>
              You can log in to your FMI Dashboard to review the counter-offer terms, accept the new price, reject it, or send a counter-response.
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

const comparisonContainer = {
  display: "table" as const,
  width: "100%",
  margin: "24px 0",
  background: "#F7F5F0",
  border: "1px solid rgba(29, 68, 41, 0.1)",
  borderRadius: "4px",
  padding: "16px 0",
};

const col = {
  display: "table-cell" as const,
  width: "50%",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
};

const colTitle = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#1A1A1A",
  opacity: "0.5",
  textTransform: "uppercase" as const,
  margin: "0 0 4px 0",
};

const originalAmountStyle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#555",
  margin: "0",
  textDecoration: "line-through",
};

const counterAmountStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1D4429",
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
