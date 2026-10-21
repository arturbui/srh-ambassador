import type { Core } from '@strapi/strapi';

/**
 * Admin-panel (back-office) roles — separate from the Users-Permissions
 * roles in ./users-permissions-roles.ts, which govern the public REST API.
 * These control who can do what inside /admin, via the Content Manager.
 */

interface AdminRoleSpec {
  name: string;
  description: string;
  /** Content-type uids this role gets full manage (create/read/update/delete/publish) access to */
  subjects: string[];
}

const ADMIN_ROLE_SPECS: AdminRoleSpec[] = [
  {
    name: 'Club Administrator',
    description:
      "Back-office staff who manage clubs, categories, activities, memberships, documents and events — including approving or rejecting a club's approvalStatus.",
    subjects: [
      'api::club.club',
      'api::category.category',
      'api::activity.activity',
      'api::membership.membership',
      'api::document.document',
      'api::event.event',
    ],
  },
  {
    name: 'News Moderator',
    description: 'Back-office staff who write, edit and publish news articles.',
    subjects: ['api::news-article.news-article'],
  },
];

function uploadPermissions() {
  return [
    { action: 'plugin::upload.read' },
    { action: 'plugin::upload.assets.create' },
    { action: 'plugin::upload.assets.update' },
    { action: 'plugin::upload.assets.download' },
  ];
}

export async function syncAdminRoles({ strapi }: { strapi: Core.Strapi }) {
  const roleService = strapi.service('admin::role');
  const permissionService = strapi.service('admin::permission');
  const contentTypeService = strapi.service('admin::content-type');

  const contentTypeActions = permissionService.actionProvider
    .values()
    .filter((action: any) => action.section === 'contentTypes');

  for (const spec of ADMIN_ROLE_SPECS) {
    let role = await roleService.findOne({ name: spec.name });

    if (!role) {
      role = await roleService.create({
        name: spec.name,
        description: spec.description,
      });
      strapi.log.info(`[bootstrap] created admin role "${spec.name}"`);
    }

    const scopedActions = contentTypeActions.map((action: any) => ({
      ...action,
      subjects: action.subjects.filter((subject: string) => spec.subjects.includes(subject)),
    }));

    const permissions = [
      ...contentTypeService.getPermissionsWithNestedFields(scopedActions, {}),
      ...uploadPermissions(),
    ];

    await roleService.assignPermissions(role.id, permissions);
  }
}
