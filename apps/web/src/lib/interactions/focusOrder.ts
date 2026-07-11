export const FOCUS_ORDER = {
  HOME: {
    first: '#main-content',
    skipLink: '#main-content',
    sections: ['navbar', 'hero', 'about', 'skills', 'experience', 'projects', 'testimonials', 'blog', 'services', 'faq', 'contact', 'footer'],
  },
  ADMIN: {
    first: 'nav[aria-label="Admin navigation"] a:first-child',
    skipLink: '#main-content',
    sections: ['sidebar', 'header', 'main-content'],
  },
  BLOG: {
    first: '#main-content',
    skipLink: '#main-content',
    sections: ['article', 'share-buttons', 'comments'],
  },
  CONTACT: {
    first: '#contact-name',
    skipLink: '#main-content',
    sections: ['contact-name', 'contact-email', 'contact-subject', 'contact-message', 'contact-submit'],
  },
  LOGIN: {
    first: '#login-email',
    skipLink: '#main-content',
    sections: ['login-email', 'login-password', 'login-submit'],
  },
} as const;
