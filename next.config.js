/** @type {import('next').NextConfig} */
const path = require("path");

const isDev = process.env.NODE_ENV === 'development';

let ContentSecurityPolicy = `
  default-src 'self';
  connect-src 'self' vitals.vercel-insights.com;`;

ContentSecurityPolicy += isDev ? `
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
` : `
  script-src 'self';
  style-src 'self';
`;

const securityHeaders = [
    {
        key: "X-Frame-Options",
        value: "deny",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Content-Security-Policy",
        value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
];

const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                // Apply these headers to all routes in your application.
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
    },
    webpack: (config) => {
        config.resolve.alias["~"] = path.resolve(__dirname);
        return config;
    },
};

module.exports = nextConfig;
