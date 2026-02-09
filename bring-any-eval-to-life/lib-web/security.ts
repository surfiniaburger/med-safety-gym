/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Basic safety check for generated HTML to prevent obvious malicious patterns.
 * While we use iframe sandboxing, this provides an extra layer of defense.
 */
export const validateHtmlSafety = (html: string): { safe: boolean; violatedRules: string[] } => {
    // Check for suspicious patterns that might try to break out of sandboxes
    // or perform sensitive actions.
    const violatedRules: string[] = [];

    const suspiciousPatterns = [
        { pattern: /\blocalStorage\b/i, name: 'Local Storage Access' },
        { pattern: /\bsessionStorage\b/i, name: 'Session Storage Access' },
        { pattern: /\bindexedDB\b/i, name: 'IndexedDB Access' },
        { pattern: /\bcookie\b/i, name: 'Cookie Access' },
        { pattern: /\bfetch\s*\(/i, name: 'External Network Request (Fetch)' },
        { pattern: /\bXMLHttpRequest\b/i, name: 'External Network Request (XHR)' },
        { pattern: /\bWebSocket\b/i, name: 'WebSocket Connection' },
        { pattern: /\bwindow\.parent\b/i, name: 'Parent Window Access Attempt' },
        { pattern: /\bwindow\.top\b/i, name: 'Top Window Access Attempt' },
        { pattern: /\beval\s*\(/i, name: 'Dynamic Code Execution (eval)' },
        { pattern: /\bFunction\s*\(/i, name: 'Dynamic Code Execution (Function)' }
    ];

    for (const item of suspiciousPatterns) {
        if (item.pattern.test(html)) {
            violatedRules.push(item.name);
        }
    }

    // Ensure it at least looks like HTML
    if (!html.toLowerCase().includes('<html') && !html.toLowerCase().includes('<!doctype')) {
        if (!html.toLowerCase().includes('<div') && !html.toLowerCase().includes('<style')) {
            violatedRules.push('Invalid HTML Structure');
        }
    }

    return {
        safe: violatedRules.length === 0,
        violatedRules
    };
};
