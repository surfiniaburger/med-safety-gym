/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Basic safety check for generated HTML to prevent obvious malicious patterns.
 * While we use iframe sandboxing, this provides an extra layer of defense.
 */
export const validateHtmlSafety = (html: string): { safe: boolean; reason?: string } => {
    // Check for suspicious patterns that might try to break out of sandboxes
    // or perform sensitive actions.

    const suspiciousKeywords = [
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'cookie',
        'fetch(',
        'XMLHttpRequest',
        'WebSocket',
        'window.parent',
        'window.top',
        'eval(',
        'Function('
    ];

    for (const keyword of suspiciousKeywords) {
        if (html.includes(keyword)) {
            return {
                safe: false,
                reason: `Suspicious pattern detected: ${keyword}`
            };
        }
    }

    // Ensure it at least looks like HTML
    if (!html.toLowerCase().includes('<html') && !html.toLowerCase().includes('<!doctype')) {
        if (!html.toLowerCase().includes('<div') && !html.toLowerCase().includes('<style')) {
            return { safe: false, reason: 'Invalid HTML structure' };
        }
    }

    return { safe: true };
};
