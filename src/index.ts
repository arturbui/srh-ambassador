import type { Core } from '@strapi/strapi';
import { ensureLocales } from './bootstrap/locales';
import { syncUsersPermissionsRoles } from './bootstrap/users-permissions-roles';
import { syncAdminRoles } from './bootstrap/admin-roles';
import { ensureDemoData } from './bootstrap/demo-accounts';

export default {
  register() {},

  /**
   * Runs on every server start (including autoReload restarts in
   * development), so it must stay idempotent: it upserts locales and
   * roles/permissions from code rather than requiring a one-off admin-panel
   * setup step that would be lost on a fresh database.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales({ strapi });
    await syncUsersPermissionsRoles({ strapi });
    await syncAdminRoles({ strapi });
    await ensureDemoData({ strapi });
  },
};
