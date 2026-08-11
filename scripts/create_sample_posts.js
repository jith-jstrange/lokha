import crypto from 'crypto';

const GHOST_URL = 'https://lokha.today';
const ADMIN_API_KEY = '6a72fe11765b1200012a5241:a775afea31694d4903fb1db323945025c4fd846b312e7897f984e909c4f8a069';

function createGhostToken() {
  const [id, secret] = ADMIN_API_KEY.split(':');
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: id })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: '/admin/' })).toString('base64url');
  const signature = crypto.createHmac('sha256', Buffer.from(secret, 'hex')).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

const samplePosts = [
  {
    title: "When the World is Quiet: Late Night Reflections on Human Connection",
    custom_excerpt: "Thoughts written down in the quiet hours about solitude, memory, and finding stillness in modern life.",
    html: "<p>There is a strange and beautiful stillness that settles over everything past midnight. When the notifications stop and the chatter fades, thoughts begin to speak in their honest voice.</p><p>This diary is an invitation to pause, breathe, and reflect on the small human moments that often go unnoticed.</p>",
    tags: [{ name: "Personal Diary", slug: "diary" }],
    status: "published"
  },
  {
    title: "The Coffee Machine Rebellion: A Visual Tale",
    custom_excerpt: "An illustrated short narrative on everyday quirks, morning rituals, and humorous observations.",
    html: "<p>Every morning begins with the familiar hum of the kettle and the ancient ritual of making coffee. Here is a visual vignette capturing the comedy of daily routines.</p>",
    tags: [{ name: "Comic Book", slug: "comic" }],
    status: "published"
  },
  {
    title: "The Daily Chronicle: How Modern Publishing is Returning to Accurised Roots",
    custom_excerpt: "Broadside analysis on craft, editorial standards, and the timeless importance of truthful reporting.",
    html: "<p>In an era overwhelmed by algorithmic velocity, accurised writing and thoughtful curation stand out like lighthouses. This edition examines the resurgence of deliberate, handcrafted publishing.</p>",
    tags: [{ name: "Newspaper", slug: "newspaper" }],
    status: "published"
  },
  {
    title: "In Search of Craft: The Art of Thinking and Writing with Clarity",
    custom_excerpt: "A feature-length exploration of philosophy, craftsmanship, and the discipline of thoughtful expression.",
    html: "<p>To write clearly is to think clearly. This longform essay explores the philosophies of great essayists, the architecture of thoughtful prose, and why human perspective cannot be replaced.</p>",
    tags: [{ name: "Magazine", slug: "magazine" }],
    status: "published"
  },
  {
    title: "Field Notes & Curiosities: Sparks of Thought from the Scrapbook",
    custom_excerpt: "A collection of quotes, sketches, and raw ideas collected along the way.",
    html: "<p>A scrapbook is where unpolished brilliance lives: rough sketches, stray observations, marginalia, and sparks of inspiration before they become finished essays.</p>",
    tags: [{ name: "Scrapbook", slug: "scrapbook" }],
    status: "published"
  }
];

async function seed() {
  console.log("Creating 5 format sample posts in Ghost CMS...");
  const token = createGhostToken();
  for (const post of samplePosts) {
    try {
      const res = await fetch(`${GHOST_URL}/ghost/api/admin/posts/?source=html`, {
        method: 'POST',
        headers: {
          'Authorization': `Ghost ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ posts: [post] })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ Created: "${post.title}" -> ${data.posts?.[0]?.url}`);
      } else {
        console.log(`Notice for "${post.title}":`, data.errors?.[0]?.message);
      }
    } catch (e) {
      console.error("Error creating post:", e.message);
    }
  }
}

seed();
