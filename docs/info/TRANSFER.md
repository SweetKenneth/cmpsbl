# promptfluid® Substrate — Ownership Transfer

**v2026.01 — Procedures for Ownership and Asset Transfer**

---

## Overview

This document outlines the procedures for transferring ownership of the promptfluid® substrate, including intellectual property, trademarks, infrastructure, and operational control.

---

## Transferable Assets

### Intellectual Property

| Asset | Type | Transfer Method |
|-------|------|-----------------|
| Source code | Copyright | Assignment agreement |
| Documentation | Copyright | Assignment agreement |
| Trade secrets | Proprietary | NDA + disclosure |
| Patents (if any) | Patent rights | Assignment + recording |

### Trademarks

| Mark | Status | Transfer Method |
|------|--------|-----------------|
| promptfluid® | Registered | Assignment + USPTO recording |
| Dream-Eater™ | Common law | Assignment agreement |
| Decode™ | Common law | Assignment agreement |

### Domain Names

| Domain | Registrar | Transfer Method |
|--------|-----------|-----------------|
| promptfluid.com | [Registrar] | Registrar transfer |
| promptfluid.io | [Registrar] | Registrar transfer |
| evolv.onl | [Registrar] | Registrar transfer |

### Infrastructure

| Component | Provider | Transfer Method |
|-----------|----------|-----------------|
| Supabase project | Supabase | Organization transfer |
| GitHub repository | GitHub | Repository transfer |
| Cloud hosting | [Provider] | Account transfer |
| DNS records | [Provider] | Account transfer |

### Operational

| Asset | Description | Transfer Method |
|-------|-------------|-----------------|
| API keys | All provider keys | Credential handover |
| Secrets | Environment variables | Secure handover |
| Documentation | Internal procedures | Knowledge transfer |
| Customer data | If applicable | Data export + handover |

---

## Transfer Process

### Phase 1: Due Diligence (2-4 weeks)

#### Buyer Activities
1. Code audit and security review
2. IP verification (ownership, encumbrances)
3. Trademark status verification
4. Customer/usage analysis
5. Technical assessment

#### Seller Activities
1. Prepare asset inventory
2. Compile documentation
3. Identify all accounts/credentials
4. Prepare representations & warranties
5. Obtain any required consents

### Phase 2: Agreement (1-2 weeks)

#### Key Agreement Terms
- Purchase price and payment terms
- Asset list (detailed)
- Representations and warranties
- Indemnification provisions
- Transition support period
- Non-compete provisions (if applicable)
- Confidentiality obligations

#### Required Documents
- Asset Purchase Agreement
- IP Assignment Agreement
- Trademark Assignment
- Domain Transfer Authorization
- Bill of Sale
- Transition Services Agreement

### Phase 3: Closing (1-2 days)

#### Simultaneous Actions
1. Execute all agreements
2. Wire purchase price
3. Transfer domain names
4. Transfer repository access
5. Transfer infrastructure access
6. Deliver credentials/secrets
7. Notify relevant third parties

### Phase 4: Transition (4-8 weeks)

#### Knowledge Transfer
- Architecture walkthrough
- Codebase documentation
- Operational procedures
- Customer relationships
- Vendor relationships

#### Technical Handover
- Development environment setup
- Production access transfer
- Monitoring/alerting transfer
- Secret rotation
- DNS propagation

---

## Detailed Asset Transfer Procedures

### 1. Source Code Transfer

**GitHub Repository Transfer:**
```
1. Seller adds buyer as owner to GitHub organization
2. Seller transfers repository ownership
3. Buyer verifies full history access
4. Seller removes their access
5. Buyer rotates any embedded secrets
```

**Verification:**
- Full commit history intact
- All branches transferred
- All tags transferred
- GitHub Actions/workflows functional
- Secrets not exposed

### 2. Trademark Transfer

**USPTO Recording (for registered marks):**
```
1. Execute Trademark Assignment Agreement
2. Prepare USPTO Assignment form
3. Record with USPTO Assignment Division
4. Receive recordation confirmation
5. Update trademark monitoring
```

**Required Information:**
- Registration number
- Mark as registered
- Goods/services covered
- Assignor name and address
- Assignee name and address
- Date of assignment
- Consideration received

### 3. Domain Transfer

**Transfer Process:**
```
1. Seller unlocks domain at registrar
2. Seller obtains authorization code
3. Seller provides code to buyer
4. Buyer initiates transfer at their registrar
5. Seller approves transfer request
6. Transfer completes (5-7 days typical)
7. Buyer updates DNS records
```

**Post-Transfer:**
- Update WHOIS information
- Verify DNS propagation
- Test all subdomains
- Update SSL certificates

### 4. Infrastructure Transfer

