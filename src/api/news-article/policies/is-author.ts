export default async (policyContext, config, { strapi }) => {
  const currentUser = policyContext.state.user;
  const articleId = policyContext.params.id;

  if (!currentUser || typeof articleId === 'undefined') {
    return false;
  }

  const article = await strapi.documents('api::news-article.news-article').findOne({
    documentId: articleId,
    populate: { author: { fields: ['documentId'] } },
  });

  if (!article || !article.author) {
    return false;
  }

  return article.author.documentId === currentUser.documentId;
};
