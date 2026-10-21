import { isClubLeader } from '../../../utils/permissions';

export default async (policyContext, config, { strapi }) => {
  const currentUser = policyContext.state.user;
  const clubId = policyContext.params.id;

  if (!currentUser || typeof clubId === 'undefined') {
    return false;
  }

  return isClubLeader(strapi, currentUser.documentId, clubId);
};
