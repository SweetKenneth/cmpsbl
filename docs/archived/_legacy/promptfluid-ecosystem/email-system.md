# PromptFluid Email System

Complete email infrastructure powered by Sender.net with 15,000 emails/month capacity.

## 📧 Available Email Functions

### 1. **Welcome Emails** (`pf-email-welcome`)
Sent when users register for PromptFluid accounts.

**Endpoint:** `/functions/v1/pf-email-welcome`

**Payload:**
```json
{
  "to_email": "user@example.com",
  "user_name": "Kenneth",
  "plan_name": "Pro" // optional, defaults to "Free"
}
```

**Features:**
- Beautiful gradient header with PromptFluid logo
- Overview of key features (Brain, Defense, Studio, Nexus)
- Direct CTA to dashboard
- Help resources

---

### 2. **Password Reset** (`pf-email-password-reset`)
Security emails for password reset requests.

**Endpoint:** `/functions/v1/pf-email-password-reset`

**Payload:**
```json
{
  "to_email": "user@example.com",
  "user_name": "Kenneth",
  "reset_link": "https://www.promptfluid.com/reset?token=xyz",
  "expires_in_minutes": 60 // optional, defaults to 60
}
```

**Features:**
- Prominent reset button
- Expiration timer
- Security tips
- Warning if user didn't request reset
- Direct email copy of reset link

---

### 3. **Daily Brain Recap** (`pf-email-brain-daily-recap`)
Automated daily summary of Brain learning activities.

**Endpoint:** `/functions/v1/pf-email-brain-daily-recap`

**Payload:**
```json
{
  "to_email": "user@example.com",
  "user_name": "Kenneth",
  "date": "2025-01-15",
  "stats": {
    "total_ai_calls": 1247,
    "patterns_learned": 15,
    "efficiency_score": 94,
    "cost_saved": 12.45
  },
  "insights": [
    {
      "title": "Optimal Model Selection",
      "description": "Brain learned to route 78% of queries to Groq for cost efficiency",
      "category": "optimization"
    },
    {
      "title": "New Pattern Detected",
      "description": "Identified recurring user request pattern for image generation",
      "category": "learning"
    }
  ]
}
```

**Features:**
- Performance metrics grid
- Categorized insights with visual badges
- Direct link to full Brain dashboard
- Feedback collection

**Automation Setup:**
Schedule this with a cron job or trigger from `pf-brain-daily-report` function.

---

### 4. **Brain Questions** (`pf-email-brain-question`)
Sent when Brain needs user input during learning.

**Endpoint:** `/functions/v1/pf-email-brain-question`

**Payload:**
```json
{
  "to_email": "user@example.com",
  "user_name": "Kenneth",
  "question": "I've noticed inconsistent results when processing images larger than 5MB. Should I automatically compress them before processing, or prompt users for confirmation?",
  "context": {
    "learning_module": "Image Processing",
    "confidence_score": 67,
    "related_patterns": [
      "Large file handling",
      "User preference learning",
      "Performance optimization"
    ]
  },
  "reply_link": "https://www.promptfluid.com/brain/feedback?q=abc123" // optional
}
```

**Features:**
- Animated header showing AI "thinking"
- Confidence score visualization
- Related patterns context
- Reply-to email or direct link
- Time-sensitive notification
- Educational explanation of how feedback helps

**Use Cases:**
- Ambiguous decision points
- User preference learning
- Edge case handling
- Quality assurance validation

---

## 🚀 Implementation Examples

### Welcome Email (User Registration)
```typescript
// In your auth signup handler
const { data: { user } } = await supabase.auth.signUp({
  email, password
});

if (user) {
  await supabase.functions.invoke('pf-email-welcome', {
    body: {
      to_email: user.email,
      user_name: user.user_metadata.name || user.email.split('@')[0],
      plan_name: 'Free'
    }
  });
}
```

### Password Reset
```typescript
// Supabase automatically sends reset emails, but for custom flow:
const resetLink = `https://www.promptfluid.com/auth/reset?token=${resetToken}`;

