export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  achievements: string[];
  technologies: string[];
}

export const experience: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Senior Full-Stack Engineer',
    company: 'TechCorp Inc.',
    companyUrl: 'https://example.com',
    location: 'San Francisco, CA',
    startDate: '2023-03',
    endDate: 'Present',
    description:
      'Leading the development of enterprise SaaS platform serving 50k+ users. Architecting microservices migration and establishing frontend standards across 4 product teams.',
    achievements: [
      'Reduced page load times by 60% through ISR and code splitting strategies',
      'Architected migration from monolith to 12 microservices with zero downtime',
      'Established component library used by 20+ developers across 4 teams',
      'Implemented CI/CD pipeline reducing deployment time from 45min to 8min',
    ],
    technologies: ['Next.js', 'NestJS', 'PostgreSQL', 'Docker', 'AWS', 'Terraform'],
  },
  {
    id: 'exp-2',
    role: 'Full-Stack Developer',
    company: 'StartupXYZ',
    companyUrl: 'https://example.com',
    location: 'Remote',
    startDate: '2021-01',
    endDate: '2023-02',
    description:
      'Built and scaled an AI-powered analytics platform from MVP to 10k+ users. Worked directly with founders to define technical roadmap.',
    achievements: [
      'Built real-time analytics dashboard processing 1M+ events/day',
      'Implemented RAG-based AI assistant reducing support tickets by 40%',
      'Designed database schema serving 50+ API endpoints',
      'Mentored 3 junior developers through structured code review process',
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Redis', 'OpenAI', 'GCP'],
  },
  {
    id: 'exp-3',
    role: 'Frontend Developer',
    company: 'WebAgency Co.',
    location: 'New York, NY',
    startDate: '2019-03',
    endDate: '2020-12',
    description:
      'Developed responsive web applications for diverse clients including healthcare, e-commerce, and fintech sectors.',
    achievements: [
      'Delivered 15+ client projects on time and within budget',
      'Built reusable component library reducing development time by 30%',
      'Achieved 95+ Lighthouse scores across all client projects',
    ],
    technologies: ['React', 'TypeScript', 'Styled Components', 'GraphQL', 'Jest'],
  },
  {
    id: 'exp-4',
    role: 'Junior Developer',
    company: 'Digital Solutions Ltd',
    location: 'Boston, MA',
    startDate: '2017-06',
    endDate: '2019-02',
    description:
      'Started career building and maintaining WordPress sites, transitioned to modern React development. Learned fundamentals of clean code and version control.',
    achievements: [
      'Converted legacy jQuery applications to modern React reducing bugs by 70%',
      'Implemented automated testing increasing code coverage from 20% to 85%',
      'Contributed to open-source projects during company hackathons',
    ],
    technologies: ['JavaScript', 'React', 'PHP', 'MySQL', 'Git', 'Sass'],
  },
];
