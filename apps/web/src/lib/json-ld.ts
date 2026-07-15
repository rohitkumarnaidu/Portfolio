export function websiteSchema(name: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  };
}

export function personSchema(name: string, jobTitle: string, url: string, image?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    url,
    ...(image ? { image } : {}),
  };
}

export function blogPostingSchema(blogPost: {
  title: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  authorName: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blogPost.title,
    description: blogPost.description,
    datePublished: blogPost.datePublished,
    dateModified: blogPost.dateModified || blogPost.datePublished,
    author: {
      '@type': 'Person',
      name: blogPost.authorName,
    },
    url: blogPost.url,
    ...(blogPost.image ? { image: blogPost.image } : {}),
  };
}

export function articleSchema(article: {
  title: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    ...(article.authorName ? { author: { '@type': 'Person', name: article.authorName } } : {}),
    url: article.url,
    ...(article.image ? { image: article.image } : {}),
  };
}
