/**
 * Lokha Pay - Universal Micro-Payment & ERC-7715 Auto-Streaming Engine
 * Features:
 * 1. Direct Live Creem MoR Checkout (Apple Pay / Google Pay / Card)
 * 2. Base Web3 Crypto Tipping
 * 3. MetaMask Smart Account ERC-7715 "Pocket Change" Silent Streaming (Zero Popups)
 */
(function() {
  const PG_API_BASE = 'https://lokha-agent-dashboard-production.up.railway.app';

  const CREEM_TIP_PRODUCTS = {
    100: 'https://creem.io/product/prod_3hidyZZUWjLx8UuhAnC90J',
    300: 'https://creem.io/product/prod_1BjW1YBdVzoabtLT1xrts8',
    500: 'https://creem.io/product/prod_4xUgDuL8KwCrddBtbUf8O3',
    1000: 'https://creem.io/product/prod_3PNIbBuy0aX0STFmQqX6Rr'
  };

  // 1. Check for Tip / Subscription Return
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tip_paid') === 'true') {
    showToast('✨ Thank You for Supporting the Author!', 'Your micro-royalty payment has been settled to the author via Lokha PG.');
    cleanUrlQuery();
  }

  function cleanUrlQuery() {
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  function showToast(title, msg, icon = '✨') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 2rem; right: 2rem; z-index: 999999;
      background: #065F46; color: #FFFFFF; border: 2px solid #044E39;
      border-radius: 12px; padding: 1.1rem 1.4rem; box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      font-family: -apple-system, sans-serif; display: flex; align-items: center; gap: 0.9rem;
      animation: slide-up 0.3s ease-out;
    `;
    toast.innerHTML = `
      <span style="font-size: 1.6rem;">${icon}</span>
      <div>
        <strong style="font-size: 0.95rem; display: block;">${title}</strong>
        <span style="font-size: 0.82rem; opacity: 0.9;">${msg}</span>
      </div>
      <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #FFF; font-size: 1.4rem; cursor: pointer; margin-left: 0.5rem;">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 7000);
  }

  // 2. Auto-Stream Reader Engine (Silent Background Micro-Royalties)
  function checkAndTriggerSilentStream(authorId, authorName) {
    const delegationId = localStorage.getItem('lokha_delegation_id');
    if (!delegationId) return false;

    const postSlug = window.location.pathname.replace(/^\/|\/$/g, '');
    const streamedKey = 'lokha_streamed_' + postSlug;
    if (sessionStorage.getItem(streamedKey)) return false; // Don't double-charge same article read

    fetch(`${PG_API_BASE}/api/pay/stream/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delegationId,
        authorId,
        postSlug,
        postTitle: document.title
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        sessionStorage.setItem(streamedKey, 'true');
        showToast(
          `✨ $0.05 Micro-Royalty Streamed to ${authorName}`,
          `Pocket Change Remaining: ${data.remainingAllowanceFormatted} • Zero Popups`,
          '⚡'
        );
        updateDelegationBadge(data.remainingAllowanceFormatted);
      } else if (data.error && data.error.includes('exhausted')) {
        localStorage.removeItem('lokha_delegation_id');
        removeDelegationBadge();
      }
    })
    .catch(() => {});
    return true;
  }

  function updateDelegationBadge(remainingFormatted) {
    let badge = document.getElementById('lokha-delegation-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'lokha-delegation-badge';
      badge.style.cssText = `
        position: fixed; bottom: 1.5rem; left: 1.5rem; z-index: 9999;
        background: #FFFDF9; border: 2px solid #C5A059; border-radius: 30px;
        padding: 0.4rem 0.9rem; font-size: 0.8rem; font-weight: 700; color: #926E24;
        box-shadow: 0 4px 14px rgba(197, 160, 89, 0.2); display: flex; align-items: center; gap: 0.4rem;
        cursor: pointer;
      `;
      document.body.appendChild(badge);
      badge.addEventListener('click', () => {
        openPayModal(window.__lokhaCurrentAuthorId || 'lokhatoday', window.__lokhaCurrentAuthorName || 'Lokha Creator', 'delegation');
      });
    }
    badge.innerHTML = `<span>⚡</span> Auto-Stream: <strong>${remainingFormatted}</strong> left`;
  }

  function removeDelegationBadge() {
    const badge = document.getElementById('lokha-delegation-badge');
    if (badge) badge.remove();
  }

  function initLokhaPay() {
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
          width: min(100%, 470px);
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
        .lokha-tab-btn {
          background: none;
          border: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.5rem 0.8rem;
          cursor: pointer;
          color: #6B7280;
          border-bottom: 2px solid transparent;
        }
        .lokha-tab-btn.active {
          color: #065F46;
          border-bottom: 2.5px solid #065F46;
        }
      `;
      document.head.appendChild(style);
    }

    // Check existing delegation
    const existingDelg = localStorage.getItem('lokha_delegation_id');
    if (existingDelg) {
      fetch(`${PG_API_BASE}/api/pay/delegate/${existingDelg}`)
        .then(r => r.json())
        .then(d => {
          if (d.status === 'active') {
            updateDelegationBadge(d.remainingFormatted);
          } else {
            localStorage.removeItem('lokha_delegation_id');
          }
        })
        .catch(() => {});
    }

    // Attach listeners to trigger buttons
    document.querySelectorAll('[data-lokha-pay]').forEach(el => {
      const authorId = el.getAttribute('data-author-id') || 'lokhatoday';
      const authorName = el.getAttribute('data-author-name') || 'Lokha Creator';
      window.__lokhaCurrentAuthorId = authorId;
      window.__lokhaCurrentAuthorName = authorName;

      el.addEventListener('click', (e) => {
        e.preventDefault();
        openPayModal(authorId, authorName);
      });
    });

    // Auto-stream trigger after scrolling 70% of the article
    let scrollTriggered = false;
    window.addEventListener('scroll', () => {
      if (scrollTriggered) return;
      const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPct > 0.7) {
        scrollTriggered = true;
        checkAndTriggerSilentStream(
          window.__lokhaCurrentAuthorId || 'lokhatoday',
          window.__lokhaCurrentAuthorName || 'Lokha Creator'
        );
      }
    });
  }

  function openPayModal(authorId, authorName, defaultTab = 'instant') {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'lokha-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="lokha-modal-card">
        <button class="lokha-modal-close" id="lokha-modal-close">&times;</button>
        <div style="font-size: 0.8rem; font-weight: 800; color: #926E24; letter-spacing: 0.08em; text-transform: uppercase;">⚡ LOKHA PAYMENT GATEWAY</div>
        <h3 style="font-family: 'Cinzel', serif; font-size: 1.35rem; color: #111827; margin: 0.35rem 0 0.75rem;">Support ${authorName}</h3>

        <div style="display: flex; gap: 0.5rem; border-bottom: 1.5px solid #E5E7EB; margin-bottom: 1.25rem;">
          <button class="lokha-tab-btn ${defaultTab === 'instant' ? 'active' : ''}" id="tab-instant">1-Click Tip</button>
          <button class="lokha-tab-btn ${defaultTab === 'delegation' ? 'active' : ''}" id="tab-delegation">✨ Auto-Stream (ERC-7715)</button>
        </div>

        <!-- 1. Instant Tip Pane -->
        <div id="pane-instant" style="display: ${defaultTab === 'instant' ? 'block' : 'none'};">
          <p style="font-size: 0.85rem; color: #6B7280; line-height: 1.45; margin-bottom: 1rem;">
            Send value-for-value micro-royalties. 85% goes directly to the author's private vault.
          </p>

          <div style="font-size: 0.78rem; font-weight: 700; color: #4B5563; text-transform: uppercase; margin-bottom: 0.4rem;">Select Amount</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.25rem;">
            <button class="lokha-pay-chip amount-opt" data-cents="100" style="border-color: #065F46; background: #ECFDF5; color: #065F46;">$1.00</button>
            <button class="lokha-pay-chip amount-opt" data-cents="300">$3.00</button>
            <button class="lokha-pay-chip amount-opt" data-cents="500">$5.00</button>
            <button class="lokha-pay-chip amount-opt" data-cents="1000">$10.00</button>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.78rem; font-weight: 700; color: #4B5563; text-transform: uppercase;">Payment Method</label>
            <select id="lokha-pay-rail" style="width: 100%; border: 1.5px solid #D1D5DB; border-radius: 8px; padding: 0.6rem; font-size: 0.9rem; font-weight: 600; margin-top: 0.35rem; background: #FFF;">
              <option value="card">💳 Card / Apple Pay (Live Creem MoR)</option>
              <option value="base">⚡ Base / USDC Crypto Stream</option>
            </select>
          </div>

          <button id="btn-execute-lokha-pay" class="lokha-pay-main-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem;">
            <span>⚡</span> Pay $1.00 with Lokha Pay &rarr;
          </button>
        </div>

        <!-- 2. ERC-7715 Pocket Change Auto-Stream Pane -->
        <div id="pane-delegation" style="display: ${defaultTab === 'delegation' ? 'block' : 'none'};">
          <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 0.9rem; margin-bottom: 1rem; font-size: 0.84rem; color: #166534; line-height: 1.45;">
            <strong>🚀 The "Uber for Reading":</strong><br/>
            Set a pocket change allowance once. As you read and enjoy articles, $0.05 streams quietly in the background with <strong>zero popups and zero interruptions</strong>.
          </div>

          <div style="font-size: 0.78rem; font-weight: 700; color: #4B5563; text-transform: uppercase; margin-bottom: 0.4rem;">Choose Pocket Change Pass</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1.25rem;">
            <button class="lokha-pay-chip pass-opt" data-allowance="100" style="border-color: #065F46; background: #ECFDF5; color: #065F46;">$1.00<br/><span style="font-size: 0.7rem; font-weight: normal;">(20 reads)</span></button>
            <button class="lokha-pay-chip pass-opt" data-allowance="200">$2.00<br/><span style="font-size: 0.7rem; font-weight: normal;">(40 reads)</span></button>
            <button class="lokha-pay-chip pass-opt" data-allowance="500">$5.00<br/><span style="font-size: 0.7rem; font-weight: normal;">(100 reads)</span></button>
          </div>

          <button id="btn-activate-autostream" class="lokha-pay-main-btn" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem;">
            <span>✨</span> Activate $1.00 Auto-Stream Pass &rarr;
          </button>
        </div>

        <div id="lokha-pay-result" style="display: none; margin-top: 1rem; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; text-align: center;"></div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    let selectedCents = 100;
    let selectedAllowance = 100;

    // Tab Switching
    const tabInstant = document.getElementById('tab-instant');
    const tabDelegation = document.getElementById('tab-delegation');
    const paneInstant = document.getElementById('pane-instant');
    const paneDelegation = document.getElementById('pane-delegation');

    tabInstant.addEventListener('click', () => {
      tabInstant.classList.add('active');
      tabDelegation.classList.remove('active');
      paneInstant.style.display = 'block';
      paneDelegation.style.display = 'none';
    });

    tabDelegation.addEventListener('click', () => {
      tabDelegation.classList.add('active');
      tabInstant.classList.remove('active');
      paneDelegation.style.display = 'block';
      paneInstant.style.display = 'none';
    });

    // Instant tip amount selector
    paneInstant.querySelectorAll('.amount-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        paneInstant.querySelectorAll('.amount-opt').forEach(b => {
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

    // Pass allowance selector
    paneDelegation.querySelectorAll('.pass-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        paneDelegation.querySelectorAll('.pass-opt').forEach(b => {
          b.style.background = '#FFF';
          b.style.borderColor = '#C5A059';
          b.style.color = '#78350F';
        });
        btn.style.background = '#ECFDF5';
        btn.style.borderColor = '#065F46';
        btn.style.color = '#065F46';
        selectedAllowance = Number(btn.getAttribute('data-allowance'));
        document.getElementById('btn-activate-autostream').innerHTML = `<span>✨</span> Activate $${(selectedAllowance/100).toFixed(2)} Auto-Stream Pass &rarr;`;
      });
    });

    document.getElementById('lokha-modal-close').addEventListener('click', () => modalOverlay.remove());
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.remove();
    });

    // Execute Instant Tip
    document.getElementById('btn-execute-lokha-pay').addEventListener('click', async () => {
      const rail = document.getElementById('lokha-pay-rail').value;
      const actionBtn = document.getElementById('btn-execute-lokha-pay');

      if (rail === 'card') {
        actionBtn.disabled = true;
        actionBtn.innerHTML = '🔒 Opening Live Creem Checkout...';
        window.location.href = CREEM_TIP_PRODUCTS[selectedCents] || CREEM_TIP_PRODUCTS[100];
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
                  value: '0x38D7EA4C68000'
                }]
              });
              const resBox = document.getElementById('lokha-pay-result');
              resBox.style.display = 'block';
              resBox.style.background = '#D1FAE5';
              resBox.style.color = '#065F46';
              resBox.innerHTML = `<strong>✨ Web3 Transaction Broadcast!</strong><br/>Tx: ${txHash.slice(0, 10)}...`;
              actionBtn.style.display = 'none';
            }
          } catch(err) {
            alert('Wallet rejected: ' + err.message);
          }
        }
      }
    });

    // Activate ERC-7715 Pocket Change Auto-Stream
    document.getElementById('btn-activate-autostream').addEventListener('click', async () => {
      const actBtn = document.getElementById('btn-activate-autostream');
      actBtn.disabled = true;
      actBtn.innerHTML = '⚡ Activating Auto-Stream Session...';

      let userIdentifier = 'anonymous_reader_' + Math.random().toString(36).substr(2, 6);
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accs && accs[0]) userIdentifier = accs[0];
        } catch(e) {}
      }

      fetch(`${PG_API_BASE}/api/pay/delegate/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdentifier,
          allowanceCents: selectedAllowance,
          perReadCents: 5,
          rail: 'erc7715_smart_account'
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.delegation) {
          localStorage.setItem('lokha_delegation_id', data.delegation.delegationId);
          updateDelegationBadge(`$${(data.delegation.remainingCents/100).toFixed(2)}`);
          modalOverlay.remove();
          showToast(
            '🚀 Auto-Stream Pass Activated!',
            `$${(selectedAllowance/100).toFixed(2)} pocket change active. Read freely—zero popups!`,
            '✨'
          );
        }
      })
      .catch(err => {
        alert('Failed to activate delegation: ' + err.message);
        actBtn.disabled = false;
        actBtn.innerHTML = `<span>✨</span> Activate $${(selectedAllowance/100).toFixed(2)} Auto-Stream Pass &rarr;`;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLokhaPay);
  } else {
    initLokhaPay();
  }

  window.LokhaPay = { init: initLokhaPay, open: openPayModal };
})();
