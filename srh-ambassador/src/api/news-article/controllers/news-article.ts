/**
 * news-article controller
 *
 * See event controller for why `author` (a relation to
 * plugin::users-permissions.user) has to be set via the Document Service
 * directly rather than through `ctx.request.body.data` + `super.create()`.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::news-article.news-article', ({ strapi }) => ({
  async create(ctx) {
    const clientData = ctx.request.body?.data ?? {};

    const created = await strapi.documents('api::news-article.news-article').create({
      data: {
        title: clientData.title,
        category: clientData.category,
        content: clientData.content,
        author: ctx.state.user.documentId,
      },
      status: 'published',
    });

    ctx.body = { data: created };
  },

  // Same restriction as above rules out `?filters[author]=...` from the
  // client, so "which of these articles are mine" (for showing edit/delete
  // controls) has to be answered server-side instead.
  async mine(ctx) {
    const currentUser = ctx.state.user;
    if (!currentUser) {
      return ctx.unauthorized();
    }

    const articles = await strapi.documents('api::news-article.news-article').findMany({
      filters: { author: { documentId: currentUser.documentId } },
    });

    ctx.body = { data: articles };
  },
}));
