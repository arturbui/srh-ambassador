import type { Core } from '@strapi/strapi';

// English is seeded by Strapi itself on first boot; German is this project's
// second supported language (SRH is a German university).
const EXTRA_LOCALES = [{ code: 'de-DE', name: 'German (Germany) (de-DE)' }];

export async function ensureLocales({ strapi }: { strapi: Core.Strapi }) {
  const locales = strapi.plugin('i18n').service('locales');

  for (const locale of EXTRA_LOCALES) {
    const existing = await locales.findByCode(locale.code);
    if (!existing) {
      await locales.create(locale);
      strapi.log.info(`[bootstrap] created locale ${locale.code}`);
    }
  }
}
