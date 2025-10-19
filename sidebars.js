const CONTENT_CHAPTERS = [
  'agile-methodologies',
  'architecture-decision-record',
  'architecture-design',
  'branch-based-testing',
  'branching-strategies',
  'clean-code',
  'code-reviews',
  'debugging',
  'design-patterns',
  'documentation',
  'error-handling',
  'feature-flags',
  'logging',
  'pair-programming',
  'performance-optimization',
  'refactoring-techniques',
  'rest-best-practices',
  'technical-debt',
  'testing',
  'version-control-systems',
  'ci-cd',
  'code-quality-metrics',
  'containerization',
  'dependency-management',
  'development-environment-setup',
  'microservices',
  'monitoring-and-observability',
  'security-best-practices',
  'scalability-and-reliability',
];

module.exports = {
  sidebar: [
    'introduction',
    // Sort content chapters alphabetically
    ...CONTENT_CHAPTERS.sort((a, b) => a.localeCompare(b)),
    {
      type: 'category',
      label: 'Appendices',
      items: ['contributors'],
    },
  ],
};
