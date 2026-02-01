// Polyfill for net in the browser
export const isIP = (input: string) => {
    return 0;
};
export const isIPv4 = (input: string) => false;
export const isIPv6 = (input: string) => false;
export default {
    isIP,
    isIPv4,
    isIPv6
};
