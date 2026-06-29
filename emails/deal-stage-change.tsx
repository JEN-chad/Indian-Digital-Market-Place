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

interface DealStageChangeEmailProps {
  userName: string;
  listingTitle: string;
  stageName: string;
  stageDescription: string;
  requiredActions: string[];
  dealRoomUrl: string;
}

export default function DealStageChangeEmail({
  userName,
  listingTitle,
  stageName,
  stageDescription,
  requiredActions = [],
  dealRoomUrl,
}: DealStageChangeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Deal Update: {stageName} stage active</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>FMI</Text>
            <Text style={logoSubtitle}>Indian Digital Business Exchange</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>Your deal has moved to: {stageName}</Heading>
            <Text style={paragraph}>
              Hello {userName},
            </Text>
            <Text style={paragraph}>
              Your transaction for <strong>"{listingTitle}"</strong> has progressed to a new milestone.
            </Text>
            
            <Section style={boxContainer}>
              <Text style={boxTitle}>Stage: {stageName}</Text>
              <Text style={boxContent}>{stageDescription}</Text>
            </Section>

            {requiredActions.length > 0 && (
              <Section style={actionsContainer}>
                <Text style={actionsTitle}>Required Actions for this stage:</Text>
                <ul style={list}>
                  {requiredActions.map((action, idx) => (
                    <li key={idx} style={listItem}>{action}</li>
                  ))}
                </ul>
              </Section>
            )}
            
            <Section style={ctaContainer}>
              <Button style={button} href={dealRoomUrl}>
                Open Deal Room
              </Button>
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
  borderLeft: "4px solid #1D4429",
  margin: "24px 0",
  padding: "16px 20px",
};

const boxTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#1D4429",
  margin: "0 0 6px 0",
};

const boxContent = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#1A1A1A",
  margin: "0",
};

const actionsContainer = {
  margin: "24px 0",
};

const actionsTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#1A1A1A",
  margin: "0 0 10px 0",
};

const list = {
  margin: "0",
  paddingLeft: "20px",
};

const listItem = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#1A1A1A",
  opacity: "0.8",
  marginBottom: "8px",
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
