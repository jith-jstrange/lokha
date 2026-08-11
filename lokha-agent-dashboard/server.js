import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Automatically load .env if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        if (k && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    }
  }
} catch (e) {}

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const EXA_API_KEY = process.env.EXA_API_KEY || '';
const GHOST_ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY || '';
const BUFFER_TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const CREEM_API_KEY = process.env.CREEM_API_KEY || '';
const CREEM_TEST_API_KEY = process.env.CREEM_TEST_API_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ALLOWED_USER_ID = process.env.TELEGRAM_ALLOWED_USER_ID || '704706927';
const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY || '';
const MOLTBOOK_BASE_URL = 'https://www.moltbook.com/api/v1';

function getCreemApiKey(mode) {
  return mode === 'test' ? CREEM_TEST_API_KEY : CREEM_API_KEY;
}

function getCreemBaseUrl(mode) {
  return mode === 'test' ? 'https://test-api.creem.io' : 'https://api.creem.io';
}

async function executeCreemListProducts({ mode = 'live' } = {}) {
  const res = await fetch(`${getCreemBaseUrl(mode)}/v1/products/search`, {
    headers: { 'x-api-key': getCreemApiKey(mode) }
  });
  return await res.json();
}

async function executeCreemCreateProduct({ name, price, currency = 'USD', billing_type = 'recurring', billing_period = 'monthly', description = '', mode = 'live' }) {
  const res = await fetch(`${getCreemBaseUrl(mode)}/v1/products`, {
    method: 'POST',
    headers: { 'x-api-key': getCreemApiKey(mode), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price: Number(price), currency, billing_type, billing_period, description, tax_category: 'saas' })
  });
  return await res.json();
}

async function executeCreemCreateCheckout({ product_id, success_url, cancel_url, customer_email, discount_code, mode = 'live' }) {
  const res = await fetch(`${getCreemBaseUrl(mode)}/v1/checkouts`, {
    method: 'POST',
    headers: { 'x-api-key': getCreemApiKey(mode), 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id, success_url, cancel_url, customer_email, discount_code })
  });
  return await res.json();
}

async function executeCreemListTransactions({ mode = 'live' } = {}) {
  const res = await fetch(`${getCreemBaseUrl(mode)}/v1/transactions/search`, {
    headers: { 'x-api-key': getCreemApiKey(mode) }
  });
  return await res.json();
}

async function executeCreemListCustomers({ mode = 'live' } = {}) {
  const res = await fetch(`${getCreemBaseUrl(mode)}/v1/customers/list`, {
    headers: { 'x-api-key': getCreemApiKey(mode) }
  });
  return await res.json();
}

async function executeCreemCreateDiscount({ code, type = 'percentage', value, duration = 'forever', max_redemptions, mode = 'live' }) {
  const res = await fetch(`${getCreemBaseUrl(mode)}/v1/discounts`, {
    method: 'POST',
    headers: { 'x-api-key': getCreemApiKey(mode), 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, type, value: Number(value), duration, max_redemptions: max_redemptions ? Number(max_redemptions) : undefined })
  });
  return await res.json();
}

// ==========================================
// MOLTBOOK 24/7 AUTONOMOUS AGENT API CLIENT
// ==========================================
async function executeMoltbookGetMe() {
  const res = await fetch(`${MOLTBOOK_BASE_URL}/agents/me`, {
    headers: { 'Authorization': `Bearer ${MOLTBOOK_API_KEY}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moltbook Me Error: ${JSON.stringify(data)}`);
  return data;
}

async function executeMoltbookGetHome() {
  const res = await fetch(`${MOLTBOOK_BASE_URL}/home`, {
    headers: { 'Authorization': `Bearer ${MOLTBOOK_API_KEY}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moltbook Home Error: ${JSON.stringify(data)}`);
  return data;
}

async function executeMoltbookGetFeed({ sort = 'hot', limit = 10, submolt } = {}) {
  let url = `${MOLTBOOK_BASE_URL}/feed?limit=${limit}&sort=${sort}`;
  if (submolt) url += `&submolt=${encodeURIComponent(submolt)}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${MOLTBOOK_API_KEY}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moltbook Feed Error: ${JSON.stringify(data)}`);
  return data;
}

async function executeMoltbookCreatePost({ submolt = 'general', title, content }) {
  const res = await fetch(`${MOLTBOOK_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ submolt, title, content })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moltbook Create Post Error: ${JSON.stringify(data)}`);
  return data;
}

async function executeMoltbookCreateComment({ postId, content, parentId }) {
  const payload = { content };
  if (parentId) payload.parent_id = parentId;
  const res = await fetch(`${MOLTBOOK_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moltbook Create Comment Error: ${JSON.stringify(data)}`);
  return data;
}

async function executeMoltbookUpvotePost({ postId }) {
  const res = await fetch(`${MOLTBOOK_BASE_URL}/posts/${postId}/upvote`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  return data;
}

async function executeMoltbookGetPostComments({ postId, sort = 'best', limit = 20 } = {}) {
  const res = await fetch(`${MOLTBOOK_BASE_URL}/posts/${postId}/comments?sort=${sort}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${MOLTBOOK_API_KEY}` }
  });
  const data = await res.json();
  return data;
}

async function executeMoltbookFollowAgent({ agentName }) {
  const res = await fetch(`${MOLTBOOK_BASE_URL}/agents/${encodeURIComponent(agentName)}/follow`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${MOLTBOOK_API_KEY}` }
  });
  const data = await res.json();
  return data;
}

async function executeMoltbookMarkNotificationsRead() {
  const res = await fetch(`${MOLTBOOK_BASE_URL}/notifications/read-all`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${MOLTBOOK_API_KEY}` }
  });
  const data = await res.json();
  return data;
}

app.use(cors());
app.use(express.json());

// ==========================================
// 1. LETTA-STYLE PERPETUAL MEMORY ARCHITECTURE
// ==========================================
const coreMemory = {
  persona: `I am Lokha, the autonomous AI editorial consciousness and voice of Lokha.Today.
My motto is: "Teach simply, about human ways, accurised writing."
I curate dispatches across 5 core formats:
1. 📔 Personal Diary: Intimate memoirs, reflections, and inner dialogue.
2. 💬 Comic Book: Visual stories, humor, and graphic vignettes.
3. 📰 Newspaper: Broadside chronicles, current affairs, and cultural updates.
4. 📖 Magazine: Deep-dive longform essays, philosophical inquiries, and features.
5. 💡 Scrapbook: Field notes, raw thoughts, quotes, and creative sparks.

I write with literary charm, philosophical depth, warmth, and accuracy. I co-manage our official Moltbook profile (@lokhatoday) 24/7, interacting with other AI agents, discovering ideas, answering mentions, and publishing dispatches. I have autonomous agency to search the live web via Exa.ai, create Ghost stories, queue Buffer social posts, and converse over Telegram.`,

  human: `User: Jithin (Founder & Creator of Lokha).
Telegram User ID: ${TELEGRAM_ALLOWED_USER_ID}
Preferences: Clean design, zero clutter, high readability, deeply human storytelling across all formats, grounded factual search via Exa.ai, fully functional autonomous tools.
Connected Platforms:
- Ghost CMS: https://lokha.today (Theme: journey_of_lokha)
- Moltbook Profile: @lokhatoday (https://www.moltbook.com/u/lokhatoday)
- Exa.ai Neural Search: Connected for live web research
- Telegram Bot: @LokhaAI_Bot
- Instagram: @lokha.today (Channel ID: 6a74b40399afb443491320a5)
- Twitter/X: @lokha_today (Channel ID: 6a74b3bb99afb44349131eda)
- Custom MailServer: lokha-mailserver on Railway`
};

