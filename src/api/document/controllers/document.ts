/**
 * document controller
 *
 * Two Strapi v5 quirks drive the shape of this file:
 * - `visibility` can't be enforced with a route policy alone because `find`
 *   returns a mixed-visibility list, so the controller filters the response.
 * - Relations to `plugin::users-permissions.user` (here, `uploadedBy`) are
 *   silently stripped from any public-API populate, and rejected outright as
 *   an input key on create — so both reading and writing `uploadedBy` have
 *   to go through the Document Service directly instead of the usual
 *   `ctx.query.populate` / `ctx.request.body.data` + `super.*()` path.
 */

import { factories } from '@strapi/strapi';
import { isClubLeader, isClubMember } from '../../../utils/permissions';
import { filterPaginatedResponse } from '../../../utils/list-filter';

async function isUploader(strapi, currentUser, documentId: string) {
  if (!currentUser) {
    return false;
  }
  const full = await strapi.documents('api::document.document').findOne({
    documentId,
    populate: { uploadedBy: { fields: ['documentId'] } },
  });
  return full?.uploadedBy?.documentId === currentUser.documentId;
}

async function canView(strapi, currentUser, document) {
  if (document.visibility === 'public') {
    return true;
  }
  if (!currentUser) {
    return false;
  }
  if (await isUploader(strapi, currentUser, document.documentId)) {
    return true;
  }
  const clubId = document.club?.documentId;
  if (!clubId) {
    return false;
  }
  if (document.visibility === 'leaders') {
    return isClubLeader(strapi, currentUser.documentId, clubId);
  }
  return isClubMember(strapi, currentUser.documentId, clubId);
}

export default factories.createCoreController('api::document.document', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: { ...(ctx.query.populate as object), club: { fields: ['documentId'] } },
    };

    const response = await super.find(ctx);
    const currentUser = ctx.state.user;

    return filterPaginatedResponse(response, (document) => canView(strapi, currentUser, document));
  },

  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: { ...(ctx.query.populate as object), club: { fields: ['documentId'] } },
    };

    const response = await super.findOne(ctx);
    if (!response?.data) {
      return response;
    }

    if (!(await canView(strapi, ctx.state.user, response.data))) {
      return ctx.forbidden();
    }

    return response;
  },

  async create(ctx) {
    const clientData = ctx.request.body?.data ?? {};

    const created = await strapi.documents('api::document.document').create({
      data: {
        title: clientData.title,
        description: clientData.description,
        file: clientData.file,
        visibility: clientData.visibility,
        club: clientData.club,
        uploadedBy: ctx.state.user.documentId,
      },
      status: 'published',
    });

    ctx.body = { data: created };
  },
}));
