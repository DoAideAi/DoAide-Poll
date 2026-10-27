/**
 * SEO metadata for every static route.
 * Dynamic routes (poll/:id) build their meta from API data at runtime.
 */

const SITE = 'https://poll.doaide.com';
const SITE_NAME = 'DoAide Poll';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

export const routeMeta = {
  '/': {
    title: 'DoAide Poll — Free Online Poll & Survey Creator',
    description:
      'Create free polls and surveys in seconds. Share with anyone and get instant results. No login required. Perfect for teams, classrooms, events, and social media.',
    canonical: SITE + '/',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE,
      description:
        'Create free polls and surveys in seconds. Share with anyone and get instant results. No login required.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      creator: {
        '@type': 'Organization',
        name: 'DoAide',
        url: 'https://doaide.com',
      },
    },
  },
  '/create': {
    title: 'Create a Free Poll — DoAide Poll',
    description:
      'Build a poll or survey in under 15 seconds. Add multiple-choice, text, rating, or yes/no questions. Share via link, WhatsApp, or embed on your website.',
    canonical: SITE + '/create',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Create a Free Poll',
      url: SITE + '/create',
      description:
        'Build a poll or survey in under 15 seconds. Add multiple-choice, text, rating, or yes/no questions.',
      isPartOf: { '@type': 'WebApplication', name: SITE_NAME, url: SITE },
    },
  },
};

/**
 * Build meta for a dynamic poll page.
 */
export function buildPollMeta(poll, subpage = 'vote') {
  const pollUrl = `${SITE}/poll/${poll.id}`;
  const base = {
    canonical: subpage === 'vote' ? pollUrl : `${pollUrl}/${subpage}`,
    ogType: 'article',
  };

  if (subpage === 'vote') {
    return {
      ...base,
      title: `${poll.title} — Vote Now | DoAide Poll`,
      description: `Vote on "${poll.title}". ${poll.options?.length || 0} options — cast your vote and see instant results.`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: poll.title,
        url: pollUrl,
        description: `Vote on "${poll.title}".`,
        isPartOf: { '@type': 'WebApplication', name: SITE_NAME, url: SITE },
      },
    };
  }

  if (subpage === 'results') {
    return {
      ...base,
      title: `Results: ${poll.title} | DoAide Poll`,
      description: `Live results for "${poll.title}". ${poll.total_votes || 0} votes so far — see charts and breakdowns.`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Results: ${poll.title}`,
        url: `${pollUrl}/results`,
        isPartOf: { '@type': 'WebApplication', name: SITE_NAME, url: SITE },
      },
    };
  }

  if (subpage === 'embed') {
    return {
      ...base,
      title: `Embed: ${poll.title} | DoAide Poll`,
      description: `Get the embed code for "${poll.title}". Add this poll to your website, blog, or app.`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Embed: ${poll.title}`,
        url: `${pollUrl}/embed`,
        isPartOf: { '@type': 'WebApplication', name: SITE_NAME, url: SITE },
      },
    };
  }

  return base;
}

export { SITE, SITE_NAME, DEFAULT_OG_IMAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT };
