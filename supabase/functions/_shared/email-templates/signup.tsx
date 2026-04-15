/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for CMPSBL®</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>CMPSBL®</Text>
        <Hr style={divider} />
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Welcome to the Memory Stream. Confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>
          ) to begin crystallizing discoveries.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <Text style={footerBrand}>
          CMPSBL® · Governed Cognitive Infrastructure · PromptFluid™
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '18px', fontWeight: 'bold' as const, color: '#1a1f2e', letterSpacing: '2px', margin: '0 0 16px' }
const divider = { borderColor: '#e2e4e9', margin: '0 0 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1f2e', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4a5060', lineHeight: '1.6', margin: '0 0 28px' }
const link = { color: '#2d7abf', textDecoration: 'underline' }
const button = { backgroundColor: '#2d7abf', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#8b8f9a', margin: '32px 0 0', lineHeight: '1.5' }
const footerBrand = { fontSize: '11px', color: '#b0b4be', margin: '16px 0 0', letterSpacing: '0.5px' }
