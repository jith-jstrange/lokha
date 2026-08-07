# 🪐 Lokha Platform Monorepo

Welcome to the official monorepo for **Lokha**, an AI-first publishing ecosystem, Model Context Protocol integration platform, and custom mail infrastructure.

---

## 📂 Repository Structure

```text
lokha/
├── lokha-mcp/          # Model Context Protocol Server (Cloudflare Workers)
│                         Supports Ghost CMS & Buffer Social Media providers
├── lokha-mailserver/   # Custom SMTP Server & Magic Link Dashboard (Railway/Docker)
├── lokha-ghost-themes/ # Custom Ghost CMS themes (journey_of_lokha, lokha-scrapbook)
├── lokha-branding/     # Brand assets, logos, and visual identity
├── scripts/            # Ghost API scripts, SMTP test utilities, Mailgun config
└── vision-docs/        # Architecture vision & product specifications
```

---

## 🚀 Projects Overview

### 1. [`lokha-mcp`](./lokha-mcp)
Modular Model Context Protocol (MCP) server running on Cloudflare Workers. Connects AI assistants to Ghost CMS, Buffer social media publishing, and future ecosystem services.

### 2. [`lokha-mailserver`](./lokha-mailserver)
Lightweight Node.js SMTP mail server listening on port `2525` and HTTP magic-link login dashboard on port `8080` for Ghost CMS deployments.

### 3. [`lokha-ghost-themes`](./lokha-ghost-themes)
Custom Ghost CMS themes designed for Lokha publishing platforms (`journey_of_lokha` and `lokha-scrapbook`).

### 4. [`scripts`](./scripts)
Integration, automation, theme uploaders, and mail configuration scripts for Ghost and Mailgun/Brevo SMTP setups.

---

## 🛠️ Getting Started

Check each directory's respective README for build, development, and deployment instructions:
- [Lokha MCP Documentation](./lokha-mcp/README.md)
- [Lokha MailServer Documentation](./lokha-mailserver/README.md)
- [Architecture Vision Specification](./vision-docs/Lokha_MCP_Architecture_Vision_v1(1).md)

---

## 📄 License
MIT License © 2026 Lokha Ecosystem
