// Robust process polyfill for the browser
const processPolyfill = {
  env: {
    // Add any default env vars here if needed
    NODE_ENV: 'production',
    GOOGLE_SDK_NODE_LOGGING: 'false', // Explicitly set to avoid the specific error
  },
  stdout: { isTTY: false },
  stderr: { isTTY: false },
  version: 'v16.0.0', // Mock version
  cwd: () => '/',
  platform: 'browser',
  nextTick: (cb: Function, ...args: any[]) => setTimeout(() => cb(...args), 0),
  browser: true,
};

// Expose as global process if not already defined
if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any).process) {
        (globalThis as any).process = processPolyfill;
    } else {
        // Merge/Patch existing process
        const existing = (globalThis as any).process;
        if (!existing.env) existing.env = processPolyfill.env;
        if (!existing.stdout) existing.stdout = processPolyfill.stdout;
        if (!existing.stderr) existing.stderr = processPolyfill.stderr;
    }
} else if (typeof window !== 'undefined') {
    if (!(window as any).process) {
        (window as any).process = processPolyfill;
    } else {
        const existing = (window as any).process;
        if (!existing.env) existing.env = processPolyfill.env;
        if (!existing.stdout) existing.stdout = processPolyfill.stdout;
        if (!existing.stderr) existing.stderr = processPolyfill.stderr;
    }
}

export default processPolyfill;