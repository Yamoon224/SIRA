/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Un seul domaine canonique. www.goriya.net servait le site tel quel : la
  // connexion Google y échouait (« origin_mismatch », l'origine www n'étant pas
  // déclarée chez Google) et la session NextAuth, posée pour goriya.net, n'y
  // était pas reconnue.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.goriya.net" }],
        destination: "https://goriya.net/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
