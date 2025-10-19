const githubRepoUrl = 'https://github.com/software-engineering-excellence/handbook';
const title = 'Software Engineering Excellence';
const siteUrl = 'https://software-engineering-excellence.vercel.app';

module.exports = {
  title,
  tagline: 'Proven practices for developing software effectively',
  url: siteUrl,
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
  headTags: [
    // Structured data for better SEO and rich snippets
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Software Engineering Excellence Handbook',
        description:
          'A comprehensive guide covering proven practices, principles, and techniques for developing high-quality, secure, reliable, and maintainable software.',
        author: {
          '@type': 'Person',
          name: 'Tobias Büschel',
          url: 'https://twitter.com/tobiasbueschel',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Software Engineering Excellence',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/img/logo.png`,
          },
        },
        datePublished: '2024-01-01',
        dateModified: new Date().toISOString().split('T')[0],
        image: `${siteUrl}/img/software_engineering_excellence.png`,
        url: siteUrl,
        keywords:
          'software engineering, best practices, software development, clean code, testing, CI/CD, architecture, design patterns, code review, agile, microservices, performance optimization, security, refactoring',
      }),
    },
    // Breadcrumb structured data
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
        ],
      }),
    },
  ],
  themeConfig: {
    image: 'img/software_engineering_excellence.png',
    metadata: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
      },
      {
        name: 'theme-color',
        content: '#ffffff',
      },
      {
        name: 'keywords',
        content:
          'software engineering excellence, software engineering, best practices, software development, open-source, clean code, testing, CI/CD, architecture, design patterns, code review, agile, microservices, performance optimization, security, refactoring',
      },
      // Note: og:*, twitter:*, title and description are omitted here
      // They will be set automatically by Docusaurus from each page's frontmatter
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'Software Engineering Excellence',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:creator',
        content: '@tobiasbueschel',
      },
      {
        name: 'twitter:site',
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
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
