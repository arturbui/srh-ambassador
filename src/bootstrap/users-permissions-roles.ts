import type { Core } from '@strapi/strapi';
import type { PermissionGrant } from './permission-grants';
import {
  PUBLIC_GRANTS,
  AUTHENTICATED_GRANTS,
  CLUB_LEADER_GRANTS,
  CONTENT_EDITOR_GRANTS,
  AMBASSADOR_GRANTS,
} from './permission-grants';

interface RoleSpec {
  type: string;
  name: string;
  description: string;
  grants: PermissionGrant[];
}

// 'public' and 'authenticated' already exist by default in every Strapi project;
// the two custom roles are created here if missing.
const ROLE_SPECS: RoleSpec[] = [
  {
    type: 'public',
    name: 'Public',
    description: 'Default role given to unauthenticated visitors (web & mobile).',
    grants: PUBLIC_GRANTS,
  },
  {
    type: 'authenticated',
    name: 'Authenticated',
    description: 'Default role given to any logged-in student or ambassador.',
    grants: AUTHENTICATED_GRANTS,
  },
  {
    type: 'club_leader',
    name: 'Club Leader',
    description: 'A member with role=leader on at least one club membership; can manage that club\'s activities, documents, roster and events.',
    grants: CLUB_LEADER_GRANTS,
  },
  {
    type: 'content_editor',
    name: 'Content Editor',
    description: 'PR/newsroom staff who write and publish news articles.',
    grants: CONTENT_EDITOR_GRANTS,
  },
  {
    type: 'ambassador',
    name: 'Ambassador',
    description: 'Campus ambassador — the only public-API role (besides admin-panel staff) that can post events.',
    grants: AMBASSADOR_GRANTS,
  },
];

function applyGrants(permissionTree: any, grants: PermissionGrant[]) {
  for (const grant of grants) {
    const controllerActions = permissionTree[grant.uid]?.controllers?.[grant.controller];
    if (!controllerActions) {
      continue;
    }
    for (const actionName of Object.keys(controllerActions)) {
      controllerActions[actionName].enabled = grant.actions.includes(actionName);
    }
  }
}

export async function syncUsersPermissionsRoles({ strapi }: { strapi: Core.Strapi }) {
  const roleService = strapi.plugin('users-permissions').service('role');

  for (const spec of ROLE_SPECS) {
    let role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: spec.type },
    });

    if (!role) {
      await roleService.createRole({
        name: spec.name,
        description: spec.description,
        type: spec.type,
        permissions: {},
      });
      role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: spec.type },
      });
      strapi.log.info(`[bootstrap] created Users-Permissions role "${spec.name}"`);
    }

    const full = await roleService.findOne(role.id);
    applyGrants(full.permissions, spec.grants);

    await roleService.updateRole(role.id, {
      name: spec.name,
      description: spec.description,
      permissions: full.permissions,
    });
  }
}