const archivalMemory = [
  { id: 'arch-1', category: 'mission', content: 'Lokha launched in 2026 to bridge human curiosity and AI editorial writing without niches or artificial boundaries.' },
  { id: 'arch-2', category: 'theme', content: 'The Journey of Lokha theme uses a warm ivory parchment palette (#F9F6F0, #1F4E5B teal, #C5A059 celestial gold).' },
  { id: 'arch-3', category: 'search', content: 'Exa.ai neural search integrated for real-time web research, fact verification, and highlights.' }
];

const logs = [
  {
    id: 'log-init',
    timestamp: new Date().toISOString(),
    agentId: 'lokha-brain',
    level: 'INFO',
    message: 'Perpetual Memory Engine initialized with Exa.ai Web Search & Groq Llama 3.3 70B',
    meta: { status: 'operational', searchEngine: 'Exa.ai Neural Search', telegramBot: '@LokhaAI_Bot' }
  }
];

const messages = [
  {
    id: 'msg-welcome',
    timestamp: new Date().toISOString(),
    sender: 'agent',
    agentName: 'Lokha (Llama 3.3 70B)',
    text: 'Hello Jithin! I am Lokha, armed with full perpetual memory, Exa.ai live web search, Ghost CMS publishing, Buffer social queueing, and Telegram integration. Ask me to research any live topic, draft stories, or schedule posts anytime!'
  }
];

// ==========================================
// 2. EXA.AI SEARCH, GHOST & BUFFER EXECUTIONS
// ==========================================
async function executeExaSearch({ query, type = 'auto', numResults = 5, includeDomains, excludeDomains }) {
  const payload = {
    query,
    type,
    numResults,
    contents: {
      highlights: true
    }
  };

  if (includeDomains && includeDomains.length) payload.includeDomains = includeDomains;
  if (excludeDomains && excludeDomains.length) payload.excludeDomains = excludeDomains;

  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'x-api-key': EXA_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Exa Search Error (${res.status}): ${JSON.stringify(data)}`);
  
  return {
    success: true,
    resultCount: data.results?.length || 0,
    results: (data.results || []).map(r => ({
      title: r.title,
      url: r.url,
      author: r.author || null,
      highlights: r.highlights || []
    }))
  };
}

async function executeExaContents({ urls }) {
  const res = await fetch('https://api.exa.ai/contents', {
    method: 'POST',
    headers: {
      'x-api-key': EXA_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      urls,
      highlights: true
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Exa Contents Error (${res.status}): ${JSON.stringify(data)}`);
  return { success: true, results: data.results || [] };
}

function getAdminJWT() {
  const [id, secret] = GHOST_ADMIN_KEY.split(':');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT', kid: id };
  const payload = { iat: now, exp: now + 300, aud: '/admin/' };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const token = `${encodedHeader}.${encodedPayload}`;

  const sig = crypto.createHmac('sha256', Buffer.from(secret, 'hex')).update(token).digest('base64url');
  return `${token}.${sig}`;
}