**Supabase Organization Transfer:**
```
1. Seller invites buyer to organization
2. Seller grants owner permissions
3. Buyer verifies access to all projects
4. Seller transfers ownership
5. Seller removes their access
6. Buyer rotates all API keys
```

**Cloud Provider Transfer:**
```
1. Seller adds buyer to account
2. Seller grants admin permissions
3. Buyer verifies resource access
4. Seller transfers billing ownership
5. Seller removes their access
6. Buyer updates payment methods
```

### 5. Credential Handover

**Secure Credential Transfer:**
```
1. Create encrypted document with all credentials
2. Use secure channel for password delivery
3. Buyer verifies all credentials work
4. Buyer rotates all credentials immediately
5. Seller confirms loss of access
6. Delete transfer documents
```

**Credentials to Transfer:**
- Database passwords
- API keys (all providers)
- OAuth secrets
- JWT signing keys
- Email service credentials
- Analytics access
- Payment processor credentials

---

## Transition Support

### Included in Standard Transfer

| Support Type | Duration | Scope |
|--------------|----------|-------|
| Technical consultation | 30 days | Architecture, bugs, issues |
| Email support | 60 days | Questions, clarifications |
| Emergency support | 90 days | Critical issues only |

### Extended Support (Optional)

| Package | Duration | Includes |
|---------|----------|----------|
| Standard | 90 days | 10 hours consultation |
| Extended | 180 days | 25 hours consultation |
| Comprehensive | 365 days | 50 hours + on-call |

---

## Post-Transfer Obligations

### Seller Obligations

1. **Non-Compete** — Typically 2-3 years in same market
2. **Non-Solicit** — Cannot solicit customers/employees
3. **Confidentiality** — Maintain confidentiality indefinitely
4. **Cooperation** — Assist with reasonable requests
5. **No Disparagement** — Cannot disparage buyer/product

### Buyer Obligations

1. **Trademark Maintenance** — Maintain registrations
2. **License Compliance** — Honor existing licenses
3. **Customer Obligations** — Honor existing commitments
4. **Payment Obligations** — Complete all payments

---

## Valuation Considerations

### Valuation Methods

| Method | Approach | When Used |
|--------|----------|-----------|
| Revenue Multiple | 3-5x ARR | Recurring revenue present |
| Asset-Based | Sum of assets | Early stage, no revenue |
| Strategic | Premium for synergies | Strategic acquirer |
| Comparable | Similar transactions | Market-based pricing |

### Value Drivers

**Positive:**
- Active users/customers
- Recurring revenue
- Unique technology
- Strong trademark
- Clean IP chain
- Modern architecture

**Negative:**
- Technical debt
- Unresolved legal issues
- Unclear IP ownership
- No documentation
- Customer concentration
- Key person dependency

---

## Legal Requirements

### Required Legal Documents

1. **Asset Purchase Agreement** — Master agreement
2. **IP Assignment** — Assigns all IP rights
3. **Trademark Assignment** — Transfers marks
4. **Bill of Sale** — Transfers personal property
5. **Domain Assignment** — Transfers domains
6. **Transition Services Agreement** — Defines support

### Representations & Warranties

Seller typically represents:
- Ownership of all assets
- No encumbrances or liens
- No infringement claims
- Accuracy of financial data
- No undisclosed liabilities
- Authority to transfer

### Indemnification

- Seller indemnifies for pre-closing issues
- Buyer indemnifies for post-closing issues
- Basket and cap provisions typical
- Escrow for potential claims

---

## Tax Considerations

### Allocation of Purchase Price

Allocate purchase price among:
- Software (amortizable)
- Trademarks (amortizable)
- Goodwill (amortizable)
- Tangible assets (depreciable)
- Non-compete (amortizable)

### Tax Filings

- Form 8594 (Asset Acquisition Statement)
- State filings as required
- Consult tax professionals

---

## Escrow Arrangements

### Purchase Price Escrow

| Escrow Type | Amount | Duration |
|-------------|--------|----------|
| Indemnity holdback | 10-15% | 12-18 months |
| Working capital adjustment | Variable | 60-90 days |

### Code Escrow (if applicable)

For enterprise customers requiring source code escrow:
- Identify escrow agent
- Transfer escrow agreement
- Update deposit materials
- Notify beneficiaries

---

## Contact for Transfer Inquiries

| Inquiry Type | Contact |
|--------------|---------|
| **Acquisition Interest** | acquire@promptfluid.com |
| **Legal Inquiries** | legal@promptfluid.com |
| **General Questions** | promptfluid@gmail.com |

| Ownership | Details |
|-----------|---------|
| **Current Owner** | Kenneth E Sweet Jr |
| **Email** | promptfluid@gmail.com |
| **Phone** | (760) FLUID-AI |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial transfer procedures |

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
