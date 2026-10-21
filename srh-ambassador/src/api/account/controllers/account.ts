/**
 * account controller
 *
 * `role` can't come back from `/api/users/me` — Strapi's content API
 * silently strips it from populate regardless of syntax, the same way it
 * strips relations that point at plugin::users-permissions.user. Since the
 * frontend needs to know "is this a Club Leader / Content Editor" to decide
 * which forms to show, this reads the role directly via `strapi.db.query`
 * (bypassing that restriction, same as the `/*​/mine` endpoints elsewhere).
 */

export default {
  async me(ctx) {
    const currentUser = ctx.state.user;
    if (!currentUser) {
      return ctx.unauthorized();
    }

    const full = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: currentUser.id },
      populate: { role: true },
    });

    ctx.body = {
      id: full.id,
      documentId: full.documentId,
      username: full.username,
      email: full.email,
      role: full.role ? { name: full.role.name, type: full.role.type } : null,
      // Admin-assigned only (Settings > Users in the admin panel) — there is
      // deliberately no public API path to set this, self-service or otherwise.
      universityStatus: full.universityStatus ?? null,
    };
  },
};