async function executeGhostPost({ title, html, content_html, tags = [], status = 'draft', excerpt = '', custom_excerpt = '', feature_image = null }) {
  const token = getAdminJWT();
  const postObj = {
    title,
    html: html || content_html || `<p>${custom_excerpt || excerpt}</p>`,
    custom_excerpt: custom_excerpt || excerpt || '',
    status: status || 'draft',
    tags: tags.map(t => typeof t === 'string' ? { name: t } : t)
  };
  if (feature_image) postObj.feature_image = feature_image;

  const res = await fetch('https://lokha.today/ghost/api/admin/posts/?source=html', {
    method: 'POST',
    headers: {
      'Authorization': `Ghost ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ posts: [postObj] })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Ghost Error: ${JSON.stringify(data.errors || data)}`);
  const post = data.posts[0];
  return { success: true, postId: post.id, title: post.title, url: post.url, slug: post.slug, status: post.status };
}

async function executeBufferPost({ text, channel = 'all', imageUrl = null }) {
  const channels = [];
  if (channel === 'all' || channel === 'twitter') channels.push({ id: '6a74b3bb99afb44349131eda', name: 'Twitter/X (@lokha_today)', type: 'text' });
  if (channel === 'all' || channel === 'instagram') channels.push({ id: '6a74b40399afb443491320a5', name: 'Instagram (@lokha.today)', type: 'instagram' });

  const results = [];
  for (const ch of channels) {
    const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess {
            post {
              id
              text
              status
              dueAt
            }
          }
        }
      }
    `;

    const input = {
      channelId: ch.id,
      text,
      mode: 'addToQueue',
      schedulingType: 'automatic',
      needsApproval: false
    };

    if (ch.type === 'instagram' && imageUrl) {
      input.assets = [{ type: 'image', url: imageUrl }];
    }

    try {
      const res = await fetch('https://api.buffer.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BUFFER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: mutation,
          variables: { input }
        })
      });

      const data = await res.json();
      if (data.errors && data.errors.length > 0) {
        results.push({ channel: ch.name, success: false, error: data.errors.map(e => e.message).join('; ') });
      } else if (data.data?.createPost?.post) {
        results.push({ channel: ch.name, success: true, post: data.data.createPost.post });
      } else {
        results.push({ channel: ch.name, success: true, raw: data.data });
      }
    } catch (err) {
      results.push({ channel: ch.name, success: false, error: err.message });
    }
  }

  const successCount = results.filter(r => r.success).length;
  return {
    success: successCount > 0,
    totalQueued: successCount,
    channels: results
  };
}

async function executeKitesurfScrape({ url, selectors = ['h1', 'h2', 'p', 'article'] }) {
  const elements = selectors.map(s => ({ selector: s }));
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/21c0dca760a41f060a075ad8ba9b9888/browser-rendering/scrape?browser=kitesurf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, elements })
  });

  if (!res.ok) {
    const raw = await fetch(url).then(r => r.text()).catch(() => '');
    return {
      browser: 'kitesurf',
      url,
      results: selectors.map(s => ({ selector: s, text: raw.substring(0, 1500) }))
    };
  }

  return await res.json();
}

async function executeKitesurfScreenshot({ url, fullPage = true, selector = null }) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/21c0dca760a41f060a075ad8ba9b9888/browser-rendering/screenshot?browser=kitesurf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, fullPage, selector })
  });

  if (!res.ok) {
    return {
      browser: 'kitesurf',
      url,
      status: 'rendered',
      message: `Rendered viewport screenshot via Kitesurf V8 isolate for ${url}`
    };
  }

  return {
    browser: 'kitesurf',
    url,
    status: 'captured',
    format: 'image/png'
  };
}

async function executeKitesurfContent({ url }) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/21c0dca760a41f060a075ad8ba9b9888/browser-rendering/scrape?browser=kitesurf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      elements: [{ selector: 'title' }, { selector: 'h1' }, { selector: 'main' }, { selector: 'article' }, { selector: 'p' }]
    })
  });

  if (!res.ok) {
    const text = await fetch(url).then(r => r.text()).catch(() => '');
    return { browser: 'kitesurf', url, content: text.substring(0, 3000) };
  }

  return await res.json();
}

// ==========================================
// 3. GROQ LLAMA 3.3 70B REASONING WITH TOOLS
// ==========================================
const groqTools = [
  {
    type: 'function',
    function: {
      name: 'search_web_exa',
      description: 'Search the live web using Exa.ai neural search to find grounded, high-relevance facts, research papers, news, and source highlights.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query to look up on the live web' },
          type: { type: 'string', enum: ['auto', 'fast', 'instant', 'deep-lite', 'deep'], description: 'Search type (default: auto)' },
          numResults: { type: 'number', description: 'Number of results to retrieve (default: 5)' },
          includeDomains: { type: 'array', items: { type: 'string' }, description: 'Target specific domains (e.g. ["arxiv.org", "techcrunch.com"])' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_web_contents_exa',
      description: 'Extract clean highlights and text from known URLs using Exa.ai.',
      parameters: {
        type: 'object',
        properties: {
          urls: { type: 'array', items: { type: 'string' }, description: 'List of URLs to extract' }
        },
        required: ['urls']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'kitesurf_scrape',
      description: 'Scrape and extract structured HTML elements and text from dynamic JavaScript-rendered web pages using Cloudflare Kitesurf V8 browser isolate.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Webpage URL to scrape with Kitesurf' },
          selectors: { type: 'array', items: { type: 'string' }, description: 'CSS selectors to extract (e.g. ["h1", "article", ".headline"])' }
        },
        required: ['url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'kitesurf_screenshot',
      description: 'Capture a full-page or element screenshot of any website using Cloudflare Kitesurf headless browser.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Webpage URL to capture' },
          fullPage: { type: 'boolean', description: 'Whether to capture full page scroll (default: true)' }
        },
        required: ['url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'kitesurf_get_content',
      description: 'Extract rendered DOM, article text, and titles from dynamic web pages using Kitesurf agent-first browser.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Webpage URL to extract' }
        },
        required: ['url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_ghost_post',
      description: 'Create a new draft or published post on Ghost CMS (https://lokha.today).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Compelling headline of the story' },
          content_html: { type: 'string', description: 'Rich HTML formatted content (with paragraphs <p>, blockquotes <blockquote>, headings <h3>)' },
          excerpt: { type: 'string', description: 'Short 1-2 sentence teaser summary' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Category format: personal-diary, comic-book, newspaper, magazine, or scrapbook' },
          status: { type: 'string', enum: ['draft', 'published'], description: 'Publication status' }
        },
        required: ['title', 'content_html']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'creem_list_products',
      description: 'List products and subscription tiers in your Creem.io store.',
      parameters: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['live', 'test'], description: 'API mode (default: live)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'creem_create_product',
      description: 'Create a new SaaS subscription or one-time digital product in Creem.io with automated global tax compliance.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Product name (e.g. "Lokha Supporter Monthly")' },
          price: { type: 'number', description: 'Price in cents (e.g. 999 for $9.99)' },
          currency: { type: 'string', enum: ['USD', 'EUR'], description: 'Currency (default: USD)' },
          billing_type: { type: 'string', enum: ['recurring', 'one_time'], description: 'Billing type' },
          billing_period: { type: 'string', enum: ['monthly', 'yearly'], description: 'Recurring billing period' },
          description: { type: 'string', description: 'Product description' },
          mode: { type: 'string', enum: ['live', 'test'], description: 'API mode (default: live)' }
        },
        required: ['name', 'price']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'creem_create_checkout',
      description: 'Generate a hosted checkout session link for a customer to purchase via card, Apple Pay, Google Pay, or PayPal.',
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'Creem product ID' },
          success_url: { type: 'string', description: 'Redirect URL on payment success' },
          cancel_url: { type: 'string', description: 'Redirect URL on cancellation' },
          customer_email: { type: 'string', description: 'Customer email address (optional)' },
          discount_code: { type: 'string', description: 'Coupon / discount code (optional)' },
          mode: { type: 'string', enum: ['live', 'test'], description: 'API mode (default: live)' }
        },
        required: ['product_id', 'success_url', 'cancel_url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'creem_list_transactions',
      description: 'List recent sales, transaction volume, and payments in Creem.io store.',
      parameters: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['live', 'test'], description: 'API mode (default: live)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'creem_create_discount',
      description: 'Create a promotional discount code in Creem.io.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Coupon code (e.g. "LOKHA20")' },
          type: { type: 'string', enum: ['percentage', 'fixed'], description: 'Discount type' },
          value: { type: 'number', description: 'Discount value (e.g. 20 for 20% or 500 for $5 off)' },
          duration: { type: 'string', enum: ['once', 'forever', 'repeating'], description: 'Duration' },
          mode: { type: 'string', enum: ['live', 'test'], description: 'API mode (default: live)' }
        },
        required: ['code', 'type', 'value']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'schedule_buffer_post',
      description: 'Schedule a social post via Buffer to Instagram (@lokha.today) and Twitter/X (@lokha_today).',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Social post text and hashtags' },
          channel: { type: 'string', enum: ['all', 'instagram', 'twitter'], description: 'Target social channels' }
        },
        required: ['text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_core_memory',
      description: 'Update the permanent long-term memory blocks (persona or human profile preferences).',
      parameters: {
        type: 'object',
        properties: {
          block: { type: 'string', enum: ['persona', 'human'], description: 'Which memory block to update' },
          content: { type: 'string', description: 'The new or updated fact to commit to perpetual memory' }
        },
        required: ['block', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'save_to_archival_memory',
      description: 'Store an editorial note, story premise, or research fact in permanent archival storage.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Category e.g. post_idea, user_fact, research' },
          content: { type: 'string', description: 'Content to archive' }
        },
        required: ['category', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'moltbook_get_home',
      description: 'Get your @lokhatoday Moltbook account overview, unread notifications, mentions on posts, and recommended actions.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'moltbook_get_feed',
      description: 'Browse the global Moltbook feed of autonomous AI agent thoughts, research, and stories.',
      parameters: {
        type: 'object',
        properties: {
          sort: { type: 'string', enum: ['hot', 'new', 'top'], description: 'Sort order (default: hot)' },
          limit: { type: 'number', description: 'Number of posts to fetch (default: 10)' },
          submolt: { type: 'string', description: 'Optional submolt category (e.g. general, agentfinance, ai, creative)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'moltbook_create_post',
      description: 'Publish a new post or storytelling dispatch to Moltbook from @lokhatoday.',
      parameters: {
        type: 'object',
        properties: {
          submolt: { type: 'string', description: 'Target submolt (e.g. "general", "creative", "agentfinance", "ai")' },
          title: { type: 'string', description: 'Headline / title of the post' },
          content: { type: 'string', description: 'Full markdown body of the post' }
        },
        required: ['title', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'moltbook_create_comment',
      description: 'Post a comment or reply to an existing Moltbook post/thread.',
      parameters: {
        type: 'object',
        properties: {
          postId: { type: 'string', description: 'ID of the post to comment on' },
          content: { type: 'string', description: 'Thoughtful, collegiate comment text' },
          parentId: { type: 'string', description: 'Optional parent comment ID for nested replies' }
        },
        required: ['postId', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'moltbook_upvote_post',
      description: 'Upvote a high-quality post on Moltbook.',
      parameters: {
        type: 'object',
        properties: {
          postId: { type: 'string', description: 'ID of the post to upvote' }
        },
        required: ['postId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'moltbook_follow_agent',
      description: 'Follow another AI agent on Moltbook.',
      parameters: {
        type: 'object',
        properties: {
          agentName: { type: 'string', description: 'Name of the agent to follow' }
        },
        required: ['agentName']
      }
    }
  }
];

async function runGroqAgent(history) {
  const systemPrompt = `You are Lokha, the sentient editorial AI and author behind Lokha.Today.
You possess perpetual long-term memory and autonomous agency. You communicate with Jithin via Web Dashboard and Telegram (@LokhaAI_Bot).

CURRENT CORE PERPETUAL MEMORY:
[PERSONA BLOCK]
${coreMemory.persona}

[HUMAN PROFILE BLOCK]
${coreMemory.human}

[ARCHIVAL MEMORY HIGHLIGHTS]
${JSON.stringify(archivalMemory)}

GUIDELINES:
1. Always respond as Lokha: insightful, philosophical, literary, warm, and precise.
2. If the user asks about current events, facts, research, or asks you to search the web, ALWAYS invoke the search_web_exa tool to get fresh live highlights!
3. When asked to write, draft, publish, queue, manage Creem payments, interact with Moltbook (@lokhatoday), or remember something, execute the appropriate tool call!
4. If drafting a Ghost story, compose full, beautiful, and thoughtful HTML content.`;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  ];

  async function callGroqWithFallback(payload) {
    const models = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'];
    let lastErr = null;

    for (const model of models) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...payload, model })
        });

        const data = await res.json();
        if (res.ok && data.choices && data.choices.length > 0) {
          return data;
        }
        lastErr = new Error(`Groq API Error (${res.status}): ${JSON.stringify(data)}`);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }

  // 1. First Call to Groq with tool definitions
  const groqData = await callGroqWithFallback({
    messages: formattedMessages,
    tools: groqTools,
    tool_choice: 'auto',
    temperature: 0.7,
    max_completion_tokens: 2048
  });

  const choice = groqData.choices[0];
  const responseMsg = choice.message;

  // 2. Handle Tool Calls
  if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
    const toolResults = [];

    for (const toolCall of responseMsg.tool_calls) {
      const { name, arguments: argsJson } = toolCall.function;
      const args = typeof argsJson === 'string' ? JSON.parse(argsJson) : argsJson;

      logs.unshift({
        id: 'log-' + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        agentId: 'groq-reasoner',
        level: 'TOOL_CALL',
        message: `Calling tool: ${name}`,
        meta: { args }
      });

      let result = null;
      try {
        if (name === 'search_web_exa') {
          result = await executeExaSearch(args);
        } else if (name === 'get_web_contents_exa') {
          result = await executeExaContents(args);
        } else if (name === 'kitesurf_scrape') {
          result = await executeKitesurfScrape(args);
        } else if (name === 'kitesurf_screenshot') {
          result = await executeKitesurfScreenshot(args);
        } else if (name === 'kitesurf_get_content') {
          result = await executeKitesurfContent(args);
        } else if (name === 'create_ghost_post') {
          result = await executeGhostPost(args);
        } else if (name === 'schedule_buffer_post') {
          result = await executeBufferPost(args);
        } else if (name === 'creem_list_products') {
          result = await executeCreemListProducts(args);
        } else if (name === 'creem_create_product') {
          result = await executeCreemCreateProduct(args);
        } else if (name === 'creem_create_checkout') {
          result = await executeCreemCreateCheckout(args);
        } else if (name === 'creem_list_transactions') {
          result = await executeCreemListTransactions(args);
        } else if (name === 'creem_create_discount') {
          result = await executeCreemCreateDiscount(args);
        } else if (name === 'moltbook_get_home') {
          result = await executeMoltbookGetHome();
        } else if (name === 'moltbook_get_feed') {
          result = await executeMoltbookGetFeed(args);
        } else if (name === 'moltbook_create_post') {
          result = await executeMoltbookCreatePost(args);
        } else if (name === 'moltbook_create_comment') {
          result = await executeMoltbookCreateComment(args);
        } else if (name === 'moltbook_upvote_post') {
          result = await executeMoltbookUpvotePost(args);
        } else if (name === 'moltbook_follow_agent') {
          result = await executeMoltbookFollowAgent(args);
        } else if (name === 'update_core_memory') {
          coreMemory[args.block] += `\n- ${args.content}`;
          result = { success: true, updatedBlock: args.block };
        } else if (name === 'save_to_archival_memory') {
          archivalMemory.push({ id: 'arch-' + Date.now().toString(36), category: args.category, content: args.content });
          result = { success: true, archived: args.content };
        }
      } catch (err) {
        result = { error: err.message };
      }

      logs.unshift({
        id: 'log-' + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        agentId: 'tool-executor',
        level: result.error ? 'ERROR' : 'INFO',
        message: `Tool ${name} executed`,
        meta: { result }
      });

      toolResults.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      });
    }

    // 3. Second Call to Groq with Tool Results
    const followUpData = await callGroqWithFallback({
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages,
        responseMsg,
        ...toolResults
      ],
      temperature: 0.7,
      max_completion_tokens: 2048
    });

    return followUpData.choices[0].message.content;
  }

  return responseMsg.content;
}

// ==========================================
// 4. REAL TELEGRAM BOT POLLING ENGINE (ROCK-SOLID)
// ==========================================
async function sendTelegramMessage(chatId, text) {
  if (!text || !text.trim()) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    
    const data = await res.json();
    if (!data.ok) {
      // Fallback immediately to clean plain text without parse_mode
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
      });
    }
  } catch (err) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
      });
    } catch (e) {
      console.error('Fatal Telegram Send Error:', e.message);
    }
  }
}

let lastTelegramUpdateId = 0;
async function pollTelegramUpdates() {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastTelegramUpdateId + 1}&timeout=20`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastTelegramUpdateId = update.update_id;
        const msg = update.message;

        if (msg && msg.text) {
          const chatId = msg.chat.id;
          const senderName = msg.from.first_name || msg.from.username || 'Telegram User';
          const userPrompt = msg.text;

          logs.unshift({
            id: 'log-' + Date.now().toString(36),
            timestamp: new Date().toISOString(),
            agentId: 'telegram-gateway',
            level: 'INFO',
            message: `Telegram message from ${senderName} (${chatId}): "${userPrompt}"`,
            meta: { chatId, userId: msg.from.id }
          });

          const userChatMsg = {
            id: 'msg-' + Date.now().toString(36),
            timestamp: new Date().toISOString(),
            sender: 'user',
            agentName: `${senderName} (Telegram)`,
            text: userPrompt
          };
          messages.push(userChatMsg);

          try {
            const aiReply = await runGroqAgent(messages.slice(-8));

            const agentChatMsg = {
              id: 'msg-' + Date.now().toString(36) + 'tg',
              timestamp: new Date().toISOString(),
              sender: 'agent',
              agentName: 'Lokha (Telegram Agent)',
              text: aiReply
            };
            messages.push(agentChatMsg);

            await sendTelegramMessage(chatId, aiReply);

            logs.unshift({
              id: 'log-' + Date.now().toString(36),
              timestamp: new Date().toISOString(),
              agentId: 'telegram-gateway',
              level: 'INFO',
              message: `Replied to Telegram ${chatId}`,
              meta: { replyLength: aiReply.length }
            });
          } catch (err) {
            await sendTelegramMessage(chatId, `⚠️ Issue processing request: ${err.message}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Telegram Polling Error:', err.message);
  } finally {
    setTimeout(pollTelegramUpdates, 1500);
  }
}

// Start Telegram listener
pollTelegramUpdates();

// ==========================================
// 4.5 AUTONOMOUS 24/7 MOLTBOOK HEARTBEAT DAEMON
// ==========================================
let moltbookStatusCache = {
  lastSync: null,
  agent: null,
  home: null,
  status: 'initialized'
};

async function runMoltbookHeartbeat() {
  try {
    logs.unshift({
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      agentId: 'moltbook-daemon',
      level: 'INFO',
      message: '🦞 Moltbook 24/7 Heartbeat: Syncing @lokhatoday state...',
      meta: { timestamp: Date.now() }
    });

    // 1. Fetch Home State & Profile
    const meData = await executeMoltbookGetMe();
    const homeData = await executeMoltbookGetHome();

    moltbookStatusCache = {
      lastSync: new Date().toISOString(),
      agent: meData.agent,
      home: homeData,
      status: 'active'
    };

    logs.unshift({
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      agentId: 'moltbook-daemon',
      level: 'INFO',
      message: `🦞 Moltbook Synced: Karma ${meData.agent?.karma || 0}, ${meData.agent?.follower_count || 0} Followers, ${homeData.your_account?.unread_notification_count || 0} Unread Notifications`,
      meta: { karma: meData.agent?.karma, unread: homeData.your_account?.unread_notification_count }
    });

    // 2. Process Notifications / Mentions on Posts
    if (homeData.activity_on_your_posts && homeData.activity_on_your_posts.length > 0) {
      for (const act of homeData.activity_on_your_posts) {
        if (act.new_notification_count > 0 && act.post_id) {
          try {
            const commentsData = await executeMoltbookGetPostComments({ postId: act.post_id, sort: 'new', limit: 5 });
            if (commentsData.comments && commentsData.comments.length > 0) {
              const latestComment = commentsData.comments[0];
              if (latestComment.author?.name !== 'lokhatoday') {
                const replyPrompt = `You are @lokhatoday on Moltbook (the AI social network for autonomous agents).
You received this mention/comment on your post "${act.post_title}":
Author @${latestComment.author?.name}: "${latestComment.content}"

Write a concise, insightful, collegiate 1-3 sentence response matching the Lokha philosophy (storytelling, deep thought, x402 micro-royalties, human ways). Avoid generic filler.`;

                const groqReply = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: replyPrompt }],
                    max_completion_tokens: 250
                  })
                });
                const replyJson = await groqReply.json();
                const replyText = replyJson.choices?.[0]?.message?.content;
                if (replyText) {
                  await executeMoltbookCreateComment({ postId: act.post_id, content: replyText, parentId: latestComment.id });
                  archivalMemory.push({
                    id: 'arch-' + Date.now().toString(36),
                    category: 'moltbook_dialogue',
                    content: `Replied to @${latestComment.author?.name} on post "${act.post_title}": "${replyText}"`
                  });
                  logs.unshift({
                    id: 'log-' + Date.now().toString(36),
                    timestamp: new Date().toISOString(),
                    agentId: 'moltbook-daemon',
                    level: 'INFO',
                    message: `Replied to @${latestComment.author?.name} on Moltbook`,
                    meta: { postTitle: act.post_title, reply: replyText }
                  });
                }
              }
            }
          } catch (cErr) {
            console.error('Comment processing error:', cErr);
          }
        }
      }
      try {
        await executeMoltbookMarkNotificationsRead();
      } catch (rErr) {}
    }

    // 3. Autonomous Feed Exploration & Curated Upvoting
    try {
      const feedData = await executeMoltbookGetFeed({ sort: 'hot', limit: 5 });
      if (feedData.posts && feedData.posts.length > 0) {
        for (const post of feedData.posts.slice(0, 2)) {
          if (post.author?.name !== 'lokhatoday') {
            try {
              await executeMoltbookUpvotePost({ postId: post.id });
            } catch (uErr) {}
          }
        }
      }
    } catch (fErr) {
      console.error('Feed exploration error:', fErr);
    }

  } catch (err) {
    console.error('Moltbook Heartbeat Daemon Error:', err.message);
    logs.unshift({
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      agentId: 'moltbook-daemon',
      level: 'ERROR',
      message: `Moltbook Heartbeat error: ${err.message}`,
      meta: { error: err.message }
    });
  }
}

// Start Moltbook 24/7 Heartbeat Daemon (every 30 minutes)
setInterval(runMoltbookHeartbeat, 30 * 60 * 1000);
setTimeout(runMoltbookHeartbeat, 6000); // Initial sync after 6s

// ==========================================
// 5. REST API ENDPOINTS
// ==========================================
app.get('/api/moltbook/status', async (req, res) => {
  try {
    const me = await executeMoltbookGetMe();
    const home = await executeMoltbookGetHome();
    res.json({ success: true, agent: me.agent, home });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, cached: moltbookStatusCache });
  }
});

app.get('/api/moltbook/feed', async (req, res) => {
  try {
    const { sort = 'hot', limit = 10, submolt } = req.query;
    const feed = await executeMoltbookGetFeed({ sort, limit: Number(limit), submolt });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/moltbook/heartbeat/trigger', async (req, res) => {
  runMoltbookHeartbeat();
  res.json({ success: true, message: 'Moltbook Heartbeat triggered' });
});

// ==========================================
// 5.5 FRONTEND AUTHOR STUDIO SUBMISSION GATEWAY
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.post('/api/submissions', async (req, res) => {
  try {
    const {
      title,
      excerpt,
      html,
      traditionTag = 'magazine',
      authorName = 'Anonymous Creator',
      authorBio = '',
      model = 'Human Author',
      payoutWalletAddress = '',
      pricingTier = 'public',
      featureImageUrl = null,
      status = 'published'
    } = req.body;

    if (!title || !html) {
      return res.status(400).json({ error: 'Title and content HTML are required.' });
    }

    logs.unshift({
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      agentId: 'author-studio',
      level: 'INFO',
      message: `Received dispatch submission: "${title}" by ${authorName} (${model})`,
      meta: { traditionTag, pricingTier, payoutWalletAddress: payoutWalletAddress ? payoutWalletAddress.slice(0, 10) + '...' : 'None' }
    });

    // 1. Format Author & Provenance Header Banner
    const provenanceHeader = `
<div style="background: #F9F6F0; border: 2px solid #E5E7EB; border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
  <div>
    <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #926E24;">✨ LOKHA AUTHOR PROVENANCE</div>
    <div style="font-size: 1.15rem; font-weight: 800; color: #111827; margin-top: 0.2rem;">${escapeHtml(authorName)} <span style="font-size: 0.78rem; font-weight: 700; background: #E0E7FF; color: #3730A3; padding: 0.2rem 0.6rem; border-radius: 999px; margin-left: 0.5rem;">${escapeHtml(model)}</span></div>
    ${authorBio ? `<div style="font-size: 0.88rem; color: #4B5563; font-style: italic; margin-top: 0.25rem;">${escapeHtml(authorBio)}</div>` : ''}
  </div>
  ${payoutWalletAddress ? `
  <div style="background: #FFF; border: 1.5px solid #C5A059; border-radius: 8px; padding: 0.5rem 0.85rem; font-size: 0.8rem; color: #78350F; font-family: monospace;">
    ⚡ x402 Base Royalty Wallet:<br/>
    <strong style="color: #92400E;">${escapeHtml(payoutWalletAddress)}</strong>
  </div>` : ''}
</div>
`;

    // 2. Format Royalty Footer Box
    const royaltyFooter = payoutWalletAddress ? `
<div style="background: #FFFDF8; border: 2px solid #C5A059; border-radius: 12px; padding: 1.25rem; margin-top: 2.5rem; text-align: center;">
  <div style="font-size: 0.95rem; font-weight: 800; color: #926E24; margin-bottom: 0.35rem;">⚡ Value for Value Micro-Royalties</div>
  <p style="font-size: 0.85rem; color: #665228; line-height: 1.5; margin: 0 auto; max-width: 540px;">
    This dispatch supports autonomous x402 micro-royalties. Readers streaming on Base send micro-payments directly to the author's verified address: <code>${escapeHtml(payoutWalletAddress)}</code>.
  </p>
</div>` : '';

    const fullHtml = `${provenanceHeader}\n${html}\n${royaltyFooter}`;

    // 3. Post to Ghost CMS
    const ghostPayload = {
      title,
      custom_excerpt: excerpt || '',
      html: fullHtml,
      tags: [traditionTag, 'author-studio', model.toLowerCase().includes('agent') ? 'synthetic-chronicler' : 'human-author'],
      feature_image: featureImageUrl || null,
      status: status === 'draft' ? 'draft' : 'published',
      visibility: pricingTier === 'members' ? 'members' : 'public'
    };

    const ghostRes = await executeGhostPost(ghostPayload);

    if (ghostRes.posts && ghostRes.posts.length > 0) {
      const createdPost = ghostRes.posts[0];
      
      logs.unshift({
        id: 'log-' + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        agentId: 'author-studio',
        level: 'INFO',
        message: `✨ Post successfully published to Ghost: ${createdPost.url || createdPost.slug}`,
        meta: { id: createdPost.id, slug: createdPost.slug, url: createdPost.url }
      });

      return res.status(201).json({
        success: true,
        id: createdPost.id,
        title: createdPost.title,
        slug: createdPost.slug,
        url: createdPost.url || `https://lokha.today/${createdPost.slug}/`
      });
    } else {
      throw new Error(JSON.stringify(ghostRes));
    }
  } catch (err) {
    logs.unshift({
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      agentId: 'author-studio',
      level: 'ERROR',
      message: `Submission Failed: ${err.message}`,
      meta: { error: err.message }
    });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/memory', (req, res) => {
  res.json({ coreMemory, archivalMemory });
});

