/**
 * club controller
 *
 * Club approval is a staff-only decision made in the admin panel's Content
 * Manager — the public API never accepts `approvalStatus` from a client, so
 * a club always starts (and stays) `pending` until an admin changes it there.
 *
 * A pending/rejected club is also hidden from find/findOne unless the
 * requester is that club's own leader — otherwise "approval" would only
 * gate the field, not actual visibility.
 */

import { factories } from '@strapi/strapi';
import { isClubLeader, promoteToClubLeaderIfNeeded } from '../../../utils/permissions';
import { filterPaginatedResponse } from '../../../utils/list-filter';

const CLUB_EDITABLE_FIELDS = ['name', 'description', 'hostName', 'category'] as const;

function pick<T extends Record<string, unknown>>(obj: T, keys: readonly (keyof T)[]) {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

async function canView(strapi, currentUser, club) {
  if (club.approvalStatus === 'approved') {
    return true;
  }
  if (!currentUser) {
    return false;
  }
  return isClubLeader(strapi, currentUser.documentId, club.documentId);
}

export default factories.createCoreController('api::club.club', ({ strapi }) => ({
  async find(ctx) {
    const response = await super.find(ctx);
    const currentUser = ctx.state.user;

    return filterPaginatedResponse(response, (club) => canView(strapi, currentUser, club));
  },

  async findOne(ctx) {
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
    ctx.request.body.data = {
      ...pick(ctx.request.body.data ?? {}, CLUB_EDITABLE_FIELDS),
      approvalStatus: 'pending',
    };
    const response = await super.create(ctx);

    // The creator automatically becomes the club's first leader — otherwise
    // nobody could manage (or even see, once pending) the club they just made.
    const currentUser = ctx.state.user;
    if (currentUser && response?.data) {
      await strapi.documents('api::membership.membership').create({
        data: {
          club: response.data.documentId,
          user: currentUser.documentId,
          role: 'leader',
          joinedDate: new Date().toISOString(),
        },
      });
      await promoteToClubLeaderIfNeeded(strapi, currentUser.id);
    }

    return response;
  },

  async update(ctx) {
    ctx.request.body.data = pick(ctx.request.body.data ?? {}, CLUB_EDITABLE_FIELDS);
    return super.update(ctx);
  },
}));
