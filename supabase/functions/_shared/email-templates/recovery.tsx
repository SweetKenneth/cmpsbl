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
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your CMPSBL password</Preview>
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
          <Text style={eyebrow}>ACCOUNT RECOVERY</Text>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your password. Click below to choose a new one — this link expires shortly.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={confirmationUrl}>
              Reset Password →
            </Button>
          </Section>
        </Section>
        <Hr style={divider} />
        <Section style={footerSection}>
          <Text style={footer}>
            Didn't request this? No worries — your password stays unchanged.
          </Text>
          <Text style={footerBrand}>
            CMPSBL® · Cognitive Infrastructure for AI
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
  margin: '0 0 24px',
}
const buttonSection = { margin: '8px 0 0' }
const button = {
  backgroundColor: 'hsl(210, 60%, 45%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '500' as const,
  borderRadius: '8px',
  padding: '13px 32px',
  textDecoration: 'none',
  letterSpacing: '0.01em',
}
const divider = { borderColor: 'hsl(220, 10%, 90%)', margin: '0' }
const footerSection = { padding: '20px 32px 28px' }
const footer = { fontSize: '13px', color: 'hsl(220, 10%, 55%)', margin: '0 0 6px', lineHeight: '1.5' }
const footerBrand = { fontSize: '11px', color: 'hsl(220, 10%, 70%)', margin: '0', letterSpacing: '0.02em' }
