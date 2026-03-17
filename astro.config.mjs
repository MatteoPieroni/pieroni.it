// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import compress from "@playform/compress";
import compressor from "astro-compressor";

import { categoriesFetcher } from "./src/config/categories";
import { redirects } from "./src/config/redirects";

// https://astro.build/config
export default defineConfig({
  site: "https://www.pieroni.it",
  trailingSlash: "always",
  integrations: [
    categoriesFetcher,
    icon(),
    pagefind(),
    sitemap(),
    compress({
      CSS: {
        csso: false,
        lightningcss: {
          minify: true,
        },
      },
      HTML: {
        "html-minifier-terser": {
          minifyCSS: false,
        },
      },
    }),
    compressor(),
  ],
  image: {
    domains: ["https://images.pieroni.it", "https://be.pieroni.it"],
  },
  adapter: cloudflare({
    imageService: "compile",
  }),
  redirects,

  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "Source Sans Pro",
        cssVariable: "--font-sourceSansPro",
        weights: [300, 400, 600],
        subsets: ["latin"],
        styles: ["normal"],
        fallbacks: [
          "HelveticaNeue-Light",
          "Helvetica Neue Light",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "Lucida Grande",
          "sans-serif",
        ],
      },
    ],
  },
});
