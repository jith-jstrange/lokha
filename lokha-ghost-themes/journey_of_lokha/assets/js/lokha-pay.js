/**
 * Lokha Pay - Universal Micro-Payment & Creator Tipping Widget
 * Connects directly to Live Creem.io (Apple Pay / Google Pay / Card) and Base Web3.
 */
(function() {
  const PG_API_BASE = window.LOKHA_PG_URL || 'https://lokha-agent-dashboard-production.up.railway.app';

  const CREEM_TIP_PRODUCTS = {
    100: 'https://creem.io/product/prod_3hidyZZUWjLx8UuhAnC90J',
    300: 'https://creem.io/product/prod_1BjW1YBdVzoabtLT1xrts8',
    500: 'https://creem.io/product/prod_4xUgDuL8KwCrddBtbUf8O3',
    1000: 'https://creem.io/product/prod_3PNIbBuy0aX0STFmQqX6Rr'
  };

  // 1. Check for Tip Success Return
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tip_paid') === 'true') {
    showTipThankYouToast();
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  function showTipThankYouToast() {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 2rem; right: 2rem; z-index: 999999;
      background: #065F46; color: #FFFFFF; border: 2px solid #044E39;
      border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      font-family: -apple-system, sans-serif; display: flex; align-items: center; gap: 1rem;
      animation: slide-up 0.3s ease-out;
    `;
    toast.innerHTML = `
      <span style="font-size: 1.8rem;">✨</span>
      <div>
        <strong style="font-size: 1rem; display: block;">Thank You for Supporting the Author!</strong>
        <span style="font-size: 0.85rem; opacity: 0.9;">Your micro-royalty payment has been settled to the author via Lokha PG.</span>
      </div>
      <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #FFF; font-size: 1.5rem; cursor: pointer; margin-left: 0.5rem;">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 8000);
  }

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
          width: min(100%, 440px);
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

        <div style="font-size: 0.78rem; font-weight: 700; color: #4B5563; text-transform: uppercase; margin-bottom: 0.4rem;">Select Tip Amount</div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.25rem;">
          <button class="lokha-pay-chip amount-opt" data-cents="100" style="border-color: #065F46; background: #ECFDF5; color: #065F46;">$1.00</button>
          <button class="lokha-pay-chip amount-opt" data-cents="300">$3.00</button>
          <button class="lokha-pay-chip amount-opt" data-cents="500">$5.00</button>
          <button class="lokha-pay-chip amount-opt" data-cents="1000">$10.00</button>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <label style="font-size: 0.78rem; font-weight: 700; color: #4B5563; text-transform: uppercase;">Payment Rail</label>
          <select id="lokha-pay-rail" style="width: 100%; border: 1.5px solid #D1D5DB; border-radius: 8px; padding: 0.6rem; font-size: 0.9rem; font-weight: 600; margin-top: 0.35rem; background: #FFF;">
            <option value="card">💳 Card / Apple Pay (Live Creem MoR)</option>
            <option value="base">⚡ Base / USDC Crypto Stream</option>
          </select>
        </div>

        <button id="btn-execute-lokha-pay" class="lokha-pay-main-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem;">
          <span>⚡</span> Pay $1.00 with Lokha Pay &rarr;
        </button>

        <div id="crypto-qr-container" style="display: none; margin-top: 1rem; padding: 1rem; background: #F3F4F6; border-radius: 8px; font-size: 0.82rem; text-align: center;">
          <p style="font-weight: 700; color: #111827; margin-bottom: 0.35rem;">Base Network (USDC / ETH)</p>
          <p style="color: #4B5563; margin-bottom: 0.5rem;">Send on Base to Lokha PG Settlement Treasury:</p>
          <code style="background: #FFF; border: 1px solid #D1D5DB; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; word-break: break-all; display: block; margin-bottom: 0.75rem;">0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7</code>
          <button id="btn-crypto-web3-connect" style="background: #0052FF; color: #FFF; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 700; cursor: pointer;">
            🔵 Connect Web3 Wallet
          </button>
        </div>

        <div id="lokha-pay-result" style="display: none; margin-top: 1rem; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; text-align: center;"></div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    let selectedCents = 100;

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
        document.getElementById('btn-execute-lokha-pay').innerHTML = `<span>⚡</span> Pay $${(selectedCents/100).toFixed(2)} with Lokha Pay &rarr;`;
      });
    });

    const railSelect = document.getElementById('lokha-pay-rail');
    const cryptoContainer = document.getElementById('crypto-qr-container');

    railSelect.addEventListener('change', () => {
      if (railSelect.value === 'base') {
        cryptoContainer.style.display = 'block';
        document.getElementById('btn-execute-lokha-pay').innerHTML = `<span>⚡</span> Send $${(selectedCents/100).toFixed(2)} on Base`;
      } else {
        cryptoContainer.style.display = 'none';
        document.getElementById('btn-execute-lokha-pay').innerHTML = `<span>⚡</span> Pay $${(selectedCents/100).toFixed(2)} with Lokha Pay &rarr;`;
      }
    });

    document.getElementById('lokha-modal-close').addEventListener('click', () => modalOverlay.remove());
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.remove();
    });

    // Execute Payment Action
    document.getElementById('btn-execute-lokha-pay').addEventListener('click', async () => {
      const rail = railSelect.value;
      const resBox = document.getElementById('lokha-pay-result');
      const actionBtn = document.getElementById('btn-execute-lokha-pay');

      if (rail === 'card') {
        actionBtn.disabled = true;
        actionBtn.innerHTML = '🔒 Opening Live Creem Checkout...';

        const directUrl = CREEM_TIP_PRODUCTS[selectedCents] || CREEM_TIP_PRODUCTS[100];
        // Redirect reader to Real Live Creem Checkout
        window.location.href = directUrl;
        return;
      }

      if (rail === 'base') {
        if (typeof window.ethereum !== 'undefined') {
          try {
            actionBtn.innerHTML = '🦊 Requesting Web3 Approval...';
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                  from: accounts[0],
                  to: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
                  value: '0x38D7EA4C68000' // ~0.001 ETH
                }]
              });
              resBox.style.display = 'block';
              resBox.style.background = '#D1FAE5';
              resBox.style.color = '#065F46';
              resBox.innerHTML = `<strong>✨ Web3 Transaction Broadcast!</strong><br/>Tx: ${txHash.slice(0, 10)}...`;
              actionBtn.style.display = 'none';
            }
          } catch(err) {
            resBox.style.display = 'block';
            resBox.style.background = '#FEE2E2';
            resBox.style.color = '#991B1B';
            resBox.innerHTML = `⚠️ Wallet Rejected: ${err.message}`;
            actionBtn.innerHTML = `<span>⚡</span> Send $${(selectedCents/100).toFixed(2)} on Base`;
          }
        } else {
          alert('No Web3 wallet detected. Please scan the QR code / deposit address above on Base.');
        }
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
