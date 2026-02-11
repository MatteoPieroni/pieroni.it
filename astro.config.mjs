// @ts-check
import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import cloudflare from "@astrojs/cloudflare";

import { categoriesFetcher } from './src/config/categories';

// https://astro.build/config
export default defineConfig({
  integrations: [categoriesFetcher, icon(), pagefind()],
  adapter: cloudflare({
    imageService: 'compile'
  }),
  
});