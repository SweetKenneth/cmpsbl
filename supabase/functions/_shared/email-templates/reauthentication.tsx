/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for CMPSBL</Preview>
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
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={divider}>—</Text>
        <Text style={footer}>
          This code expires shortly. If you didn't request this, you can safely ignore this email.
        </Text>
        <Text style={footerBrand}>
          CMPSBL · Cognitive Infrastructure for AI
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: '"SF Mono", "Fira Code", Menlo, Consolas, monospace',
  fontSize: '28px',
  fontWeight: '700' as const,
  color: 'hsl(210, 60%, 45%)',
  letterSpacing: '0.15em',
  margin: '0 0 32px',
  padding: '16px 24px',
  backgroundColor: 'hsl(220, 10%, 96%)',
  borderRadius: '8px',
  display: 'inline-block' as const,
}
const divider = { color: 'hsl(220, 10%, 80%)', margin: '32px 0 16px', fontSize: '14px' }
const footer = { fontSize: '13px', color: 'hsl(220, 10%, 60%)', margin: '0 0 8px', lineHeight: '1.5' }
const footerBrand = { fontSize: '12px', color: 'hsl(220, 10%, 70%)', margin: '0' }
