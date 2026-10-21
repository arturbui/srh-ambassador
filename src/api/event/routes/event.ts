/**
 * event router
 *
 * `/events/mine` is registered before the core router's routes so it isn't
 * swallowed by `/events/:id` — see the controller for why it exists at all
 * (populating/filtering by `host` from the public API isn't possible).
 *
 * Strapi mutates each route object in place (attaching `route.info`) the
 * first time it reads `.routes`, then expects that same object back on
 * every later read — so this list is built once and cached, not
 * recomputed per access.
 */

import { factories } from '@strapi/strapi';

const defaultRouter = factories.createCoreRouter('api::event.event', {
  config: {
    delete: {
      policies: ['is-owner'],
    },
    update: {
      policies: ['is-owner'],
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
          path: '/events/mine',
          handler: 'event.mine',
          config: { policies: [] },
        },
        ...coreRoutes,
      ];
    }
    return cachedRoutes;
  },
};
