/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join CMPSBL®</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>CMPSBL®</Text>
        <Hr style={divider} />
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join the Memory Stream. Click below to accept and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
        <Text style={footerBrand}>
          CMPSBL® · Governed Cognitive Infrastructure · PromptFluid™
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '18px', fontWeight: 'bold' as const, color: '#1a1f2e', letterSpacing: '2px', margin: '0 0 16px' }
const divider = { borderColor: '#e2e4e9', margin: '0 0 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1f2e', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4a5060', lineHeight: '1.6', margin: '0 0 28px' }
const button = { backgroundColor: '#2d7abf', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '13px', color: '#8b8f9a', margin: '32px 0 0', lineHeight: '1.5' }
const footerBrand = { fontSize: '11px', color: '#b0b4be', margin: '16px 0 0', letterSpacing: '0.5px' }
