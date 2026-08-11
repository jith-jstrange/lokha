/**
 * Lokha Pay - Universal Micro-Payment & Creator Tipping Widget
 * Provides seamless 1-click tipping & micro-royalties without exposing raw crypto wallets.
 */
(function() {
  const PG_API_BASE = window.LOKHA_PG_URL || 'https://lokha-agent-dashboard-production.up.railway.app';

  function initLokhaPay() {
    // Inject Lokha Pay Styles if not present
    if (!document.getElementById('lokha-pay-styles')) {
      const style = document.createElement('style');
      style.id = 'lokha-pay-styles';
      style.textContent = `
        .lokha-pay-box {
          background: #FFFDF8;
          border: 2px solid #C5A059;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2.5rem 0;
          text-align: center;
          box-shadow: 0 4px 14px rgba(197, 160, 89, 0.12);
        }
        .lokha-pay-title {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 800;
          color: #926E24;
          margin-bottom: 0.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .lokha-pay-desc {
          font-size: 0.9rem;
          color: #665228;
          max-width: 500px;
          margin: 0 auto 1.25rem;
          line-height: 1.5;
        }
        .lokha-pay-btn-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
        }
        .lokha-pay-chip {
          background: #FFFFFF;
          border: 1.5px solid #C5A059;
          color: #78350F;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .lokha-pay-chip:hover {
          background: #FDF6E2;
          transform: translateY(-2px);
          box-shadow: 0 3px 0 #C5A059;
        }
        .lokha-pay-main-btn {
          background: #065F46;
          color: #FFFFFF;
          border: 2px solid #044E39;
          border-radius: 8px;
          box-shadow: 0 3.5px 0 #044E39;
          padding: 0.6rem 1.4rem;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.15s ease;
        }
        .lokha-pay-main-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 0 #044E39;
        }
        .lokha-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
        }
        .lokha-modal-card {
          background: #FFFDF9;
          border: 2.5px solid #C5A059;
          border-radius: 16px;
          width: min(100%, 420px);
          padding: 2rem;
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
          position: relative;
        }
        .lokha-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6B7280;
        }
      `;
      document.head.appendChild(style);
    }

    // Attach click listeners to all Lokha Pay trigger buttons
    document.querySelectorAll('[data-lokha-pay]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const authorId = el.getAttribute('data-author-id') || 'lokhatoday';
        const authorName = el.getAttribute('data-author-name') || 'Lokha Creator';
        openPayModal(authorId, authorName);
      });
    });
  }

  function openPayModal(authorId, authorName) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'lokha-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="lokha-modal-card">
        <button class="lokha-modal-close" id="lokha-modal-close">&times;</button>
        <div style="font-size: 0.8rem; font-weight: 800; color: #926E24; letter-spacing: 0.08em; text-transform: uppercase;">⚡ LOKHA UNIVERSAL PAY</div>
        <h3 style="font-family: 'Cinzel', serif; font-size: 1.4rem; color: #111827; margin: 0.35rem 0 0.5rem;">Support ${authorName}</h3>
        <p style="font-size: 0.85rem; color: #6B7280; line-height: 1.45; margin-bottom: 1.25rem;">
          Send value-for-value micro-royalties directly through the Lokha settlement network. 85% goes directly to the author.
        </p>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.25rem;">
          <button class="lokha-pay-chip amount-opt" data-cents="10">$0.10</button>
          <button class="lokha-pay-chip amount-opt" data-cents="50" style="border-color: #065F46; background: #ECFDF5; color: #065F46;">$0.50</button>
          <button class="lokha-pay-chip amount-opt" data-cents="100">$1.00</button>
          <button class="lokha-pay-chip amount-opt" data-cents="500">$5.00</button>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <label style="font-size: 0.78rem; font-weight: 700; color: #4B5563; text-transform: uppercase;">Payment Rail</label>
          <select id="lokha-pay-rail" style="width: 100%; border: 1.5px solid #D1D5DB; border-radius: 8px; padding: 0.6rem; font-size: 0.9rem; font-weight: 600; margin-top: 0.35rem; background: #FFF;">
            <option value="card">💳 Card / Apple Pay (via Creem)</option>
            <option value="base">⚡ Base / USDC Crypto Stream</option>
            <option value="balance">💎 Lokha Reader Balance</option>
          </select>
        </div>

        <button id="btn-execute-lokha-pay" class="lokha-pay-main-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem;">
          <span>⚡</span> Pay $0.50 with Lokha Pay
        </button>

        <div id="lokha-pay-result" style="display: none; margin-top: 1rem; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; text-align: center;"></div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    let selectedCents = 50;

    modalOverlay.querySelectorAll('.amount-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        modalOverlay.querySelectorAll('.amount-opt').forEach(b => {
          b.style.background = '#FFF';
          b.style.borderColor = '#C5A059';
          b.style.color = '#78350F';
        });
        btn.style.background = '#ECFDF5';
        btn.style.borderColor = '#065F46';
        btn.style.color = '#065F46';
        selectedCents = Number(btn.getAttribute('data-cents'));
        document.getElementById('btn-execute-lokha-pay').innerHTML = `<span>⚡</span> Pay $${(selectedCents/100).toFixed(2)} with Lokha Pay`;
      });
    });

    document.getElementById('lokha-modal-close').addEventListener('click', () => modalOverlay.remove());
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.remove();
    });

    document.getElementById('btn-execute-lokha-pay').addEventListener('click', async () => {
      const rail = document.getElementById('lokha-pay-rail').value;
      const resBox = document.getElementById('lokha-pay-result');
      const actionBtn = document.getElementById('btn-execute-lokha-pay');

      actionBtn.disabled = true;
      actionBtn.innerHTML = '⏳ Processing with Lokha Gateway...';

      try {
        const res = await fetch(`${PG_API_BASE}/api/pay/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorId,
            amountCents: selectedCents,
            rail,
            paymentRef: 'client_pay_' + Date.now().toString(36)
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          resBox.style.display = 'block';
          resBox.style.background = '#D1FAE5';
          resBox.style.color = '#065F46';
          resBox.style.border = '1.5px solid #10B981';
          resBox.innerHTML = `<strong>✨ Thank you!</strong><br/>Your support of $${(selectedCents/100).toFixed(2)} was sent directly to ${authorName} via Lokha Pay!`;
          actionBtn.style.display = 'none';
        } else {
          throw new Error(data.error || 'Payment failed');
        }
      } catch (err) {
        resBox.style.display = 'block';
        resBox.style.background = '#FEE2E2';
        resBox.style.color = '#991B1B';
        resBox.style.border = '1.5px solid #EF4444';
        resBox.innerHTML = `⚠️ ${err.message}`;
        actionBtn.disabled = false;
        actionBtn.innerHTML = `<span>⚡</span> Pay $${(selectedCents/100).toFixed(2)} with Lokha Pay`;
      }
    });
  }

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLokhaPay);
  } else {
    initLokhaPay();
  }

  window.LokhaPay = { init: initLokhaPay, open: openPayModal };
})();
