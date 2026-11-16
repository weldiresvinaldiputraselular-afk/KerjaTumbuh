import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KerjaTumbuh",
    short_name: "KerjaTumbuh",
    description: "Platform Pemberdayaan Kerja dan UMKM Lokal",
    start_url: "/",
    display: "standalone",
    background_color: "#ECFDF5",
    theme_color: "#0F766E",
    lang: "id",
    icons: [
      { src: "/logo/kerjatumbuh-icon.png", sizes: "512x512", type: "image/png" },
      { src: "/logo/kerjatumbuh-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