await supabase.functions.invoke('pf-email-password-reset', {
  body: {
    to_email: user.email,
    user_name: user.display_name,
    reset_link: resetLink,
    expires_in_minutes: 30
  }
});
```

### Daily Brain Recap (Scheduled)
```typescript
// Run via cron job daily at 9 AM
import { supabase } from './supabase';

async function sendDailyRecaps() {
  // Fetch users who opted in
  const { data: users } = await supabase
    .from('profiles')
    .select('email, display_name')
    .eq('email_preferences->daily_recap', true);

  for (const user of users) {
    // Fetch their stats from yesterday
    const stats = await fetchUserStats(user.email);
    const insights = await generateInsights(user.email);

    await supabase.functions.invoke('pf-email-brain-daily-recap', {
      body: {
        to_email: user.email,
        user_name: user.display_name,
        date: new Date().toISOString().split('T')[0],
        stats,
        insights
      }
    });
  }
}
```

### Brain Question (Autonomous)
```typescript
// In your Brain learning logic
if (needsUserFeedback) {
  await supabase.functions.invoke('pf-email-brain-question', {
    body: {
      to_email: adminEmail,
      user_name: 'Kenneth',
      question: uncertaintyDescription,
      context: {
        learning_module: currentModule,
        confidence_score: confidenceLevel,
        related_patterns: relatedPatterns
      },
      reply_link: `https://www.promptfluid.com/brain/feedback?id=${feedbackId}`
    }
  });
}
```

---

## 🎨 Design System

All emails use the PromptFluid brand identity:
- **Primary Gradient:** `#7A5FFF → #01C9E8`
- **Logo:** 125px width, hosted on Supabase storage
- **Typography:** Segoe UI, Tahoma, sans-serif
- **Background:** `#F6F9FF` (light mode)
- **Accent Colors:** `#7A5FFF` (primary), `#01C9E8` (secondary)

---

## 🔐 Security & Authentication

All email functions require JWT authentication (`verify_jwt = true`) to prevent abuse:

```typescript
// Authenticated call
const { data, error } = await supabase.functions.invoke('pf-email-welcome', {
  body: payload,
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
});
```

---

## 📊 Sender.net Integration

**API Endpoint:** `https://api.sender.net/v2/email`

**Configuration:**
- Secret: `SENDER_API_KEY` (stored in Supabase secrets)
- Monthly quota: 15,000 emails
- Rate limit: Managed by Sender.net

**Email Addresses:**
- `hello@promptfluid.com` - Welcome & general
- `security@promptfluid.com` - Password resets
- `brain@promptfluid.com` - Brain communications
- `defense@promptfluid.com` - Defense alerts

---

## 📈 Usage Tracking

Monitor email delivery in Sender.net dashboard:
- Open rates
- Click-through rates
- Bounce rates
- Spam complaints

---

## 🛠️ Troubleshooting

### Email Not Sending
1. Verify `SENDER_API_KEY` is set correctly
2. Check Sender.net quota (15k/month)
3. Review edge function logs: `https://supabase.com/dashboard/project/hxgbibtkftocyrnuzxwd/functions/[function-name]/logs`
4. Validate email payload against schema

### Logo Not Displaying
- Ensure logo is uploaded to: `brain-training-data` bucket
- Path: `promptfluid-logo.png`
- Make bucket public or use signed URL

### Rate Limiting
- Sender.net may rate limit excessive sends
- Implement exponential backoff
- Batch sends for daily recaps

---

## 🎯 Best Practices

1. **Personalization:** Always use user's display name
2. **Timing:** Send daily recaps at optimal times (9 AM user timezone)
3. **Frequency:** Limit Brain questions to 1-2 per week per user
4. **Content:** Keep emails concise and actionable
5. **Testing:** Always test emails before mass sends
6. **Unsubscribe:** Include preference links in all emails

---

## 🚀 Future Enhancements

- [ ] Email template versioning
- [ ] A/B testing framework
- [ ] Multi-language support
- [ ] SMS fallback for critical alerts
- [ ] Advanced segmentation
- [ ] Email scheduling system
- [ ] Reply parsing for Brain questions
- [ ] Analytics dashboard

---

**For questions or support:**
- Documentation: https://www.promptfluid.com/docs/emails
- Support: support@promptfluid.com
