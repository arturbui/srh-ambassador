import { isClubLeader } from '../../../utils/permissions';

export default async (policyContext, config, { strapi }) => {
  const currentUser = policyContext.state.user;
  if (!currentUser) {
    return false;
  }

  const documentId = policyContext.params.id;
  let clubId: string | undefined;

  if (typeof documentId !== 'undefined') {
    const document = await strapi.documents('api::document.document').findOne({
      documentId,
      populate: { club: { fields: ['documentId'] } },
    });
    clubId = document?.club?.documentId;
  } else {
    clubId = policyContext.request.body?.data?.club;
  }

  if (!clubId) {
    return false;
  }

  return isClubLeader(strapi, currentUser.documentId, clubId);
};
