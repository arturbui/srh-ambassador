import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import { createNewsArticle, deleteNewsArticle, fetchMyNewsArticleIds, fetchNewsArticles, toBlocks } from '../api';
import type { NewsArticle } from '../types';
import NewsArticleCard from './NewsArticleCard';

export default function NewsPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const isContentEditor = user?.role?.type === 'content_editor';

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [myArticleIds, setMyArticleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'announcement' | 'report'>('announcement');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchNewsArticles(locale),
      isContentEditor ? fetchMyNewsArticleIds() : Promise.resolve(new Set<string>()),
    ])
      .then(([articlesRes, mine]) => {
        setArticles(articlesRes.data);
        setMyArticleIds(mine);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [locale, user]);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      await createNewsArticle({ title, category, content: toBlocks(content) });
      setTitle('');
      setContent('');
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function remove(documentId: string) {
    try {
      await deleteNewsArticle(documentId);
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    load();
  }

  return (
    <div>
      <h1 className="section-title">{t('navNews')}</h1>

      {loading && <p className="muted">{t('loading')}</p>}
      {error && <p className="error-text">{t('errorPrefix')} {error}</p>}

      {!loading && !error && articles.length === 0 && <p className="muted">{t('newsNone')}</p>}

      {articles.map((article) => (
        <div key={article.id}>
          <NewsArticleCard article={article} />
          {myArticleIds.has(article.documentId) && (
            <div className="btn-row" style={{ marginTop: -12, marginBottom: 16 }}>
              <button className="btn btn-small btn-danger" onClick={() => remove(article.documentId)}>{t('delete')}</button>
            </div>
          )}
        </div>
      ))}

      {isContentEditor && (
        <>
          <div className="section-heading"><h2>{t('newsWriteArticle')}</h2></div>
          <form className="form card" onSubmit={submitCreate}>
            <div className="field">
              <label htmlFor="article-title">{t('fieldTitle')}</label>
              <input id="article-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="article-category">{t('fieldCategory')}</label>
              <select id="article-category" value={category} onChange={(e) => setCategory(e.target.value as 'announcement' | 'report')}>
                <option value="announcement">{t('categoryAnnouncement')}</option>
                <option value="report">{t('categoryReport')}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="article-content">{t('fieldContent')}</label>
              <textarea id="article-content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder={t('contentPlaceholder')} />
            </div>
            {formError && <p className="error-text">{formError}</p>}
            <button className="btn btn-primary" type="submit" disabled={creating}>{t('publish')}</button>
          </form>
        </>
      )}

      {user && !isContentEditor && (
        <p className="muted">{t('newsEditorOnly')}</p>
      )}
    </div>
  );
}
