// This file polyfills node:stream/web for the browser environment
// by re-exporting the native Web Streams API from globalThis.

export const ReadableStream = globalThis.ReadableStream;
export const WritableStream = globalThis.WritableStream;
export const TransformStream = globalThis.TransformStream;
export const TextEncoderStream = globalThis.TextEncoderStream;
export const TextDecoderStream = globalThis.TextDecoderStream;
export const ByteLengthQueuingStrategy = globalThis.ByteLengthQueuingStrategy;
export const CountQueuingStrategy = globalThis.CountQueuingStrategy;
