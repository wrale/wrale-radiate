/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add fallbacks for Socket.IO dependencies
    config.externals = [...(config.externals || []), { bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' }]
    return config
  }
}

module.exports = nextConfig