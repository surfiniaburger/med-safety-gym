Mostly Harmless
Home
/
About
/
Subscribe
January 20, 2026 | Jeremiah Lowin

Introducing FastMCP 3.0 🚀
Move fast and make things.

454
10
16
I have a confession to make.

FastMCP 2.0 hides a dark secret. For the last year, we have been scrambling. We were riding the adoption curve of one of the fastest-growing technologies on the planet, trying to keep up with a spec that seemed to change every week.

On the one hand, it worked. FastMCP 1.0 proved the concept so well that Anthropic made it the foundation of the official MCP SDK. FastMCP 2.0 introduced the features necessary to build a real server ecosystem, coinciding with the massive MCP hype wave. The community responded: Today, FastMCP is downloaded a million times a day, and some version of it powers 70% of all MCP servers.

But as someone who cares deeply about framework design, the way v2 evolved was frustrating. It was reactive. We were constantly bolting on new infrastructure to match the present, hacking in new features just to make sure you didn’t have to build them yourself.

Over the last year, something shifted. We had enough data, from millions of downloads and countless conversations with teams building real servers, to see the patterns underneath all the ad-hoc features. We could finally see what a “designed” framework would look like.

FastMCP 3.0 is that framework.

It is the platform MCP deserves in 2026, built to be as durable as it is future-proof.

We are moving beyond simple “tool servers.” We are entering the era of Context Applications—rich, adaptive systems that manage the information flow to agents.

The real challenge was never implementing the protocol. It’s delivering the right information at the right time. FastMCP 3 is built for that:

Source components from anywhere.
Compose and transform them freely.
Personalize what each user sees.
Track state across sessions.
Control access at every level.
Run long operations in the background.
Version your APIs.
Observe everything.
It’s time to move fast and make things.

🏁 Get Started
FastMCP 3.0.0 beta 2 is available now.

For a deeper dive into all the new features, read the What’s New in FastMCP 3.0 post and the Beta 2 announcement.

The Architecture
FastMCP 2 was a collection of features. FastMCP 3 is a system built on three fundamental primitives. If you understand these, you understand the entire framework.

Components define the logic.
Providers source the components.
Transforms shape the components.
A Component is the atom of MCP—specifically, a Tool, Resource, or Prompt. While they often wrap Python functions or data sources to define their business logic, the Component itself is the standardized interface that the model interacts with.

A Provider answers the question: “Where do the components come from?” They can come from Python decorators, a directory of files, an OpenAPI spec, a remote MCP server, or pretty much anything else. In fact, a FastMCP server is itself just a Provider that happens to speak the MCP protocol.

A Transform functions as middleware for Providers. It allows you to modify the behavior of a Provider without touching its code. This decouples the author from the consumer: Person A can source the tools (via a Provider), while Person B adapts them to their specific environment (via a Transform)—renaming them, adding namespaces to prevent collisions, filtering versions, or applying security rules.

The real power lies in the composition of these primitives.

In v2, “mounting” a sub-server was a massive, specialized subsystem. In v3 it’s just a Provider (sourcing the components) plus a Transform (adding a namespace prefix).

Proxying a remote server? That’s a Provider backed by a FastMCP client.

Hiding developer tools from read-only users? That’s a Transform applied to a specific session.

This architecture means features that used to require massive amounts of glue code now fall out naturally from the design. It allows us to ship a massive amount of new functionality without breaking the foundation.

Sourcing Context: Providers
Because the architecture is decoupled, we can now source components from anywhere.

LocalProvider
This workhorse powers the classic FastMCP experience you know and love. You define a function, decorate it with @tool, and it becomes a component. It is simple, explicit, and remains the best way to get started. But what if your tools aren’t local?

FileSystemProvider
This is a fundamentally different way to organize MCP servers. Instead of importing a server instance and decorating functions, you point the provider at a directory. It scans the files, finds the components, and builds your interface. With reload=True, it watches those files and updates the server instantly on any change.

SkillsProvider
Skills are having a moment. Claude Code, Cursor, Copilot—they all learn new capabilities from instruction files. SkillsProvider exposes these as MCP resources, which means any MCP client can discover and download skills from your server. We’re delivering skills over MCP. It’s a small example of what happens when “where do components come from?” becomes an open question: someone had a weird idea, wrote a provider, and now it’s a capability.

OpenAPIProvider
This feature was so popular in FastMCP 2 that people stopped designing servers and started regurgitating REST APIs, forcing me to write a blog post asking you to stop. But we know: it’s useful. In FastMCP 3, OpenAPI returns as a provider. It is available for responsible use, and when paired with ToolTransforms (to rename and curate the output), it finally becomes a tool for building good context rather than blindly accumulating more of it.

Production Realities
FastMCP 2 was great for scripts. FastMCP 3 is built for systems that need to survive in production.

Component Versioning
This was a massive request. You can now serve multiple versions of a tool side-by-side using the @tool(version="1.0") parameter. FastMCP automatically exposes the highest version to clients, while preserving older versions for legacy compatibility. You can even use a VersionFilter transform to run a “v1 Server” and a “v2 Server” from the exact same codebase.

Authorization & Security
We introduced OAuth in v2, but v3 gives you granular control. You can attach authorization logic to individual components using the auth parameter. You can also apply AuthMiddleware to gate entire groups of components (e.g., by tag) for defense-in-depth.

