/**
 * Shared row-level authorization helpers.
 *
 * "Club leader" / "club member" are not admin-panel roles — they are derived
 * per-club from the membership.role field, so a single user can lead one
 * club and be a plain member of another.
 */

import type { Core } from '@strapi/strapi';

export async function isClubLeader(
  strapi: Core.Strapi,
  userDocumentId: string,
  clubDocumentId: string
): Promise<boolean> {
  const memberships = await strapi.documents('api::membership.membership').findMany({
    filters: {
      club: { documentId: clubDocumentId },
      user: { documentId: userDocumentId },
      role: 'leader',
    },
    limit: 1,
  });
  return memberships.length > 0;
}

export async function isClubMember(
  strapi: Core.Strapi,
  userDocumentId: string,
  clubDocumentId: string
): Promise<boolean> {
  const memberships = await strapi.documents('api::membership.membership').findMany({
    filters: {
      club: { documentId: clubDocumentId },
      user: { documentId: userDocumentId },
    },
    limit: 1,
  });
  return memberships.length > 0;
}

// A brand-new user is on the "Authenticated" Users-Permissions role, which
// has no create/update permission on Activity/Document/etc — so becoming a
// leader (by creating a club, or being promoted on an existing one) has to
// also unlock that action category, or "leader" would be a dead end. Never
// downgrades someone already on a more specific role (e.g. Content Editor).
export async function promoteToClubLeaderIfNeeded(strapi: Core.Strapi, userId: number | string) {
  const user = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { id: userId },
    populate: { role: true },
  });
  if (user?.role?.type !== 'authenticated') {
    return;
  }
  const clubLeaderRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'club_leader' },
  });
  if (clubLeaderRole) {
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: userId },
      data: { role: clubLeaderRole.id },
    });
  }
}
