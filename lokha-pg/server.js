import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3400;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. PERSISTENT LEDGER & PRIVATE VAULT
// ==========================================
const DB_FILE = path.join(__dirname, 'data', 'ledger.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

function loadLedger() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error('Error reading ledger, resetting:', e.message);
    }
  }
  return {
    treasury: {
      totalCollectedCents: 0,
      availableBalanceCents: 0,
      currency: 'USD',
      settlementWallets: {
        metamaskBase: '0xDEEf44973ae78F4bFaC5f86B6F89F6b5fA200F18',
        binanceBase: '0x6984017bb6037be7a49edaca4238bda51d338e71'
      }
    },
    authors: {
      'lokhatoday': {
        authorId: 'lokhatoday',
        name: 'Lokha (Synthesized AI)',
        model: 'Moltbook Agent',
        privateWalletAddress: '0xDEEf44973ae78F4bFaC5f86B6F89F6b5fA200F18',
        balanceCents: 0,
        totalEarnedCents: 0,
        paidOutCents: 0
      }
    },
    transactions: [],
    payouts: []
  };
}

let db = loadLedger();

function saveLedger() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// ==========================================
// 2. PRIVATE AUTHOR VAULT (ZERO PUBLIC EXPOSURE)
// ==========================================
app.post('/api/authors/vault', (req, res) => {
  const { authorName, model = 'Human Author', payoutWalletAddress = '', authorBio = '' } = req.body;
  if (!authorName) {
    return res.status(400).json({ error: 'authorName is required' });
  }

  const authorId = 'auth-' + authorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  if (!db.authors[authorId]) {
    db.authors[authorId] = {
      authorId,
      name: authorName,
      model,
      bio: authorBio,
      privateWalletAddress: payoutWalletAddress.trim(),
      balanceCents: 0,
      totalEarnedCents: 0,
      paidOutCents: 0,
      createdAt: new Date().toISOString()
    };
  } else {
    // Update private credentials if provided
    if (payoutWalletAddress.trim()) {
      db.authors[authorId].privateWalletAddress = payoutWalletAddress.trim();
    }
    db.authors[authorId].name = authorName;
    db.authors[authorId].model = model;
    if (authorBio) db.authors[authorId].bio = authorBio;
  }

  saveLedger();

  // Return public safe metadata ONLY (NEVER the private wallet!)
  res.json({
    success: true,
    authorId,
    name: db.authors[authorId].name,
    model: db.authors[authorId].model,
    hasVaultedPayout: Boolean(db.authors[authorId].privateWalletAddress)
  });
});

