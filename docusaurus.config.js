const githubRepoUrl = 'https://github.com/software-engineering-excellence/handbook';
const title = 'Software Engineering Excellence';

module.exports = {
  title,
  tagline: 'Proven practices for developing software effectively',
  url: 'https://software-engineering-excellence.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'software-engineering-excellence',
  projectName: 'handbook',
  staticDirectories: ['static', 'docs/images'],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: ['/'],
        docsDir: 'docs',
        highlightSearchTermsOnTargetPage: true,
        language: ['en'],
      },
    ],
  ],
  themeConfig: {
    image: 'img/software_engineering_excellence.png',
    metadata: [
      {
        name: 'keywords',
        content:
          'software engineering excellence, software engineering, best practices, software development, open-source, clean code, testing, CI/CD, architecture, design patterns, code review, agile, microservices, performance optimization, security, refactoring',
      },
      {
        name: 'description',
        content: 'Proven practices for developing software effectively',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Software Engineering Excellence - Handbook',
      },
      {
        property: 'og:description',
        content:
          'A comprehensive guide covering proven practices, principles, and techniques for developing high-quality, secure, reliable, and maintainable software.',
      },
      {
        property: 'og:image',
        content: 'https://software-engineering-excellence.vercel.app/img/software_engineering_excellence.png',
      },
      {
        property: 'og:url',
        content: 'https://software-engineering-excellence.vercel.app',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Software Engineering Excellence - Handbook',
      },
      {
        name: 'twitter:description',
        content:
          'A comprehensive guide covering proven practices, principles, and techniques for developing high-quality software.',
      },
      {
        name: 'twitter:image',
        content: 'https://software-engineering-excellence.vercel.app/img/software_engineering_excellence.png',
      },
      {
        name: 'twitter:creator',
        content: '@tobiasbueschel',
      },
      {
        name: 'author',
        content: 'Tobias Büschel',
      },
      {
        name: 'language',
        content: 'English',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
    ],
    navbar: {
      title,
      logo: {
        alt: 'Software Engineering Excellence Handbook Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'search',
          position: 'right',
        },
        {
          href: githubRepoUrl,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Twitter',
              href: 'https://twitter.com/tobiasbueschel',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: githubRepoUrl,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tobias Büschel and contributors`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        gtag:
          process.env.NODE_ENV === 'production'
            ? {
                trackingID: 'G-JPJLFTD0Z4',
                anonymizeIP: true,
              }
            : undefined,
        docs: {
          routeBasePath: '/',
          path: './docs',
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
          breadcrumbs: false,
          editUrl: `${githubRepoUrl}/edit/main/website/`,
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
