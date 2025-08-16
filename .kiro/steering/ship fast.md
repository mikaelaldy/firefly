Purpose: ship fast, avoid yak-shaving. Use Bun where it’s clearly faster and safe; fall back to npm when ecosystem edges appear. Keep tests to just enough: smoke the critical user path, not the world.

Package manager & runtime
Default: Bun (dev speed)

Bun is a fast JS runtime with a Node-compatible package manager, script runner, and test runner. It installs from the npm registry and can be used in existing Node/Next projects. 
GitHub
Bun

Next.js works fine with Bun for many flows (there’s even a Bun guide to create/run Next apps). Use it for local dev. 
Bun

Standard commands

# install
bun install

# dev server
bun run dev

# build & start
bun run build
bun run start


When Bun is great

Clean Next.js app with common deps.

You want fast installs & snappy dev server.

When to bail out to npm

If a dependency misbehaves under Bun (native addon, Node API edge, or tooling doesn’t support Bun well), switch that workflow to Node/npm. Historically there have been edge cases; choose stability over speed when blocked. 
GitHub
Reddit

Fallback: npm (safety net)

npm is the safe default across the ecosystem and fully supported by Next docs & guides. Use it in CI if you hit Bun-specific flakiness. 
Next.js

npm commands

npm ci           # or: npm install
npm run dev
npm run build && npm run start

Choosing per-task (rule of thumb)

Local dev: start with Bun.

CI / Release: prefer npm if any flaky behavior shows up under Bun. Otherwise Bun is fine.

Auth/E2E testing tools that don’t document Bun: use Node/npm for that test task.

Tip: If you use Vitest, run it via bun run test (so Bun runs Node and Vitest runs as intended) or just call npm run test in CI. 
vitest.dev