/**
 * document router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::document.document', {
  config: {
    create: {
      policies: ['is-document-club-leader'],
    },
    update: {
      policies: ['is-document-club-leader'],
    },
    delete: {
      policies: ['is-document-club-leader'],
    },
  },
});
