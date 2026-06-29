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

interface NewOfferSellerEmailProps {
  sellerName: string;
  listingTitle: string;
  offerAmount: number;
  buyerMessage: string;
  viewOfferUrl: string;
}

export default function NewOfferSellerEmail({
  sellerName,
  listingTitle,
  offerAmount,
  buyerMessage,
  viewOfferUrl,
}: NewOfferSellerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New offer received on {listingTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>You have a new offer on your listing</Heading>
            <Text style={paragraph}>
              Hello {sellerName},
            </Text>
            <Text style={paragraph}>
              An interested buyer has submitted a formal acquisition offer on your listing: <strong>"{listingTitle}"</strong>.
            </Text>
            
            <Section style={boxContainer}>
              <Text style={boxTitle}>Offer Details:</Text>
              <Text style={offerAmountStyle}>₹{Number(offerAmount).toLocaleString("en-IN")}</Text>
              <Text style={boxContent}>
                <strong>Buyer Message:</strong><br />
                <span style={messageText}>"{buyerMessage || "No message provided."}"</span>
              </Text>
            </Section>
            
            <Section style={ctaContainer}>
              <Button style={button} href={viewOfferUrl}>
                View Offer
              </Button>
            </Section>
            
            <Text style={paragraph}>
              Please review the offer details inside your Seller Dashboard. You can choose to accept the offer, reject it, or send a counter-offer with your desired terms.
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
  padding: "20px",
  textAlign: "center" as const,
};

const offerAmountStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#1D4429",
  margin: "10px 0 20px 0",
};

const boxTitle = {
  fontSize: "13px",
  fontWeight: "bold",
  color: "#1A1A1A",
  opacity: "0.6",
  textTransform: "uppercase" as const,
  margin: "0",
  letterSpacing: "1px",
};

const boxContent = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#1A1A1A",
  margin: "0",
  textAlign: "left" as const,
};

const messageText = {
  fontStyle: "italic",
  color: "#555",
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
