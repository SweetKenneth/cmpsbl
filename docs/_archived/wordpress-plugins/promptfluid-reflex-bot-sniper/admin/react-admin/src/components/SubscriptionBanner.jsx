import React from 'react';
import { Crown, Clock } from 'lucide-react';

function SubscriptionBanner({ hasSubscription, trialActive, trialDaysRemaining }) {
  if (hasSubscription) {
    return (
      <div className="subscription-banner active">
        <Crown size={20} />
        <span>Pro Plan Active</span>
      </div>
    );
  }

  if (trialActive) {
    return (
      <div className="subscription-banner trial">
        <Clock size={20} />
        <span>Trial Active - {trialDaysRemaining} days remaining</span>
      </div>
    );
  }

  return (
    <div className="subscription-banner inactive">
      <p>Start your 7-day free trial to scan your site</p>
      <button className="start-trial-button">Start Free Trial</button>
    </div>
  );
}

export default SubscriptionBanner;
