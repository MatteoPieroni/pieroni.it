const oldSiteRedirects = {
  "/materiali-edili-attrezzature/": "https://www.pieroni.it/materiali-edili/",
  "/sala-mostra-bagno/cabine-piatti-doccia":
    "https://www.pieroni.it/negozio/bagno/piatti-doccia/",
  "/sala-mostra-bagno/vasche-da-bagno":
    "https://www.pieroni.it/negozio/bagno/vasche-da-bagno/",
  "/sala-mostra-bagno/mobili-arredo-bagno-sanitari":
    "https://www.pieroni.it/negozio/bagno/mobili-bagno/",
  "/sala-mostra-bagno/accessori-bagno-rubinetteria":
    "https://www.pieroni.it/negozio/bagno/accessori-bagno/",
  "/sala-mostra-bagno/": "https://www.pieroni.it/arredo-bagno/",
  "/mattonelle/pavimenti-cotto-gres-porcellanato":
    "https://www.pieroni.it/negozio/piastrelle/pavimenti/",
  "/mattonelle/rivestimenti-piastrelle-bagno":
    "https://www.pieroni.it/negozio/piastrelle/rivestimenti-bagno/",
  "/mattonelle/piastrelle-pavimenti-da-esterno":
    "https://www.pieroni.it/negozio/piastrelle/piastrelle-per-esterno/",
  "/mattonelle/": "https://www.pieroni.it/piastrelle-rivestimenti-bagno/",
  "/riscaldamento/stufe-a-pellet-e-legna":
    "https://www.pieroni.it/negozio/riscaldamento/stufe-a-pellet-e-legna/",
  "/riscaldamento/inserti-camini-pellet-legna":
    "https://www.pieroni.it/negozio/riscaldamento/camini-inserti/",
  "/riscaldamento/caldaie-pellet-legna":
    "https://www.pieroni.it/negozio/riscaldamento/caldaie-a-pellet/",
  "/riscaldamento/offerta-pellet-prestagionale-prezzi/":
    "https://www.pieroni.it/negozio/riscaldamento/pellet-prezzi-offerta/",
  "/riscaldamento/": "https://www.pieroni.it/stufe-caldaie-pellet/",
  "/ferramenta-utensileria/": "https://www.pieroni.it/ferramenta/",
  "/outlet/": "https://outlet.pieroni.it",
  "/dove-siamo-magazzino-edile/diecimo-lucca/":
    "https://www.pieroni.it/magazzino-edile/diecimo-borgo-a-mozzano/",
  "/dove-siamo-magazzino-edile/fornaci-di-barga-lucca/":
    "https://www.pieroni.it/category/blog/pieroni-srl/nuovi-progetti-per-il-futuro/",
  "/dove-siamo-magazzino-edile/lucca/":
    "https://www.pieroni.it/magazzino-edile/lucca-capannori/",
  "/dove-siamo-magazzino-edile/": "https://www.pieroni.it/magazzino-edile/",
  "/category/speciali/eventi/": "https://www.pieroni.it/category/eventi/",
  "/category/speciali/forni-e-barbecue/":
    "https://www.pieroni.it/category/gli-speciali/forni-e-barbecue/",
  "/category/speciali/pavimenti/":
    "https://www.pieroni.it/category/gli-speciali/pavimenti/",
  "/category/speciali/riscaldamento/":
    "https://www.pieroni.it/category/gli-speciali/riscaldamento/",
  "/category/speciali/": "https://www.pieroni.it/category/gli-speciali/",
  "/dove-siamo/diecimo/":
    "https://www.pieroni.it/magazzino-edile/diecimo-borgo-a-mozzano/",
  "/dove-siamo/fornaci/":
    "https://www.pieroni.it/category/blog/pieroni-srl/nuovi-progetti-per-il-futuro/",
  "/dove-siamo/": "https://www.pieroni.it/magazzino-edile/",
  "/magazzino-edile/fornaci-di-barga/":
    "https://www.pieroni.it/category/blog/pieroni-srl/nuovi-progetti-per-il-futuro/",
};

const retiredLandings = {
  "/tv*": "https://www.pieroni.it/",
  "/eventi*": "https://www.pieroni.it/professionisti-edilizia/",
  "/primo-maggio*": "https://www.pieroni.it",
  "/offerta-pellet-prestagionale-prezzi*":
    "https://www.pieroni.it/negozio/riscaldamento/pellet-prezzi-offerta/",
  "/stufa-pellet-tutto-compreso-989-euro*":
    "https://www.pieroni.it/negozio/riscaldamento/stufe-a-pellet-e-legna/",
  "/chiusura-camini*": "https://www.pieroni.it/stufe-caldaie-pellet/",
  "/promo-camini*":
    "https://www.pieroni.it/negozio/riscaldamento/camini-inserti/",
};

