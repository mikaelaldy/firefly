## Runtime policy

- **Local development:** always run with Bun (`bun run dev`).
- **CI/production:** always run with npm (`npm run build && npm run start`).
- Reason: Bun is fast for iteration, but npm ensures stability on deploys and avoids edge-case bugs.
