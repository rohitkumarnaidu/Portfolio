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

export function profilePageSchema(person: {
  name: string;
  jobTitle: string;
  url: string;
  sameAs: string[];
  knowsAbout: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: person.name,
      jobTitle: person.jobTitle,
      url: person.url,
      sameAs: person.sameAs,
      knowsAbout: person.knowsAbout,
    },
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