const retiredArticles = {
  "/category/blog/tanti-auguri*": "https://www.pieroni.it/category/blog/",
  "/category/tanti-auguri*": "https://www.pieroni.it/category/blog/",
  "/category/blog/siamo-alla-ricerca-di-nuovi-collaboratori*":
    "https://www.pieroni.it/category/blog/",
  "/category/siamo-alla-ricerca-di-nuovi-collaboratori*":
    "https://www.pieroni.it/category/blog/",
  "/category/blog/iris*": "https://www.pieroni.it/category/blog/",
  "/category/iris*": "https://www.pieroni.it/category/blog/",
  "/category/blog/wemo-controlla-la-tua-casa-con-lo-smartphone*":
    "https://www.pieroni.it/category/blog/",
  "/category/wemo-controlla-la-tua-casa-con-lo-smartphone*":
    "https://www.pieroni.it/category/blog/",
  "/conto-termico-2018-incentivo-per-il-risparmio-energetico/":
    "https://www.pieroni.it/category/gli-speciali/conto-termico-2018-incentivo-per-il-risparmio-energetico/",
  "/detrazioni-ristrutturazioni-bonus-energetico-antisismico-2018-la-nostra-guida/":
    "https://www.pieroni.it/category/gli-speciali/detrazioni-ristrutturazioni-bonus-energetico-e-antisismico-2018-la-nostra-guida/",
  "/forni-da-esterno/":
    "https://www.pieroni.it/category/gli-speciali/forni-e-barbecue/",

  "/category/gli-speciali/g-magic-la-vasca-si-fa-doccia*":
    "https://www.pieroni.it/category/category/gli-speciali/bagno/trasformare-la-vasca-in-doccia-i-materiali-giusti-per-un-cambio-volto-rapido-e-senza-stress/",
  "/category/gli-speciali/bagno/g-magic-la-vasca-si-fa-doccia*":
    "https://www.pieroni.it/category/category/gli-speciali/bagno/trasformare-la-vasca-in-doccia-i-materiali-giusti-per-un-cambio-volto-rapido-e-senza-stress/",
  "/category/g-magic-la-vasca-si-fa-doccia*":
    "https://www.pieroni.it/category/category/gli-speciali/bagno/trasformare-la-vasca-in-doccia-i-materiali-giusti-per-un-cambio-volto-rapido-e-senza-stress/",

  "/category/gli-speciali/pavimenti/mirage-evo_2-e*":
    "https://www.pieroni.it/category/gli-speciali/pavimenti/pavimenti-da-esterni-come-scegliere-la-superficie-perfetta-per-il-tuo-outdoor/",
  "/category/gli-speciali/mirage-evo_2-e*":
    "https://www.pieroni.it/category/gli-speciali/pavimenti/pavimenti-da-esterni-come-scegliere-la-superficie-perfetta-per-il-tuo-outdoor/",
  "/category/mirage-evo_2-e*":
    "https://www.pieroni.it/category/gli-speciali/pavimenti/pavimenti-da-esterni-come-scegliere-la-superficie-perfetta-per-il-tuo-outdoor/",

  "/category/gli-speciali/pavimenti/esterno-tagina-woodays-compact-20mm*":
    "https://www.pieroni.it/category/gli-speciali/pavimenti/ilcottotagina-il-fascino-del-cotto-la-forza-del-gres/",
  "/category/gli-speciali/esterno-tagina-woodays-compact-20mm*":
    "https://www.pieroni.it/category/gli-speciali/pavimenti/ilcottotagina-il-fascino-del-cotto-la-forza-del-gres/",
  "/category/esterno-tagina-woodays-compact-20mm*":
    "https://www.pieroni.it/category/gli-speciali/pavimenti/ilcottotagina-il-fascino-del-cotto-la-forza-del-gres/",

  "/category/gli-speciali/riscaldamento/solarfocus-therminator-ii*":
    "https://www.pieroni.it/category/gli-speciali/riscaldamento/caldaia-a-pellet-prisma-h-di-edilkamin-efficienza-e-incentivi-per-la-tua-casa/",
  "/category/gli-speciali/solarfocus-therminator-ii*":
    "https://www.pieroni.it/category/gli-speciali/riscaldamento/caldaia-a-pellet-prisma-h-di-edilkamin-efficienza-e-incentivi-per-la-tua-casa/",
  "/category/solarfocus-therminator-ii*":
    "https://www.pieroni.it/category/gli-speciali/riscaldamento/caldaia-a-pellet-prisma-h-di-edilkamin-efficienza-e-incentivi-per-la-tua-casa/",

  "/category/gli-speciali/forni-e-barbecue/barbecue-e-griglie*":
    "https://www.pieroni.it/category/gli-speciali/forni-e-barbecue/forni-da-esterno/",
  "/category/gli-speciali/barbecue-e-griglie*":
    "https://www.pieroni.it/category/gli-speciali/forni-e-barbecue/forni-da-esterno/",
  "/category/barbecue-e-griglie*":
    "https://www.pieroni.it/category/gli-speciali/forni-e-barbecue/forni-da-esterno/",
};

const movedArticles = {
  "/category/blog/pieroni-srl/come-proteggere-la-nostra-casa-dai-batteri*":
    "https://www.pieroni.it/category/gli-speciali/tecnologie-e-materiali/come-proteggere-la-nostra-casa-dai-batteri/",
  "/category/pieroni-srl/come-proteggere-la-nostra-casa-dai-batteri*":
    "https://www.pieroni.it/category/gli-speciali/tecnologie-e-materiali/come-proteggere-la-nostra-casa-dai-batteri/",

  "/category/blog/pieroni-srl/progetto-fuoco-2014*":
    "https://www.pieroni.it/category/blog/progetto-fuoco-2014/",
  "/category/pieroni-srl/progetto-fuoco-2014*":
    "https://www.pieroni.it/category/blog/progetto-fuoco-2014/",

  "/category/blog/pieroni-srl/quanto-spendi-per-riscaldare-la-tua-casa*":
    "https://www.pieroni.it/category/blog/quanto-spendi-per-riscaldare-la-tua-casa/",
  "/category/pieroni-srl/quanto-spendi-per-riscaldare-la-tua-casa*":
    "https://www.pieroni.it/category/blog/quanto-spendi-per-riscaldare-la-tua-casa/",
};

export const redirects = {
  ...oldSiteRedirects,
  ...retiredArticles,
  ...retiredLandings,
  ...movedArticles,
};
