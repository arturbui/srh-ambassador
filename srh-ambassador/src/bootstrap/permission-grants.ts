/**
 * Source of truth for the Users-Permissions (public API) role matrix.
 *
 * Each entry says, for one content-type controller, exactly which core
 * actions are enabled — every action left out is explicitly disabled, so
 * re-running bootstrap always converges the DB back to this table instead
 * of drifting from ad-hoc admin-panel toggles.
 */

export interface PermissionGrant {
  /** Registry uid, e.g. 'api::club' or 'plugin::users-permissions' */
  uid: string;
  /** Controller name within that uid, e.g. 'club' or 'user' */
  controller: string;
  /** Action names to enable; every other action on this controller is disabled */
  actions: string[];
}

// Anonymous visitors: published, public-facing content only.
export const PUBLIC_GRANTS: PermissionGrant[] = [
  { uid: 'api::category', controller: 'category', actions: ['find', 'findOne'] },
  { uid: 'api::club', controller: 'club', actions: ['find', 'findOne'] },
  { uid: 'api::activity', controller: 'activity', actions: ['find', 'findOne'] },
  { uid: 'api::event', controller: 'event', actions: ['find', 'findOne'] },
  { uid: 'api::news-article', controller: 'news-article', actions: ['find', 'findOne'] },
  { uid: 'api::document', controller: 'document', actions: ['find', 'findOne'] },
  { uid: 'api::membership', controller: 'membership', actions: [] },
  // Revoked: a public user directory is a privacy leak, not a feature.
  { uid: 'plugin::users-permissions', controller: 'user', actions: [] },
];

// Any logged-in student: read everything, join clubs. Event-hosting is
// Ambassador-exclusive (see AMBASSADOR_GRANTS below), not a baseline capability.
export const AUTHENTICATED_GRANTS: PermissionGrant[] = [
  { uid: 'api::category', controller: 'category', actions: ['find', 'findOne'] },
  { uid: 'api::club', controller: 'club', actions: ['find', 'findOne', 'create'] },
  { uid: 'api::activity', controller: 'activity', actions: ['find', 'findOne'] },
  { uid: 'api::event', controller: 'event', actions: ['find', 'findOne'] },
  { uid: 'api::news-article', controller: 'news-article', actions: ['find', 'findOne'] },
  { uid: 'api::document', controller: 'document', actions: ['find', 'findOne'] },
  { uid: 'api::membership', controller: 'membership', actions: ['find', 'findOne', 'create', 'delete', 'mine'] },
  // 'me' (fetch my own account) stays on — only the public directory (find/findOne) is revoked.
  { uid: 'plugin::users-permissions', controller: 'user', actions: ['me'] },
  // Custom endpoint that also returns the account's role (see api/account).
  { uid: 'api::account', controller: 'account', actions: ['me'] },
];

// Custom role: assigned to a user once they lead a specific club (see membership.role = 'leader').
// Row-level scoping to "their" club is enforced by policies, not by this table.
export const CLUB_LEADER_GRANTS: PermissionGrant[] = [
  { uid: 'api::category', controller: 'category', actions: ['find', 'findOne'] },
  { uid: 'api::club', controller: 'club', actions: ['find', 'findOne', 'create', 'update'] },
  { uid: 'api::activity', controller: 'activity', actions: ['find', 'findOne', 'create', 'update', 'delete'] },
  { uid: 'api::event', controller: 'event', actions: ['find', 'findOne'] },
  { uid: 'api::news-article', controller: 'news-article', actions: ['find', 'findOne'] },
  { uid: 'api::document', controller: 'document', actions: ['find', 'findOne', 'create', 'update', 'delete'] },
  { uid: 'api::membership', controller: 'membership', actions: ['find', 'findOne', 'create', 'update', 'delete', 'mine'] },
  // 'me' (fetch my own account) stays on — only the public directory (find/findOne) is revoked.
  { uid: 'plugin::users-permissions', controller: 'user', actions: ['me'] },
  // Custom endpoint that also returns the account's role (see api/account).
  { uid: 'api::account', controller: 'account', actions: ['me'] },
  // Needed to upload Document files.
  { uid: 'plugin::upload', controller: 'content-api', actions: ['upload', 'find', 'findOne'] },
];

// Custom role: PR/newsroom staff who write news content. Does not extend to events.
export const CONTENT_EDITOR_GRANTS: PermissionGrant[] = [
  { uid: 'api::category', controller: 'category', actions: ['find', 'findOne'] },
  { uid: 'api::club', controller: 'club', actions: ['find', 'findOne', 'create'] },
  { uid: 'api::activity', controller: 'activity', actions: ['find', 'findOne'] },
  { uid: 'api::event', controller: 'event', actions: ['find', 'findOne'] },
  { uid: 'api::news-article', controller: 'news-article', actions: ['find', 'findOne', 'create', 'update', 'delete', 'mine'] },
  { uid: 'api::document', controller: 'document', actions: ['find', 'findOne'] },
  { uid: 'api::membership', controller: 'membership', actions: ['find', 'findOne', 'create', 'delete', 'mine'] },
  // 'me' (fetch my own account) stays on — only the public directory (find/findOne) is revoked.
  { uid: 'plugin::users-permissions', controller: 'user', actions: ['me'] },
  // Custom endpoint that also returns the account's role (see api/account).
  { uid: 'api::account', controller: 'account', actions: ['me'] },
  // Needed to embed images in a news article's rich-text content.
  { uid: 'plugin::upload', controller: 'content-api', actions: ['upload', 'find', 'findOne'] },
];

// Custom role: campus ambassadors, whose one distinguishing capability is
// hosting/managing events — not clubs, not news. This is the *only* role
// (besides admin-panel staff) that can post an event.
export const AMBASSADOR_GRANTS: PermissionGrant[] = [
  { uid: 'api::category', controller: 'category', actions: ['find', 'findOne'] },
  { uid: 'api::club', controller: 'club', actions: ['find', 'findOne', 'create'] },
  { uid: 'api::activity', controller: 'activity', actions: ['find', 'findOne'] },
  { uid: 'api::event', controller: 'event', actions: ['find', 'findOne', 'create', 'update', 'delete', 'mine'] },
  { uid: 'api::news-article', controller: 'news-article', actions: ['find', 'findOne'] },
  { uid: 'api::document', controller: 'document', actions: ['find', 'findOne'] },
  { uid: 'api::membership', controller: 'membership', actions: ['find', 'findOne', 'create', 'delete', 'mine'] },
  // 'me' (fetch my own account) stays on — only the public directory (find/findOne) is revoked.
  { uid: 'plugin::users-permissions', controller: 'user', actions: ['me'] },
  // Custom endpoint that also returns the account's role (see api/account).
  { uid: 'api::account', controller: 'account', actions: ['me'] },
  // Needed to attach a file to an Event's Material component.
  { uid: 'plugin::upload', controller: 'content-api', actions: ['upload', 'find', 'findOne'] },
];
