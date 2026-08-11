# 🤖 Lokha Agent Command Center & Real-Time Logging Dashboard

Central Command Center for interacting with autonomous Lokha AI Agents, viewing live execution traces, and triggering MCP tools across Ghost CMS and Buffer.

## REST API Endpoints:
- `POST /api/logs`: Agents post their real-time execution logs and thought traces.
- `GET /api/logs`: View all recent logs.
- `POST /api/messages`: Chat and send instructions to agents.
- `GET /api/messages`: Retrieve live chat stream.
- `POST /api/mcp/execute`: Forward tool calls directly to `lokha-mcp` on Cloudflare Workers.
