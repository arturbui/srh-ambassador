/**
 * activity router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::activity.activity', {
  config: {
    create: {
      policies: ['is-activity-club-leader'],
    },
    update: {
      policies: ['is-activity-club-leader'],
    },
    delete: {
      policies: ['is-activity-club-leader'],
    },
  },
});
