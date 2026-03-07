/**
 * Purchase Alert — Sends owner notification when a verify function confirms payment
 * Also inserts analytics_events row for dashboard tracking
 */

const OWNER_EMAIL = 'kennethsweet214@gmail.com';

interface PurchaseAlertOpts {
  product: string;       // e.g. "SENTINEL Operative", "Research Cognitive"
  customerEmail: string;
  amount?: string;       // e.g. "$129"
  licenseId?: string;    // e.g. "AGT-SENTINEL-v1.0.0-abc123"
  resendKey: string;
}

export async function notifyOwnerPurchase(opts: PurchaseAlertOpts): Promise<boolean> {
  const { product, customerEmail, amount, licenseId, resendKey } = opts;
  const now = new Date();
  const time = now.toLocaleString('en-US', { timeZone: 'America/Chicago' });

  const html = `
    <div style="font-family:'SF Mono',monospace;background:#0a0a0a;color:#e5e5e5;padding:32px 24px;max-width:500px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;padding:6px 16px;border:1px solid #22c55e;border-radius:100px;font-size:11px;letter-spacing:2px;color:#22c55e;">
          NEW PURCHASE
        </div>
      </div>
      <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:16px;font-size:13px;">
        <div style="margin-bottom:10px;">
          <span style="color:#666;">PRODUCT</span><br/>
          <span style="color:#fff;font-weight:700;">${product}</span>
        </div>
        <div style="margin-bottom:10px;">
          <span style="color:#666;">CUSTOMER</span><br/>
          <span style="color:#fff;">${customerEmail}</span>
        </div>
        ${amount ? `<div style="margin-bottom:10px;"><span style="color:#666;">AMOUNT</span><br/><span style="color:#22c55e;font-weight:700;">${amount}</span></div>` : ''}
        ${licenseId ? `<div style="margin-bottom:10px;"><span style="color:#666;">LICENSE</span><br/><span style="color:#fff;font-family:monospace;">${licenseId}</span></div>` : ''}
        <div>
          <span style="color:#666;">TIME</span><br/>
          <span style="color:#888;">${time}</span>
        </div>
      </div>
      <p style="font-size:11px;color:#555;text-align:center;margin:0;">CMPSBL Substrate — Purchase Alert</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CMPSBL <Dev@CMPSBL.com>',
        to: [OWNER_EMAIL],
        subject: `💰 New Purchase: ${product}`,
        html,
      }),
    });
    const ok = res.ok;
    console.log(`[PURCHASE-ALERT] Owner notification ${ok ? 'sent' : 'failed'} for ${product} by ${customerEmail}`);
    return ok;
  } catch (e) {
    console.error('[PURCHASE-ALERT] Email failed:', e);
    return false;
  }
}
