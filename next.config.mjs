// CSP пока только Report-Only: сначала собрать нарушения в консоли, потом включать.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://mc.yandex.com https://yastatic.net https://*.yandex.ru https://api-maps.yandex.ru https://smartcaptcha.yandexcloud.net",
  "style-src 'self' 'unsafe-inline' https://yastatic.net",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://yastatic.net",
  "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://*.yandex.ru https://*.yandex.net https://smartcaptcha.yandexcloud.net https://*.yclients.com",
  "frame-src 'self' https://yandex.ru https://*.yandex.ru https://*.yclients.com https://*.yclients.ru https://smartcaptcha.yandexcloud.net",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()'
  },
  { key: 'Content-Security-Policy-Report-Only', value: csp }
]

// Имена в /images и /icons без хеша — immutable нельзя, неделя + фоновое обновление.
const staticAssetCache = {
  key: 'Cache-Control',
  value: 'public, max-age=604800, stale-while-revalidate=2592000'
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/images/:path*', headers: [staticAssetCache] },
      { source: '/icons/:path*', headers: [staticAssetCache] },
      {
        source: '/:file(favicon.ico|icon-192.png|icon-512.png)',
        headers: [staticAssetCache]
      }
    ]
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: [{ loader: '@svgr/webpack', options: { icon: true } }]
      },
    )
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 день для /_next/image
    remotePatterns: [
      // YClients master avatars
      { protocol: 'https', hostname: 'assets.yclients.com' }
    ]
  }
};

export default nextConfig;
