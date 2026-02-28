/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your secure sign-in link for CMPSBL</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://bxodolqqczjuahwdrswy.supabase.co/storage/v1/object/public/email-assets/logo.png"
            width="140"
            height="auto"
            alt="CMPSBL"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Your sign-in link</Heading>
        <Text style={text}>
          Click below to sign in to CMPSBL. This link expires shortly — no password needed.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Sign In
          </Button>
        </Section>
        <Text style={divider}>—</Text>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email. Your account is secure.
        </Text>
        <Text style={footerBrand}>
          CMPSBL · Cognitive Infrastructure for AI
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const logoSection = { marginBottom: '32px' }
const logo = { display: 'block' as const }
const h1 = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: 'hsl(220, 15%, 15%)',
  margin: '0 0 16px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 10%, 40%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const buttonSection = { margin: '28px 0' }
const button = {
  backgroundColor: 'hsl(210, 60%, 45%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '500' as const,
  borderRadius: '8px',
  padding: '12px 28px',
  textDecoration: 'none',
}
const divider = { color: 'hsl(220, 10%, 80%)', margin: '32px 0 16px', fontSize: '14px' }
const footer = { fontSize: '13px', color: 'hsl(220, 10%, 60%)', margin: '0 0 8px', lineHeight: '1.5' }
const footerBrand = { fontSize: '12px', color: 'hsl(220, 10%, 70%)', margin: '0' }
