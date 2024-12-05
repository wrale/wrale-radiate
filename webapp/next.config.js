/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode for Socket.IO stability
  reactStrictMode: false,
  webpack: (config) => {
    config.externals = [...(config.externals || []), {
      'bufferutil': 'bufferutil',
      'utf-8-validate': 'utf-8-validate'
    }]
    return config
  }
}

module.exports = nextConfig
