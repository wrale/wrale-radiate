/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), {
      'bufferutil': 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
      'ws': 'ws'
    }]
    return config
  },
  // Disable strict mode for WebSocket stability
  reactStrictMode: false
}

module.exports = nextConfig
