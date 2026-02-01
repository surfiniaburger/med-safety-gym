/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Sandbox preview business logic.
 * Renders HTML in a sandboxed iframe.
 */

import { v4 as uuidv4 } from 'uuid';

export interface SandboxResult {
    previewUrl: string;
    previewId: string;
    status: 'rendered' | 'error';
    error?: string;
}

/**
 * Renders HTML in a sandboxed iframe.
 * Validates HTML before rendering and returns preview URL.
 */
export function renderHtmlInSandbox({
    html,
    css,
    js,
}: {
    html: string;
    css?: string;
    js?: string;
}): SandboxResult {
    // Validate HTML is not empty
    if (!html || html.trim() === '') {
        return {
            status: 'error',
            previewUrl: '',
            previewId: '',
            error: 'HTML content is required',
        };
    }

    // Basic HTML validation using DOMParser (browser environment)
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const errors = doc.querySelectorAll('parsererror');
        if (errors.length > 0) {
            return {
                status: 'error',
                previewUrl: '',
                previewId: '',
                error: 'Invalid HTML syntax detected',
            };
        }
    }

    // Generate unique preview ID
    const previewId = uuidv4();

    // Combine HTML, CSS, and JS into a complete document
    const completeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eval Preview</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  ${html}
  ${js ? `<script>${js}</script>` : ''}
</body>
</html>
  `.trim();

    // Store the preview in sessionStorage or a global map
    // This will be read by the React component to display the iframe
    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`preview_${previewId}`, completeHtml);
    }

    // Trigger custom event to notify React app
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('sandbox-preview-ready', {
                detail: { previewId, html: completeHtml },
            })
        );
    }

    return {
        previewUrl: `/preview/${previewId}`,
        previewId,
        status: 'rendered',
    };
}
