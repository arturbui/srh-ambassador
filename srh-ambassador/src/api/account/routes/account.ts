/**
 * account router — see controller for why this exists at all.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/account/me',
      handler: 'account.me',
      config: { policies: [] },
    },
  ],
};