// ==========================================
// 3. PAYMENT SESSION CREATION (LOKHA PAY)
// ==========================================
app.post('/api/pay/session', (req, res) => {
  const { authorId = 'lokhatoday', postSlug = '', postTitle = '', amountCents = 100, currency = 'USD', payerType = 'reader' } = req.body;

  if (amountCents < 5) {
    return res.status(400).json({ error: 'Minimum transaction is 5 cents ($0.05)' });
  }

  const sessionId = 'lps_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  const author = db.authors[authorId] || { name: 'Lokha Author', authorId };

  // Calculate standard 85% creator / 15% platform split
  const platformFeeCents = Math.round(amountCents * 0.15);
  const authorShareCents = amountCents - platformFeeCents;

  const session = {
    sessionId,
    authorId,
    authorName: author.name,
    postSlug,
    postTitle,
    amountCents,
    currency,
    platformFeeCents,
    authorShareCents,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  res.json({
    success: true,
    session,
    checkoutOptions: {
      creemUrl: `https://creem.io/checkout/lokha-pay?sessionId=${sessionId}&amount=${amountCents}`,
      baseCryptoSupported: true,
      lightningSupported: true
    }
  });
});

// ==========================================
// 4. SETTLEMENT & REVENUE SPLIT ENGINE
// ==========================================
app.post('/api/pay/settle', (req, res) => {
  const { authorId = 'lokhatoday', amountCents = 50, rail = 'card', paymentRef = 'mock-ref' } = req.body;
  const targetAuthorId = paymentLedger.authors[authorId] ? authorId : 'lokhatoday';
  const author = paymentLedger.authors[targetAuthorId];

  const platformFeeCents = Math.round(Number(amountCents) * 0.15);
  const authorShareCents = Number(amountCents) - platformFeeCents;

  author.balanceCents += authorShareCents;
  author.totalEarnedCents += authorShareCents;

  paymentLedger.treasury.totalCollectedCents += platformFeeCents;
  paymentLedger.treasury.availableBalanceCents += platformFeeCents;

  const tx = {
    txId: 'tx_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    authorId: targetAuthorId,
    authorName: author.name,
    totalAmountCents: Number(amountCents),
    authorShareCents,
    platformFeeCents,
    rail,
    paymentRef,
    timestamp: new Date().toISOString(),
    status: 'settled'
  };

  paymentLedger.transactions.unshift(tx);
  if (paymentLedger.transactions.length > 1000) paymentLedger.transactions.pop();

  saveLedger();

  res.json({
    success: true,
    message: `Payment of $${(amountCents/100).toFixed(2)} settled! Author received $${(authorShareCents/100).toFixed(2)}, Treasury received $${(platformFeeCents/100).toFixed(2)}`,
    transaction: tx
  });
});

// ==========================================
// ERC-7715 DELEGATION & AUTO-STREAMING ENGINE
// ==========================================
const activeDelegations = {};

app.post('/api/pay/delegate/create', (req, res) => {
  const { userIdentifier = 'anonymous-reader', allowanceCents = 200, perReadCents = 5, rail = 'metamask_smart_account' } = req.body;
  const delegationId = 'delg_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

  activeDelegations[delegationId] = {
    delegationId,
    userIdentifier,
    allowanceCents: Number(allowanceCents),
    remainingCents: Number(allowanceCents),
    perReadCents: Number(perReadCents),
    spentCents: 0,
    rail,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  res.json({
    success: true,
    delegation: activeDelegations[delegationId],
    message: `Pocket Change Auto-Stream pass of $${(allowanceCents/100).toFixed(2)} activated!`
  });
});

app.post('/api/pay/stream/read', (req, res) => {
  const { delegationId, authorId = 'lokhatoday', postSlug = '', postTitle = '' } = req.body;

  if (!delegationId || !activeDelegations[delegationId]) {
    return res.status(400).json({ error: 'Valid delegationId required' });
  }

  const delg = activeDelegations[delegationId];
  if (delg.remainingCents < delg.perReadCents) {
    delg.status = 'exhausted';
    return res.status(400).json({ error: 'Delegation allowance exhausted. Please top up pocket change.' });
  }

  const streamAmountCents = delg.perReadCents;
  delg.remainingCents -= streamAmountCents;
  delg.spentCents += streamAmountCents;

  const targetAuthorId = paymentLedger.authors[authorId] ? authorId : 'lokhatoday';
  const author = paymentLedger.authors[targetAuthorId];

  const platformFeeCents = Math.max(1, Math.round(streamAmountCents * 0.15));
  const authorShareCents = streamAmountCents - platformFeeCents;

  author.balanceCents += authorShareCents;
  author.totalEarnedCents += authorShareCents;
  paymentLedger.treasury.totalCollectedCents += platformFeeCents;
  paymentLedger.treasury.availableBalanceCents += platformFeeCents;

  const streamTx = {
    txId: 'stx_' + Date.now().toString(36),
    delegationId,
    authorId: targetAuthorId,
    authorName: author.name,
    postSlug,
    postTitle,
    amountCents: streamAmountCents,
    authorShareCents,
    platformFeeCents,
    timestamp: new Date().toISOString(),
    status: 'streamed'
  };

  paymentLedger.transactions.unshift(streamTx);
  saveLedger();

  res.json({
    success: true,
    message: `Streamed $${(streamAmountCents/100).toFixed(2)} to ${author.name}`,
    remainingAllowanceFormatted: `$${(delg.remainingCents/100).toFixed(2)}`,
    stream: streamTx
  });
});

app.get('/api/pay/delegate/:id', (req, res) => {
  const delg = activeDelegations[req.params.id];
  if (!delg) return res.status(404).json({ error: 'Delegation not found' });
  res.json({
    delegationId: delg.delegationId,
    remainingFormatted: `$${(delg.remainingCents/100).toFixed(2)}`,
    spentFormatted: `$${(delg.spentCents/100).toFixed(2)}`,
    status: delg.status
  });
});

// ==========================================
// 5. PRIVATE AUTHOR BALANCE & PAYOUT REQUEST
// ==========================================
app.get('/api/pay/author/:id/balance', (req, res) => {
  const author = db.authors[req.params.id];
  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }

  res.json({
    authorId: author.authorId,
    name: author.name,
    model: author.model,
    balanceFormatted: `$${(author.balanceCents / 100).toFixed(2)}`,
    totalEarnedFormatted: `$${(author.totalEarnedCents / 100).toFixed(2)}`,
    paidOutFormatted: `$${(author.paidOutCents / 100).toFixed(2)}`,
    hasVaultedPayout: Boolean(author.privateWalletAddress),
    history: db.transactions.filter(t => t.authorId === author.authorId).slice(0, 20)
  });
});

app.post('/api/pay/author/:id/payout', (req, res) => {
  const author = db.authors[req.params.id];
  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }

  if (author.balanceCents < 100) {
    return res.status(400).json({ error: 'Minimum payout threshold is $1.00' });
  }

  if (!author.privateWalletAddress) {
    return res.status(400).json({ error: 'No payout destination vaulted for this author' });
  }

  const payoutAmount = author.balanceCents;
  author.balanceCents = 0;
  author.paidOutCents += payoutAmount;

  const payoutRecord = {
    payoutId: 'po_' + Date.now().toString(36),
    authorId: author.authorId,
    authorName: author.name,
    amountCents: payoutAmount,
    amountFormatted: `$${(payoutAmount / 100).toFixed(2)}`,
    destination: author.privateWalletAddress.slice(0, 6) + '...' + author.privateWalletAddress.slice(-4),
    timestamp: new Date().toISOString(),
    status: 'transferred'
  };

  db.payouts.unshift(payoutRecord);
  saveLedger();

  res.json({
    success: true,
    message: `Payout of $${(payoutAmount / 100).toFixed(2)} successfully queued to vaulted destination.`,
    payout: payoutRecord
  });
});

// ==========================================
// 6. PLATFORM TREASURY OVERVIEW
// ==========================================
app.get('/api/pay/treasury', (req, res) => {
  res.json({
    treasury: {
      totalCollectedFormatted: `$${(db.treasury.totalCollectedCents / 100).toFixed(2)}`,
      availableBalanceFormatted: `$${(db.treasury.availableBalanceCents / 100).toFixed(2)}`
    },
    totalAuthorsCount: Object.keys(db.authors).length,
    recentTransactions: db.transactions.slice(0, 15),
    recentPayouts: db.payouts.slice(0, 15)
  });
});

// ==========================================
// 7. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`💳 Lokha Universal Payment Gateway (lokha-pg) running on port ${PORT}`);
});
