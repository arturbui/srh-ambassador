import { isClubLeader } from '../../../utils/permissions';

export default async (policyContext, config, { strapi }) => {
  const currentUser = policyContext.state.user;
  if (!currentUser) {
    return false;
  }

  const activityId = policyContext.params.id;
  let clubId: string | undefined;

  if (typeof activityId !== 'undefined') {
    const activity = await strapi.documents('api::activity.activity').findOne({
      documentId: activityId,
      populate: { club: { fields: ['documentId'] } },
    });
    clubId = activity?.club?.documentId;
  } else {
    clubId = policyContext.request.body?.data?.club;
  }

  if (!clubId) {
    return false;
  }

  return isClubLeader(strapi, currentUser.documentId, clubId);
};
