import { isClubLeader } from '../../../utils/permissions';

export default async (policyContext, config, { strapi }) => {
  const currentUser = policyContext.state.user;
  const membershipId = policyContext.params.id;

  if (!currentUser || typeof membershipId === 'undefined') {
    return false;
  }

  const membership = await strapi.documents('api::membership.membership').findOne({
    documentId: membershipId,
    populate: { club: { fields: ['documentId'] } },
  });

  if (!membership?.club) {
    return false;
  }

  return isClubLeader(strapi, currentUser.documentId, membership.club.documentId);
};
