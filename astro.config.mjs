// @ts-check
import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import { imageService } from "@unpic/astro/service";

// https://astro.build/config
export default defineConfig({
  integrations: [icon(), pagefind()],
  image: {
    service: imageService(),
  },
});