Native OpenTelemetry
Observability is no longer an afterthought. FastMCP 3 has native OpenTelemetry instrumentation. Drop in your OTEL configuration, and every tool call, resource read, and prompt render is traced with standardized attributes. You can finally see exactly where your latency is coming from.

Background Tasks
We’ve integrated support for SEP-1686, allowing tools to kick off long-running background tasks via Docket integration. This prevents tool timeouts on heavy workloads while keeping the agent responsive.

Developer Joy
We heard you. You wanted a framework that felt less like a hacked-together library and more like a modern Python toolchain.

Hot Reload: fastmcp dev server.py watches your files and reloads instantly. No more kill-restart cycles.
Callable Functions: In v2, decorators turned your functions into objects. In v3, your functions stay functions. You can import them, call them, and unit test them just like normal Python code.
Sync that Works: Synchronous tools are now automatically dispatched to a threadpool, meaning a slow calculation won’t block your server’s event loop.
Playbooks
I want to close by showing you why this architecture actually matters.

A common problem in MCP is “context crowding.” If you dump 500 tools into a context window, the model gets confused. You want progressive disclosure: start with a few tools, and reveal more based on the user’s role or the conversation state.

In FastMCP 3, we don’t need a special “Progressive Disclosure” feature1. We just compose the primitives we’ve already built:

Providers to source the hidden tools.
Visibility to hide them by default.
Auth to act as the gatekeeper.
Session State to remember who has unlocked what.
Here is what that looks like. We mount a directory of admin tools, hide them from the world, and then provide a secure, authenticated tool that unlocks them only for the current session.

from fastmcp import FastMCP, Context
from fastmcp.server.auth import require_scopes
from fastmcp.server.providers import FileSystemProvider

mcp = FastMCP("Enterprise Server")

# 1. Source admin tools from a file system
admin_provider = FileSystemProvider("./admin_tools")
mcp.mount(admin_provider)

# 2. Hide them by default using the Visibility system
mcp.disable(tags={"admin"})

# 3. Create a gatekeeper tool with Authorization
@mcp.tool(auth=require_scopes("super-user"))
async def unlock_admin_mode(ctx: Context):
    """Unlock administrative tools for this session."""

    # 4. Modify Session State to reveal the hidden tools
    await ctx.enable_components(tags={"admin"})

    return "Admin mode unlocked. New tools are available."

The agent connects, sees a safe environment, authenticates, and the server evolves to match the new trust level.

This composition creates a new primitive entirely. When you chain these stateful unlocks together—revealing context A, which unlocks context B—you get what we call playbooks. Playbooks are a way to build dynamic MCP-native workflows. More on them soon!

This is the future of Context Applications. Static lists of API wrappers are being replaced by dynamic systems that actively guide the agent through a process.

The Future
We know that as capabilities grow, context windows get crowded. The hundred tools that make your server powerful are the same hundred tools that overwhelm your agent.

Our next wave of features is focused on context optimization: search transforms, curator agents, and deeper skills integration. The architecture of FastMCP 3 is specifically designed to support these patterns.

Because what you don’t show the agent matters just as much as what you do.

Today, organizations with a competitive advantage don’t have access to smarter AI. They have access to smarter context. FastMCP 3 is the fastest to build it.

It’s available in beta today.

Happy (context) engineering!

About This Beta
FastMCP is an extremely widely used framework. While 3.0 introduces almost no breaking changes, we want to make sure that users aren’t caught off guard. Therefore, the beta period will last a few weeks to allow for feedback and testing.

Install: pip install fastmcp==3.0.0b2

Beta 2 Announcement: FastMCP 3.0 Beta 2: The Toolkit
Upgrade Guide: gofastmcp.com/development/upgrade-guide
Full Documentation: gofastmcp.com
GitHub: github.com/jlowin/fastmcp
Footnotes
Though of course we’ll have an amazing DX for it as patterns emerge. ⤴️

Subscribe
Email Address

Subscribe
Comments
Join the conversation by posting on social media.

Jeremiah Lowin's avatar
Jeremiah Lowin
•
18d ago
•
BSky
We're moving past "tool servers." Source from anywhere. Compose and transform freely. Personalize per-user. Track state across sessions. Control access. Run long operations. Version your APIs. Observe everything. We call this the context era: www.jlowin.dev/blog/fastmcp-3
6
1
Jeremiah Lowin's avatar
Jeremiah Lowin
•
18d ago
•
BSky
The new architecture lets us ship a massive number of features: 🎁 Custom providers like filesystems and remote APIs ✨ Per-component authorization 🏷️ Component versioning 🧠 And even skills over MCP...! Read the comprehensive feature guide here: www.jlowin.dev/blog/fastmcp...
4
1
Jeremiah Lowin's avatar
Jeremiah Lowin
•
18d ago
•
BSky
And by popular demand, we’ve polished the developer experience: ⚡ Servers support hot reload during development ⚡ Decorators now return callable functions (finally!) ⚡ Automatic threadpools for sync tools
1
1
Jeremiah Lowin's avatar
Jeremiah Lowin
•
18d ago
•
BSky
There's A LOT here, but we've tried extremely hard to keep breaking changes minimal. Most users will not need to change their code at all. You can read the full upgrade guide here: gofastmcp.com/development/... Happy (context) engineering!
1
© 2026 Jeremiah Lowin