/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for CMPSBL®</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>CMPSBL®</Text>
        <Hr style={divider} />
        <Heading style={h1}>Confirm your identity</Heading>
        <Text style={text}>Use the code below to verify your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
        <Text style={footerBrand}>
          CMPSBL® · Governed Cognitive Infrastructure · PromptFluid™
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '18px', fontWeight: 'bold' as const, color: '#1a1f2e', letterSpacing: '2px', margin: '0 0 16px' }
const divider = { borderColor: '#e2e4e9', margin: '0 0 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1f2e', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4a5060', lineHeight: '1.6', margin: '0 0 28px' }
const codeStyle = {
  fontFamily: '"SF Mono", "Fira Code", Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#1a1f2e',
  letterSpacing: '4px',
  margin: '0 0 32px',
  padding: '16px 24px',
  backgroundColor: '#f4f5f7',
  borderRadius: '8px',
}
const footer = { fontSize: '13px', color: '#8b8f9a', margin: '32px 0 0', lineHeight: '1.5' }
const footerBrand = { fontSize: '11px', color: '#b0b4be', margin: '16px 0 0', letterSpacing: '0.5px' }