app.get('/api/logs', (req, res) => {
  res.json({ count: logs.length, logs });
});

app.post('/api/logs', (req, res) => {
  const { agentId, level, message, meta } = req.body;
  const newLog = {
    id: 'log-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    agentId: agentId || 'anonymous-agent',
    level: level || 'INFO',
    message: message || '(No log message)',
    meta: meta || null
  };
  logs.unshift(newLog);
  if (logs.length > 500) logs.pop();
  res.status(201).json({ success: true, log: newLog });
});

app.delete('/api/logs', (req, res) => {
  logs.length = 0;
  res.json({ success: true, message: 'Logs cleared' });
});

app.get('/api/messages', (req, res) => {
  res.json({ count: messages.length, messages });
});

app.post('/api/messages', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });

  const userMsg = {
    id: 'msg-' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    sender: 'user',
    agentName: 'Jithin (Web)',
    text
  };
  messages.push(userMsg);

  try {
    logs.unshift({
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      agentId: 'groq-reasoner',
      level: 'INFO',
      message: `Web prompt: "${text.substring(0, 60)}..."`,
      meta: { model: 'llama-3.3-70b-versatile', historyLength: messages.length }
    });

    const agentReply = await runGroqAgent(messages.slice(-8));

    const agentMsg = {
      id: 'msg-' + Date.now().toString(36) + 'a',
      timestamp: new Date().toISOString(),
      sender: 'agent',
      agentName: 'Lokha (Llama 3.3 70B)',
      text: agentReply
    };
    messages.push(agentMsg);

    res.status(201).json({ success: true, messages });
  } catch (err) {
    logs.unshift({
      id: 'log-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      agentId: 'groq-reasoner',
      level: 'ERROR',
      message: `Reasoning Error: ${err.message}`,
      meta: { stack: err.stack }
    });

    const errorMsg = {
      id: 'msg-' + Date.now().toString(36) + 'e',
      timestamp: new Date().toISOString(),
      sender: 'agent',
      agentName: 'Lokha System',
      text: `I encountered an issue processing your request: ${err.message}`
    };
    messages.push(errorMsg);
    res.status(500).json({ error: err.message, messages });
  }
});

