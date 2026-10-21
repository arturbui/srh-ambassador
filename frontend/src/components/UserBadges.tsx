import { useLocale } from '../i18n';
import type { TranslationKey } from '../i18n';
import type { AuthUser, UniversityStatus } from '../types';

const STATUS_KEY: Record<UniversityStatus, TranslationKey> = {
  student: 'statusStudent',
  exchange_student: 'statusExchangeStudent',
  professor: 'statusProfessor',
  ambassador: 'statusAmbassador',
};

// Primary badge = university status (admin-assigned, who someone is).
// Secondary tag = derived from the permission role (what they currently do)
// — kept visually distinct so "owns a club" never reads as if it replaced
// their actual status.
export default function UserBadges({ user }: { user: AuthUser }) {
  const { t } = useLocale();
  const statusKey = user.universityStatus ? STATUS_KEY[user.universityStatus] : null;
  const secondaryKey =
    user.role?.type === 'club_leader'
      ? 'tagOwnsClub'
      : user.role?.type === 'content_editor'
        ? 'tagWritesNews'
        : user.role?.type === 'ambassador'
          ? 'tagPostsEvents'
          : null;

  return (
    <>
      {statusKey && <span className="badge leader">{t(statusKey)}</span>}
      {secondaryKey && <span className="badge">{t(secondaryKey)}</span>}
    </>
  );
}
