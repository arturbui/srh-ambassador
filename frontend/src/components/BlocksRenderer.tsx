import type { ReactNode } from 'react';
import type { BlockNode, BlocksContent, InlineNode } from '../types';

const API_URL = import.meta.env.VITE_API_URL as string;

function renderInline(node: InlineNode, key: number): ReactNode {
  if (node.type === 'link') {
    return (
      <a key={key} href={node.url} target="_blank" rel="noreferrer">
        {node.children?.map((c, i) => renderInline(c, i))}
      </a>
    );
  }

  // type === 'text' (and list-item children)
  let el: ReactNode = node.text ?? '';
  if (node.bold) el = <strong key={key}>{el}</strong>;
  if (node.italic) el = <em key={key}>{el}</em>;
  if (node.underline) el = <u key={key}>{el}</u>;
  if (node.strikethrough) el = <s key={key}>{el}</s>;
  if (node.code) el = <code key={key}>{el}</code>;
  return el;
}

function renderBlock(node: BlockNode, key: number): ReactNode {
  const children = node.children?.map((c, i) => renderInline(c, i));

  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{children}</p>;

    case 'heading': {
      switch (node.level) {
        case 1: return <h1 key={key}>{children}</h1>;
        case 2: return <h2 key={key}>{children}</h2>;
        case 3: return <h3 key={key}>{children}</h3>;
        case 4: return <h4 key={key}>{children}</h4>;
        case 5: return <h5 key={key}>{children}</h5>;
        default: return <h6 key={key}>{children}</h6>;
      }
    }

    case 'quote':
      return <blockquote key={key}>{children}</blockquote>;

    case 'code':
      return <pre key={key}><code>{children}</code></pre>;

    case 'list':
      return node.format === 'ordered'
        ? <ol key={key}>{children}</ol>
        : <ul key={key}>{children}</ul>;

    case 'list-item':
      return <li key={key}>{children}</li>;

    case 'image': {
      if (!node.image) return null;
      const src = node.image.url.startsWith('/')
        ? `${API_URL}${node.image.url}`
        : node.image.url;
      return (
        <img
          key={key}
          src={src}
          alt={node.image.alternativeText ?? ''}
          style={{ maxWidth: '100%' }}
        />
      );
    }

    default:
      return <div key={key}>{children}</div>;
  }
}

export default function BlocksRenderer({ content }: { content: BlocksContent }) {
  return <>{content.map(renderBlock)}</>;
}