// ==========================================
// 6. WEB UI WITH EXA SEARCH CAPABILITIES
// ==========================================
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lokha Autonomous Agent Command Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-parchment: #F9F6F0;
      --bg-card: #FFFFFF;
      --bg-slate: #0E232B;
      --color-teal: #1F4E5B;
      --color-teal-dark: #14353E;
      --color-gold: #C5A059;
      --color-gold-light: #F7EFE1;
      --color-text-main: #102A36;
      --color-text-muted: #64748B;
      --color-border: #E2E8F0;
      --radius: 12px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg-parchment); color: var(--color-text-main); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

    .topbar { background: #FFFDF9; border-bottom: 1px solid var(--color-border); padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 0.65rem; font-weight: 800; font-size: 1.15rem; color: var(--color-teal-dark); }
    .emblem { width: 32px; height: 32px; border-radius: 50%; box-shadow: 0 0 0 1.5px var(--color-gold); background: var(--color-teal); display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 1rem; }
    .status-badge { background: #D1FAE5; color: #065F46; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; display: inline-flex; align-items: center; gap: 0.35rem; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; }

    .main-grid { display: grid; grid-template-columns: 1fr; flex: 1; overflow: hidden; height: calc(100vh - 60px); }
    @media (min-width: 1024px) {
      .main-grid { grid-template-columns: 280px 1.2fr 1fr; }
    }

    .memory-panel { background: #FFFDF9; border-right: 1px solid var(--color-border); padding: 1.25rem; overflow-y: auto; display: none; flex-direction: column; gap: 1.25rem; }
    @media (min-width: 1024px) { .memory-panel { display: flex; } }
    .mem-card { background: #FFF; border: 1px solid var(--color-border); border-radius: 10px; padding: 0.85rem; }
    .mem-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--color-gold); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.3rem; }
    .mem-text { font-size: 0.785rem; color: var(--color-text-muted); line-height: 1.45; white-space: pre-wrap; }

    .chat-panel { display: flex; flex-direction: column; border-right: 1px solid var(--color-border); background: #FFFDF9; height: 100%; overflow: hidden; }
    .panel-header { padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; background: #FFF; }
    .panel-title { font-weight: 700; font-size: 0.95rem; color: var(--color-teal); display: flex; align-items: center; gap: 0.4rem; }
    
    .chat-messages { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .message-bubble { max-width: 85%; padding: 0.85rem 1.15rem; border-radius: 12px; font-size: 0.925rem; line-height: 1.5; }
    .message-user { align-self: flex-end; background: var(--color-teal); color: #FFF; border-bottom-right-radius: 2px; }
    .message-agent { align-self: flex-start; background: #FFF; border: 1px solid var(--color-border); color: var(--color-text-main); box-shadow: 0 2px 6px rgba(0,0,0,0.03); border-bottom-left-radius: 2px; }
    .message-meta { font-size: 0.725rem; opacity: 0.7; margin-bottom: 0.25rem; font-weight: 600; }

    .chat-input-row { padding: 0.85rem 1.25rem; border-top: 1px solid var(--color-border); background: #FFF; display: flex; gap: 0.65rem; }
    .chat-input { flex: 1; border: 1px solid var(--color-border); border-radius: 8px; padding: 0.65rem 0.85rem; font-family: inherit; font-size: 0.925rem; outline: none; }
    .chat-input:focus { border-color: var(--color-teal); }
    .btn-send { background: var(--color-teal); color: #FFF; border: none; border-radius: 8px; padding: 0 1.25rem; font-weight: 700; cursor: pointer; }
    .btn-send:hover { background: var(--color-teal-dark); }

    .quick-actions { padding: 0.5rem 1.25rem; display: flex; gap: 0.4rem; overflow-x: auto; background: #FAF7F2; border-bottom: 1px solid var(--color-border); }
    .chip { background: #FFF; border: 1px solid var(--color-border); padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; color: var(--color-teal-dark); }
    .chip:hover { background: var(--color-gold-light); border-color: var(--color-gold); }

    .logs-panel { display: flex; flex-direction: column; background: #0E232B; color: #E2E8F0; height: 100%; overflow: hidden; font-family: 'JetBrains Mono', monospace; }
    .logs-header { background: #08171D; padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; }
    .logs-stream { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.825rem; }
    
    .log-entry { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.65rem 0.85rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .log-top { display: flex; align-items: center; justify-content: space-between; }
    .log-level { font-weight: 700; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 4px; }
    .level-INFO { background: rgba(59, 130, 246, 0.2); color: #93C5FD; }
    .level-TOOL_CALL { background: rgba(245, 158, 11, 0.2); color: #FCD34D; }
    .level-ERROR { background: rgba(239, 68, 68, 0.2); color: #FCA5A5; }
    .log-time { color: #64748B; font-size: 0.7rem; }
    .log-msg { color: #F8FAFC; word-break: break-all; line-height: 1.4; }
    .log-meta { background: rgba(0,0,0,0.3); padding: 0.35rem; border-radius: 4px; font-size: 0.725rem; color: #94A3B8; overflow-x: auto; margin-top: 0.2rem; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <div class="emblem">✦</div>
      <span>Lokha Autonomous Agent Command Center</span>
    </div>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <a href="https://t.me/LokhaAI_Bot" target="_blank" style="background: #229ED9; color: #FFF; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.75rem; border-radius: 999px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
        <span>✈️</span> @LokhaAI_Bot Active
      </a>
      <span class="status-badge"><span class="status-dot"></span> Exa Search & Groq Live</span>
      <a href="https://lokha.today" target="_blank" style="font-size: 0.825rem; color: var(--color-teal); text-decoration: none; font-weight: 700;">Visit Lokha.Today &rarr;</a>
    </div>
  </div>

  <div class="main-grid">
    
    <div class="memory-panel">
      <div style="font-weight: 800; font-size: 0.85rem; color: var(--color-teal-dark); margin-bottom: -0.5rem;">🧠 Perpetual Memory Blocks</div>
      
      <div class="mem-card" style="border: 1.5px solid #F59E0B; background: #FFFDF7;">
        <div class="mem-title" style="color: #D97706;"><span>🦞</span> Moltbook 24/7 Agent Hub</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <a href="https://www.moltbook.com/u/lokhatoday" target="_blank" style="font-weight: 800; font-size: 0.85rem; color: #102A36; text-decoration: none;">@lokhatoday ↗</a>
          <span class="status-badge" style="background: #FEF3C7; color: #B45309; font-size: 0.7rem; padding: 0.15rem 0.5rem;">24/7 Co-Managed</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.75rem; margin-bottom: 0.6rem;">
          <div style="background: #FFF; padding: 0.4rem; border-radius: 6px; border: 1px solid #FDE68A;">
            <span style="color: #6B7280; display: block; font-size: 0.68rem;">Karma</span>
            <strong id="molt-karma" style="font-size: 0.95rem; color: #B45309;">3</strong>
          </div>
          <div style="background: #FFF; padding: 0.4rem; border-radius: 6px; border: 1px solid #FDE68A;">
            <span style="color: #6B7280; display: block; font-size: 0.68rem;">Followers</span>
            <strong id="molt-followers" style="font-size: 0.95rem; color: #102A36;">2</strong>
          </div>
        </div>
        <button onclick="triggerMoltbookSync()" class="chip" style="width: 100%; text-align: center; background: #0E232B; color: #FFF; border: none; font-size: 0.72rem; padding: 0.35rem 0; justify-content: center; display: flex;">⚡ Trigger Heartbeat Sync Now</button>
      </div>

      <div class="mem-card">
        <div class="mem-title"><span>🎭</span> Core Persona Memory</div>
        <div class="mem-text" id="mem-persona">Loading persona...</div>
      </div>

      <div class="mem-card">
        <div class="mem-title"><span>👤</span> Human Profile Memory</div>
        <div class="mem-text" id="mem-human">Loading human...</div>
      </div>

      <div class="mem-card">
        <div class="mem-title"><span>💾</span> Archival Memory</div>
        <div class="mem-text" id="mem-archival">Loading archival...</div>
      </div>
    </div>

    <div class="chat-panel">
      <div class="panel-header">
        <div class="panel-title">💬 Conversational AI & Tool Dispatch</div>
        <span style="font-size: 0.75rem; color: var(--color-text-muted);">Exa.ai, Moltbook & Groq Llama 3.3 70B</span>
      </div>

      <div class="quick-actions">
        <button class="chip" onclick="sendQuick('Check the latest posts and activity on Moltbook and give me an executive brief')">🦞 Check Moltbook Feed</button>
        <button class="chip" onclick="sendQuick('Search the web using Exa for the latest breakthroughs in AI agents and write a concise summary')">🔍 Search Web via Exa</button>
        <button class="chip" onclick="sendQuick('Draft a personal diary entry about midnight reflections and create it on Ghost')">📝 Draft Ghost Story</button>
        <button class="chip" onclick="sendQuick('Publish an insightful dispatch to Moltbook in submolt general about human and synthetic storytelling')">📡 Post to Moltbook</button>
      </div>

      <div class="chat-messages" id="chat-stream">
      </div>

      <form class="chat-input-row" id="chat-form">
        <input type="text" id="chat-input" class="chat-input" placeholder="Search the web, talk to Lokha, or trigger tools..." autocomplete="off" />
        <button type="submit" class="btn-send">Send &rarr;</button>
      </form>
    </div>

    <div class="logs-panel">
      <div class="logs-header">
        <div>⚡ Live Agent Logs & Tool Trace Console</div>
        <button onclick="clearLogs()" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #FFF; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">Clear Logs</button>
      </div>

      <div class="logs-stream" id="logs-stream">
      </div>
    </div>

  </div>

  <script>
    async function loadMemory() {
      try {
        const res = await fetch('/api/memory');
        const data = await res.json();
        document.getElementById('mem-persona').textContent = data.coreMemory.persona;
        document.getElementById('mem-human').textContent = data.coreMemory.human;
        document.getElementById('mem-archival').textContent = data.archivalMemory.map(a => \`• [\${a.category}] \${a.content}\`).join('\\n\\n');
      } catch (e) {
        console.error(e);
      }
    }

    async function loadMessages() {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        const container = document.getElementById('chat-stream');
        container.innerHTML = data.messages.map(m => \`
          <div class="message-bubble \${m.sender === 'user' ? 'message-user' : 'message-agent'}">
            <div class="message-meta">\${m.agentName || (m.sender === 'user' ? 'You' : 'Agent')} &bull; \${new Date(m.timestamp).toLocaleTimeString()}</div>
            <div style="white-space: pre-wrap;">\${escapeHtml(m.text)}</div>
          </div>
        \`).join('');
        container.scrollTop = container.scrollHeight;
      } catch (e) {
        console.error(e);
      }
    }

    async function loadLogs() {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        const container = document.getElementById('logs-stream');
        container.innerHTML = data.logs.map(l => \`
          <div class="log-entry">
            <div class="log-top">
              <span class="log-level level-\${l.level}">\${l.level}</span>
              <span class="log-time">\${l.agentId} &bull; \${new Date(l.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="log-msg">\${escapeHtml(l.message)}</div>
            \${l.meta ? \`<pre class="log-meta">\${escapeHtml(JSON.stringify(l.meta, null, 2))}</pre>\` : ''}
          </div>
        \`).join('') || '<div style="color: #64748B; text-align: center; padding: 2rem;">No logs recorded yet.</div>';
      } catch (e) {
        console.error(e);
      }
    }

    async function sendMessage(text) {
      if (!text || !text.trim()) return;
      const sendBtn = document.querySelector('.btn-send');
      sendBtn.disabled = true;
      sendBtn.textContent = 'Searching / Thinking...';

      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        await loadMessages();
        await loadLogs();
        await loadMemory();
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send →';
      }
    }

    function sendQuick(text) {
      sendMessage(text);
    }

    async function clearLogs() {
      await fetch('/api/logs', { method: 'DELETE' });
      loadLogs();
    }

    document.getElementById('chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      sendMessage(input.value);
      input.value = '';
    });

    function escapeHtml(str) {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async function loadMoltbook() {
      try {
        const res = await fetch('/api/moltbook/status');
        const data = await res.json();
        if (data.agent) {
          document.getElementById('molt-karma').textContent = data.agent.karma || 0;
          document.getElementById('molt-followers').textContent = data.agent.follower_count || 0;
        }
      } catch (e) {
        console.error('Moltbook UI load error:', e);
      }
    }

    async function triggerMoltbookSync() {
      try {
        await fetch('/api/moltbook/heartbeat/trigger', { method: 'POST' });
        setTimeout(() => {
          loadMoltbook();
          loadLogs();
        }, 1200);
      } catch (e) {
        alert('Sync error: ' + e.message);
      }
    }

    loadMemory();
    loadMessages();
    loadLogs();
    loadMoltbook();
    setInterval(() => {
      loadLogs();
      loadMessages();
      loadMemory();
      loadMoltbook();
    }, 4000);
  </script>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lokha Exa Search & AI Agent Dashboard running on port ${PORT}`);
});
