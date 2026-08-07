# Lokha MCP --- Architecture Vision (v1)

## Overview

Lokha MCP is a production-ready, modular Model Context Protocol (MCP)
server hosted on Cloudflare Workers. It acts as the central integration
layer between AI assistants (such as Gemini Spark) and every service
used by the Lokha ecosystem.

The first provider is **Ghost CMS**, with future expansion to GitHub,
Google Workspace, Slack, Notion, Supabase, Vercel, Render, Railway,
Stripe, and more.

------------------------------------------------------------------------

# High-Level Architecture

``` text
                          LOKHA MCP
                    (Cloudflare Worker)

               ┌─────────────────────────────┐
               │        MCP Server           │
               │                             │
               │  Registry                   │
               │  Authentication             │
               │  Tool Discovery             │
               │  Provider Manager           │
               └─────────────┬───────────────┘
                             │
     ┌─────────────┬──────────┼──────────────┬──────────────┐
     │             │          │              │              │
   Ghost       GitHub     Google       Supabase       Slack
 Provider     Provider    Provider      Provider      Provider
     │
     ▼
Your Self-hosted Ghost CMS
```

------------------------------------------------------------------------

# Goals

-   One MCP endpoint for all services.
-   Modular provider architecture.
-   Cloud-native deployment.
-   Secure credential management.
-   Easy expansion through new providers.

------------------------------------------------------------------------

# Technology Stack

-   Runtime: Cloudflare Workers
-   Language: TypeScript
-   Protocol: Official MCP SDK
-   Repository: GitHub
-   Deployment: GitHub → Cloudflare Auto Deploy
-   Secrets: Cloudflare Secrets
-   Optional Database: Supabase
-   Authentication:
    -   OAuth (Google, GitHub, Slack, etc.)
    -   API Keys (Ghost)
    -   JWT where appropriate

------------------------------------------------------------------------

# Version 1 (MVP)

## Core MCP Server

-   MCP Server
-   Tool Registry
-   Authentication Layer
-   Provider Loader
-   Configuration Manager
-   Logging
-   Error Handling

------------------------------------------------------------------------

# Ghost Provider (Provider #1)

The first provider integrates with your self-hosted Ghost CMS.

## Tools

-   ghost.create_post
-   ghost.create_draft
-   ghost.publish_post
-   ghost.update_post
-   ghost.delete_post
-   ghost.list_posts
-   ghost.list_drafts
-   ghost.get_post
-   ghost.upload_image
-   ghost.list_tags
-   ghost.list_authors
-   ghost.schedule_post

Example prompts:

-   "Create a draft about AI agents."
-   "Publish yesterday's draft."
-   "Upload this image."
-   "Schedule this article for tomorrow."

------------------------------------------------------------------------

# Recommended Project Structure

``` text
lokha-mcp/

src/
│
├── server/
│   ├── index.ts
│   ├── registry.ts
│   ├── auth.ts
│   ├── logger.ts
│   └── config.ts
│
├── providers/
│   ├── ghost/
│   │     client.ts
│   │     tools.ts
│   │     schema.ts
│   │     index.ts
│   │
│   ├── github/
│   ├── google/
│   ├── slack/
│   └── notion/
│
├── types/
├── utils/
└── index.ts
```

------------------------------------------------------------------------

# Multi-Site Ghost Configuration

``` yaml
ghost:
  personal:
    url: https://blog.example.com
    admin_key: ****

  lokha:
    url: https://lokha.today
    admin_key: ****

  client1:
    url: https://client.com
    admin_key: ****
```

This allows the same MCP server to manage multiple Ghost instances.

------------------------------------------------------------------------

# Future Providers

-   Ghost CMS
-   GitHub
-   Google Drive
-   Gmail
-   Google Calendar
-   Google Docs
-   Slack
-   Notion
-   Linear
-   Supabase
-   Vercel
-   Cloudflare
-   Render
-   Railway
-   Stripe

Each provider is implemented as an independent module.

------------------------------------------------------------------------

# Development Workflow

``` text
VS Code / Cursor
        │
        ▼
     GitHub
        │
        ▼
Cloudflare Worker
        │
        ▼
 Gemini Spark
```

------------------------------------------------------------------------

# Security Principles

-   Never store secrets in source code.
-   Store credentials in Cloudflare Secrets.
-   Use OAuth whenever supported.
-   Encrypt and securely manage access tokens.
-   Validate all tool requests.

------------------------------------------------------------------------

# Long-Term Vision

Lokha MCP is not just a Ghost connector---it is the universal
integration layer for the Lokha ecosystem.

Every future service will be added as a provider, allowing AI assistants
to interact with all connected platforms through a single MCP endpoint
while maintaining a clean, modular, and scalable architecture.
