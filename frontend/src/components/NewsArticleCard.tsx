import type { NewsArticle } from '../types';
import { useLocale } from '../i18n';
import type { TranslationKey } from '../i18n';
import BlocksRenderer from './BlocksRenderer';

interface Props {
  article: NewsArticle;
}

const CATEGORY_KEY: Record<string, TranslationKey> = {
  announcement: 'categoryAnnouncement',
  report: 'categoryReport',
};

export default function NewsArticleCard({ article }: Props) {
  const { t } = useLocale();

  return (
    <article className="card">
      <h2>{article.title}</h2>

      <div className="card-meta">
        {article.category && (
          <span className="badge leader">{article.category in CATEGORY_KEY ? t(CATEGORY_KEY[article.category]) : article.category}</span>
        )}
        {article.author && (
          <span className="muted">{t('byAuthor', { name: article.author.username })}</span>
        )}
      </div>

      {article.content && <BlocksRenderer content={article.content} />}

      {article.publishedAt && (
        <p className="muted" style={{ marginBottom: 0 }}>
          {new Date(article.publishedAt).toLocaleDateString()}
        </p>
      )}
    </article>
  );
}
