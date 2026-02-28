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
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your CMPSBL verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBand}>
          <Img
            src="https://bxodolqqczjuahwdrswy.supabase.co/storage/v1/object/public/email-assets/cmpsbl-logo.png"
            width="120"
            height="auto"
            alt="CMPSBL"
            style={logo}
          />
        </Section>
        <Section style={accentLine} />
        <Section style={content}>
          <Text style={eyebrow}>IDENTITY VERIFICATION</Text>
          <Heading style={h1}>Your verification code</Heading>
          <Text style={text}>Enter this code to confirm your identity:</Text>
          <Section style={codeContainer}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={textSmall}>This code is single-use and expires shortly.</Text>
        </Section>
        <Hr style={divider} />
        <Section style={footerSection}>
          <Text style={footer}>
            Didn't request this? Your account is secure — just ignore this email.
          </Text>
          <Text style={footerBrand}>
            CMPSBL® · Cognitive Infrastructure for AI
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}
const container = { maxWidth: '520px', margin: '0 auto' }
const headerBand = {
  backgroundColor: 'hsl(220, 25%, 6%)',
  padding: '28px 32px 24px',
  borderRadius: '12px 12px 0 0',
}
const logo = { display: 'block' as const }
const accentLine = {
  height: '3px',
  background: 'linear-gradient(90deg, hsl(210, 60%, 45%), hsl(185, 100%, 40%), hsl(145, 65%, 42%))',
}
const content = { padding: '32px 32px 24px' }
const eyebrow = {
  fontSize: '11px',
  fontWeight: '600' as const,
  color: 'hsl(210, 60%, 45%)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const h1 = {
  fontSize: '26px',
  fontWeight: '600' as const,
  color: 'hsl(220, 15%, 12%)',
  margin: '0 0 16px',
  letterSpacing: '-0.03em',
  lineHeight: '1.2',
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 10%, 40%)',
  lineHeight: '1.65',
  margin: '0 0 20px',
}
const textSmall = {
  fontSize: '13px',
  color: 'hsl(220, 10%, 55%)',
  lineHeight: '1.5',
  margin: '0',
}
const codeContainer = {
  backgroundColor: 'hsl(220, 25%, 6%)',
  borderRadius: '10px',
  padding: '20px 28px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const codeStyle = {
  fontFamily: '"SF Mono", "Fira Code", Menlo, Consolas, monospace',
  fontSize: '32px',
  fontWeight: '700' as const,
  color: 'hsl(185, 100%, 50%)',
  letterSpacing: '0.2em',
  margin: '0',
}
const divider = { borderColor: 'hsl(220, 10%, 90%)', margin: '0' }
const footerSection = { padding: '20px 32px 28px' }
const footer = { fontSize: '13px', color: 'hsl(220, 10%, 55%)', margin: '0 0 6px', lineHeight: '1.5' }
const footerBrand = { fontSize: '11px', color: 'hsl(220, 10%, 70%)', margin: '0', letterSpacing: '0.02em' }
