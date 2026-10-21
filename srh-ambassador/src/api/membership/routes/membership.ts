/**
 * membership router
 *
 * `/memberships/mine` is registered before the core router's routes so it
 * isn't swallowed by `/memberships/:id` — see the controller for why it
 * exists at all (populating/filtering by `user` from the public API isn't
 * possible, so a leader viewing a club's roster has no other way to tell
 * which row is their own).
 *
 * Strapi mutates each route object in place (attaching `route.info`) the
 * first time it reads `.routes`, then expects that same object back on
 * every later read — so this list is built once and cached, not
 * recomputed per access.
 */

import { factories } from '@strapi/strapi';

const defaultRouter = factories.createCoreRouter('api::membership.membership', {
  config: {
    update: {
      policies: ['is-membership-club-leader'],
    },
    delete: {
      policies: ['is-self-or-club-leader'],
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
          path: '/memberships/mine',
          handler: 'membership.mine',
          config: { policies: [] },
        },
        ...coreRoutes,
      ];
    }
    return cachedRoutes;
  },
};
