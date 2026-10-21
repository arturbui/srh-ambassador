/**
 * news-article router
 *
 * `/news-articles/mine` is registered before the core router's routes so it
 * isn't swallowed by `/news-articles/:id` — see the controller for why it
 * exists at all (populating/filtering by `author` from the public API
 * isn't possible).
 *
 * Strapi mutates each route object in place (attaching `route.info`) the
 * first time it reads `.routes`, then expects that same object back on
 * every later read — so this list is built once and cached, not
 * recomputed per access.
 */

import { factories } from '@strapi/strapi';

const defaultRouter = factories.createCoreRouter('api::news-article.news-article', {
  config: {
    update: {
      policies: ['is-author'],
    },
    delete: {
      policies: ['is-author'],
    },
  },
});

let cachedRoutes: any[] | undefined;

export default {
  get prefix() {
    return (defaultRouter as any).prefix;
  },
  get routes() {
    if (!cachedRoutes) {
      const coreRoutes =
        typeof defaultRouter.routes === 'function' ? defaultRouter.routes() : defaultRouter.routes;
      cachedRoutes = [
        {
          method: 'GET',
          path: '/news-articles/mine',
          handler: 'news-article.mine',
          config: { policies: [] },
        },
        ...coreRoutes,
      ];
    }
    return cachedRoutes;
  },
};
