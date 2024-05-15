/** @type {import('next').NextConfig} */
module.exports = {
    transpilePackages: ["geist"],
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'flagsapi.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.akamai.steamstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.akamai.steamstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.steamstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.cloudflare.steamstatic.com',
            }
        ]
    },
    webpack: (config) => config,
};
