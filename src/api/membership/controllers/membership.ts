/**
 * membership controller
 *
 * A membership row reveals who belongs to which club, so `find`/`findOne`
 * are scoped to "my own memberships" or "memberships of a club I lead" —
 * otherwise any authenticated user could enumerate every club's roster.
 *
 * `user` is a relation to plugin::users-permissions.user, which the public
 * REST layer silently drops from any populate and rejects outright as an
 * input key — so both reading and writing it go through the Document
 * Service directly instead of `ctx.query.populate` / `super.*()`.
 */

import { factories } from '@strapi/strapi';
import { isClubLeader, promoteToClubLeaderIfNeeded } from '../../../utils/permissions';
import { filterPaginatedResponse } from '../../../utils/list-filter';

async function isSelf(strapi, currentUser, membershipDocumentId: string) {
  if (!currentUser) {
    return false;
  }
  const full = await strapi.documents('api::membership.membership').findOne({
    documentId: membershipDocumentId,
    populate: { user: { fields: ['documentId'] } },
  });
  return full?.user?.documentId === currentUser.documentId;
}

async function canView(strapi, currentUser, membership) {
  if (!currentUser) {
    return false;
  }
  if (await isSelf(strapi, currentUser, membership.documentId)) {
    return true;
  }
  const clubId = membership.club?.documentId;
  if (!clubId) {
    return false;
  }
  return isClubLeader(strapi, currentUser.documentId, clubId);
}

export default factories.createCoreController('api::membership.membership', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: { ...(ctx.query.populate as object), club: { fields: ['documentId'] } },
    };

    const response = await super.find(ctx);
    const currentUser = ctx.state.user;

    return filterPaginatedResponse(response, (membership) => canView(strapi, currentUser, membership));
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
    // Joining a club is always self-service as a plain member — the client
    // cannot enroll someone else or self-promote to leader this way.
    const clientData = ctx.request.body?.data ?? {};

    const created = await strapi.documents('api::membership.membership').create({
      data: {
        club: clientData.club,
        user: ctx.state.user.documentId,
        role: 'member',
        joinedDate: new Date().toISOString(),
      },
    });

    ctx.body = { data: created };
  },

  async update(ctx) {
    // Role is the only field this route lets a club leader change (see
    // is-membership-club-leader) — promoting someone to leader here should
    // unlock the same actions that creating a club would have.
    const response = await super.update(ctx);

    if (response?.data?.role === 'leader') {
      const full = await strapi.documents('api::membership.membership').findOne({
        documentId: ctx.params.id,
        populate: { user: { fields: ['id'] } },
      });
      if (full?.user) {
        await promoteToClubLeaderIfNeeded(strapi, full.user.id);
      }
    }

    return response;
  },

  // Same restriction as above rules out `?filters[user]=...` from the
  // client, so a club leader looking at a roster has no way to tell which
  // row is their own — this answers that unambiguously, server-side.
  async mine(ctx) {
    const currentUser = ctx.state.user;
    if (!currentUser) {
      return ctx.unauthorized();
    }

    const memberships = await strapi.documents('api::membership.membership').findMany({
      filters: { user: { documentId: currentUser.documentId } },
      populate: { club: { fields: ['documentId'] } },
    });

    ctx.body = { data: memberships };
  },
}));
