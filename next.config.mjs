/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Foto prodotto dal bucket Supabase Storage "product-images"
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
