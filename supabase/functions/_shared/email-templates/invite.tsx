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
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>CMPSBL®</Text>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
        <Text style={footerBrand}>CMPSBL® · PromptFluid™</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const brand = { fontSize: '14px', fontWeight: 'bold' as const, color: '#2E78C2', letterSpacing: '2px', margin: '0 0 30px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#212733', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#5C6370', lineHeight: '1.6', margin: '0 0 25px' }
const link = { color: '#2E78C2', textDecoration: 'underline' }
const button = { backgroundColor: '#2E78C2', color: '#ffffff', fontSize: '14px', borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const footerBrand = { fontSize: '11px', color: '#bbb', margin: '10px 0 0', letterSpacing: '1px' }
