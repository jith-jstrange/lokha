/**
 * Lokha.Today - Creem.io Payment & Ghost Membership Bridge
 * Replaces Stripe with Creem Merchant of Record (MoR) for Global Tax Compliance & Multi-Currency Checkout
 */

(function () {
  'use strict';

  const CREEM_CONFIG = {
    monthlyUrl: 'https://creem.io/product/prod_1zIxHl2CZ7Efx4ZE3lBCNP',
    yearlyUrl: 'https://creem.io/product/prod_1QoaqCLA6UqaNTBH76XzqZ',
    successUrl: window.location.origin + '/?subscribed=true',
    cancelUrl: window.location.href,
  };

  // 1. Check for Successful Subscription Redirect
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('subscribed') === 'true') {
    showWelcomeToast();
    // Clean up query param
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  function showWelcomeToast() {
    const toast = document.createElement('div');
    toast.className = 'creem-toast-notification';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">✨</span>
        <div class="toast-text">
          <strong>Welcome to Lokha Supporter Membership!</strong>
          <p>Your subscription is active. All premium dispatches, comics, and archives are unlocked.</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 8000);
  }

  // 2. Build Creem Checkout Modal
  function createCheckoutModal() {
    if (document.getElementById('creem-membership-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'creem-membership-modal';
    modal.className = 'creem-modal-overlay';
    modal.innerHTML = `
      <div class="creem-modal-box">
        <button class="creem-modal-close" id="creem-modal-close-btn" aria-label="Close">&times;</button>
        
        <div class="creem-modal-header">
          <span class="creem-emblem">✦</span>
          <h2 class="creem-title">Become a Lokha Supporter</h2>
          <p class="creem-subtitle">Support independent, thoughtful writing across personal memoirs, graphic comics, broadside journalism, essays, and scrapbooks.</p>
        </div>

        <div class="creem-plans-grid">
          <!-- Free Tier -->
          <div class="creem-plan-card">
            <div class="plan-header">
              <h3 class="plan-name">Free Reader</h3>
              <div class="plan-price"><span class="price-val">$0</span><span class="price-cycle">/forever</span></div>
            </div>
            <p class="plan-desc">Standard access to public dispatches, newsletters, and email updates.</p>
            <ul class="plan-features">
              <li>✓ Regular public stories</li>
              <li>✓ Weekly newsletter digest</li>
              <li>✓ Community discussion</li>
            </ul>
            <a href="#/portal/signup/free" class="creem-plan-btn free-btn" id="creem-free-btn">Join Free</a>
          </div>

          <!-- Monthly Supporter -->
          <div class="creem-plan-card popular-card">
            <div class="popular-badge">Most Popular</div>
            <div class="plan-header">
              <h3 class="plan-name">Monthly Supporter</h3>
              <div class="plan-price"><span class="price-val">$5</span><span class="price-cycle">/month</span></div>
            </div>
            <p class="plan-desc">Full access to all deep-dive essays, comic vignettes, and complete archives.</p>
            <ul class="plan-features">
              <li>✓ Full archival & premium access</li>
              <li>✓ Exclusive comic & essay dispatches</li>
              <li>✓ Priority comments & discussions</li>
              <li>✓ Global tax-compliant checkout (VAT/GST)</li>
            </ul>
            <a href="${CREEM_CONFIG.monthlyUrl}" class="creem-plan-btn paid-btn" target="_blank" rel="noopener">Subscribe Monthly ($5)</a>
          </div>

          <!-- Annual Supporter -->
          <div class="creem-plan-card best-value-card">
            <div class="popular-badge best-badge">Save 17%</div>
            <div class="plan-header">
              <h3 class="plan-name">Annual Supporter</h3>
              <div class="plan-price"><span class="price-val">$50</span><span class="price-cycle">/year</span></div>
            </div>
            <p class="plan-desc">Annual membership for patron readers. Two months free + early access.</p>
            <ul class="plan-features">
              <li>✓ Everything in Monthly</li>
              <li>✓ 2 months free ($10 savings)</li>
              <li>✓ Patron badge in discussions</li>
              <li>✓ Direct editorial suggestions to Lokha</li>
            </ul>
            <a href="${CREEM_CONFIG.yearlyUrl}" class="creem-plan-btn paid-btn annual-btn" target="_blank" rel="noopener">Subscribe Yearly ($50)</a>
          </div>
        </div>

        <div class="creem-modal-footer">
          <span>🔒 Secured by <strong>Creem.io</strong> Merchant of Record. Accepts Apple Pay, Google Pay, Cards, and PayPal.</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('creem-modal-close-btn').addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    const freeBtn = document.getElementById('creem-free-btn');
    if (freeBtn) {
      freeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  }

  function openCheckoutModal() {
    createCheckoutModal();
    const modal = document.getElementById('creem-membership-modal');
    if (modal) modal.classList.add('active');
  }

  // 3. Intercept Subscribe Buttons on the page
  function attachInterceptors() {
    const subscribeLinks = document.querySelectorAll(
      'a[href="#/portal/signup"], a[href="#/portal/account/plans"], a[href*="/membership/"], .subscribe-btn, [data-creem-subscribe]'
    );

    subscribeLinks.forEach((link) => {
      // Avoid duplicate binding
      if (link.dataset.creemBound) return;
      link.dataset.creemBound = 'true';

      link.addEventListener('click', function (e) {
        // If user is already a paid member, allow normal account view
        if (document.body.classList.contains('paid-member')) return;

        e.preventDefault();
        e.stopPropagation();
        openCheckoutModal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachInterceptors);
  } else {
    attachInterceptors();
  }

  // Also listen for any dynamically added buttons or paywalls
  window.addEventListener('load', attachInterceptors);
  window.LokhaCreem = { open: openCheckoutModal };
})();
