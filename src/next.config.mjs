/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["geist"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.steamstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.cloudflare.steamstatic.com',
            }
        ]
    }
};

export default nextConfig;