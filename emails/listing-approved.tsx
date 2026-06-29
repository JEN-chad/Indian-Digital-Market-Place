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
  Link,
} from "@react-email/components";

interface ListingApprovedEmailProps {
  sellerName: string;
  listingTitle: string;
  listingUrl: string;
}

export default function ListingApprovedEmail({
  sellerName,
  listingTitle,
  listingUrl,
}: ListingApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>🎉 Your listing is now live!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>🎉 Your listing is now live!</Heading>
            <Text style={paragraph}>
              Hello {sellerName},
            </Text>
            <Text style={paragraph}>
              Congratulations! Your business listing <Link href={listingUrl} style={link}><strong>{listingTitle}</strong></Link> has been approved by our curation team and is now actively live on the FMI marketplace.
            </Text>
            
            <Section style={ctaContainer}>
              <Button style={button} href={listingUrl}>
                View Live Listing
              </Button>
            </Section>

            <Text style={paragraph}>
              <strong>Share your listing to attract buyers:</strong><br />
              Promote your listing URL across your professional network, LinkedIn, or relevant investor groups. More views in the first 48 hours increase your chances of appearing in the "Featured Listings" section.
            </Text>
            
            <Section style={boxContainer}>
              <Text style={boxTitle}>Listing URL:</Text>
              <Text style={boxContent}>
                <Link href={listingUrl} style={link}>{listingUrl}</Link>
              </Text>
            </Section>
            
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

const link = {
  color: "#1D4429",
  textDecoration: "underline",
};

const boxContainer = {
  background: "#F7F5F0",
  border: "1px solid rgba(29, 68, 41, 0.1)",
  borderRadius: "4px",
  margin: "24px 0",
  padding: "12px 16px",
};

const boxTitle = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#1D4429",
  margin: "0 0 4px 0",
};

const boxContent = {
  fontSize: "13px",
  color: "#1A1A1A",
  margin: "0",
  wordBreak: "break-all" as const,
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
