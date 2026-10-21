import type { Core } from '@strapi/strapi';

/**
 * Seeds a handful of demo accounts — one per Users-Permissions role — plus
 * enough sample content that each one has something real to show off, not
 * an empty state. Runs on every boot; every step checks for existing data
 * first, so it's safe to re-run and never duplicates anything.
 *
 * These are throwaway local-dev accounts, so credentials are intentionally
 * simple and not treated as secret — the frontend's demo-profile buttons
 * log straight in with them.
 */

interface DemoAccountSpec {
  username: string;
  email: string;
  password: string;
  roleType: 'authenticated' | 'club_leader' | 'content_editor' | 'ambassador';
  universityStatus: 'student' | 'exchange_student' | 'professor' | 'ambassador';
}

export const DEMO_ACCOUNTS: DemoAccountSpec[] = [
  {
    username: 'demo_student',
    email: 'demo-student@example.com',
    password: 'DemoPass123!',
    roleType: 'authenticated',
    universityStatus: 'student',
  },
  {
    username: 'demo_leader',
    email: 'demo-leader@example.com',
    password: 'DemoPass123!',
    roleType: 'club_leader',
    universityStatus: 'student',
  },
  {
    username: 'demo_editor',
    email: 'demo-editor@example.com',
    password: 'DemoPass123!',
    roleType: 'content_editor',
    // Not 'ambassador' — that status would be confusing to pair with a
    // demo account whose whole point is showing the Content Editor *role*.
    universityStatus: 'professor',
  },
  {
    username: 'demo_ambassador',
    email: 'demo-ambassador@example.com',
    password: 'DemoPass123!',
    roleType: 'ambassador',
    universityStatus: 'ambassador',
  },
];

async function ensureDemoUsers(strapi: Core.Strapi) {
  const userService = strapi.plugin('users-permissions').service('user');
  const ids: Record<string, { id: number; documentId: string }> = {};

  for (const spec of DEMO_ACCOUNTS) {
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: spec.roleType },
    });

    let user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: spec.email },
    });

    if (!user) {
      user = await userService.add({
        username: spec.username,
        email: spec.email,
        password: spec.password,
        provider: 'local',
        confirmed: true,
        role: role.id,
        universityStatus: spec.universityStatus,
      });
      strapi.log.info(`[bootstrap] created demo account ${spec.email}`);
    } else {
      // Keep role/status converged even if something upstream (e.g. manual
      // admin-panel edits) drifted them from the intended demo state.
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: { role: role.id, universityStatus: spec.universityStatus },
      });
    }

    ids[spec.email] = { id: user.id, documentId: user.documentId };
  }

  return ids;
}

async function ensureDemoClub(strapi: Core.Strapi, leaderDocumentId: string) {
  let club = await strapi.db.query('api::club.club').findOne({
    where: { name: 'Demo Robotics Club' },
  });

  if (!club) {
    club = await strapi.documents('api::club.club').create({
      data: {
        name: 'Demo Robotics Club',
        description: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'A demo club, seeded so the Club Leader demo account has something real to manage.' }],
          },
        ],
        hostName: 'Demo Leader',
        approvalStatus: 'approved',
      },
      status: 'published',
    });
    strapi.log.info('[bootstrap] created demo club');
  }

  const existingMembership = await strapi.documents('api::membership.membership').findMany({
    filters: { club: { documentId: club.documentId }, user: { documentId: leaderDocumentId } },
    limit: 1,
  });
  if (existingMembership.length === 0) {
    await strapi.documents('api::membership.membership').create({
      data: {
        club: club.documentId,
        user: leaderDocumentId,
        role: 'leader',
        joinedDate: new Date().toISOString(),
      },
    });
  }

  const existingActivity = await strapi.documents('api::activity.activity').findMany({
    filters: { club: { documentId: club.documentId } },
    limit: 1,
  });
  if (existingActivity.length === 0) {
    await strapi.documents('api::activity.activity').create({
      data: {
        title: 'Weekly Build Session',
        description: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Open build night — bring your project, tools provided.' }] },
        ],
        location: 'Engineering Lab, Building B',
        capacity: 20,
        club: club.documentId,
      },
      status: 'published',
    });
    strapi.log.info('[bootstrap] created demo activity');
  }
}

async function ensureDemoArticle(strapi: Core.Strapi, authorDocumentId: string) {
  const existing = await strapi.documents('api::news-article.news-article').findMany({
    filters: { title: 'Welcome Back, Ambassadors!' },
    limit: 1,
  });
  if (existing.length > 0) {
    return;
  }

  await strapi.documents('api::news-article.news-article').create({
    data: {
      title: 'Welcome Back, Ambassadors!',
      category: 'announcement',
      content: [
        { type: 'paragraph', children: [{ type: 'text', text: 'A demo article, seeded so the Content Editor demo account has something published.' }] },
      ],
      author: authorDocumentId,
    },
    status: 'published',
  });
  strapi.log.info('[bootstrap] created demo article');
}

async function ensureDemoEvent(strapi: Core.Strapi, hostDocumentId: string) {
  const existing = await strapi.documents('api::event.event').findMany({
    filters: { name: 'Campus Tour: Meet the Ambassadors' },
    limit: 1,
  });
  if (existing.length > 0) {
    return;
  }

  await strapi.documents('api::event.event').create({
    data: {
      name: 'Campus Tour: Meet the Ambassadors',
      host: hostDocumentId,
    },
    status: 'published',
  });
  strapi.log.info('[bootstrap] created demo event');
}

export async function ensureDemoData({ strapi }: { strapi: Core.Strapi }) {
  const users = await ensureDemoUsers(strapi);
  await ensureDemoClub(strapi, users['demo-leader@example.com'].documentId);
  await ensureDemoArticle(strapi, users['demo-editor@example.com'].documentId);
  await ensureDemoEvent(strapi, users['demo-ambassador@example.com'].documentId);
}
