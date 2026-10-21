/**
 * event controller
 *
 * Strapi's public Content API refuses any input key that relates to
 * `plugin::users-permissions.user` (throws "Invalid key host") even when the
 * value is server-set, not client-supplied — so `host` can't be assigned via
 * the normal `super.create()` path. Calling the Document Service directly
 * bypasses that REST-layer restriction (it's the same service `is-owner`
 * already reads through), so we build the response ourselves instead.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::event.event', ({ strapi }) => ({
  async create(ctx) {
    const clientData = ctx.request.body?.data ?? {};

    const created = await strapi.documents('api::event.event').create({
      data: {
        name: clientData.name,
        material: clientData.material,
        host: ctx.state.user.documentId,
      },
      status: 'published',
    });

    ctx.body = { data: created };
  },

  // Same restriction as above rules out `?filters[host]=...` from the
  // client, so "which of these events are mine" (for showing edit/delete
  // controls) has to be answered server-side instead.
  async mine(ctx) {
    const currentUser = ctx.state.user;
    if (!currentUser) {
      return ctx.unauthorized();
    }

    const events = await strapi.documents('api::event.event').findMany({
      filters: { host: { documentId: currentUser.documentId } },
    });

    ctx.body = { data: events };
  },
}));
