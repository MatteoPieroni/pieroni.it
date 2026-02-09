// @ts-check
import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import pagefind from "astro-pagefind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [icon(), pagefind()],
  adapter: cloudflare({
    imageService: 'compile'
  }),
});