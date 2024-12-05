/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Allow importing ws module
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'ws': 'commonjs ws'
    })
    return config
  }
}

module.exports = nextConfig