/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the headers configuration since we're using middleware
  webpack: (config) => {
    config.externals = [...(config.externals || []), { bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' }]
    return config
  }
}

module.exports = nextConfig