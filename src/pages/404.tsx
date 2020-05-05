/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import * as Sentry from '@sentry/node';
import { createLogger } from '@unly/utils-simple-logger';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
import React from 'react';
import PageLayout from '../components/PageLayout';
import { PageLayoutProps } from '../types/PageLayoutProps';
import { StaticParams } from '../types/StaticParams';
import { StaticProps } from '../types/StaticProps';
import { DEFAULT_LOCALE, LANG_EN, LANG_FR } from '../utils/i18n';
import { getCommonStaticPaths, getCommonStaticProps } from '../utils/SSG';

const fileLabel = 'pages/404';
const logger = createLogger({ // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
  label: fileLabel,
});

/**
 * Only executed on the server side at build time.
 *
 * Note that when a page uses "getStaticProps", then "_app:getInitialProps" is executed (if defined) but not actually used by the page,
 * only the results from getStaticProps are actually injected into the page (as "StaticProps").
 *
 * @return Props (as "StaticProps") that will be passed to the Page component, as props
 *
 * @see https://github.com/zeit/next.js/discussions/10949#discussioncomment-6884
 * @see https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
 */
export const getStaticProps: GetStaticProps<StaticProps, StaticParams> = getCommonStaticProps;

type Props = {} & StaticProps;

const Fr404 = (): JSX.Element => {
  return (
    <>
      <h1>Page non trouvée</h1>

      <p>
        La page que vous recherchez n'existe pas
      </p>
    </>
  );
};

const En404 = (): JSX.Element => {
  return (
    <>
      <h1>Page not found</h1>

      <p>
        The page you're looking for doesn't exist
      </p>
    </>
  );
};

/**
 * "404 not found" page, doesn't support i18n
 *
 * Doesn't use "getStaticPaths" because it's not supported by Next.js "getStaticPaths can only be used with dynamic pages, not '/404'."
 *
 * XXX The "locale" cannot be resolved properly using SSG on 404 pages, because this file doesn't belong to the "/[locale]" folder and thus doesn't benefit from url rewriting
 *  Therefore, the page will be displayed based on the DEFAULT_LOCALE value and not on the actual end-user locale
 *
 * @param props
 * @see https://nextjs.org/docs/advanced-features/custom-error-page#404-page
 */
const NotFound404Page: NextPage<Props> = (props): JSX.Element => {
  Sentry.addBreadcrumb({ // See https://docs.sentry.io/enriching-error-data/breadcrumbs
    category: fileLabel,
    message: `Rendering ${fileLabel}`,
    level: Sentry.Severity.Warning, // Use warning
  });

  return (
    <PageLayout
      pageName={'404'}
      headProps={{
        title: '404 Not Found - Next Right Now',
      }}
      {...props}
    >
      {
        (pageLayoutProps: PageLayoutProps): JSX.Element => {
          const { router } = pageLayoutProps;
          const locale = router?.asPath?.split('/')?.[1] || DEFAULT_LOCALE;
          const lang: string = locale.split('-')?.[0];

          // We can display a custom message based on the lang, but the other parts of the app won't be translated (nav, footer)
          // Also, it has to be hardcoded, it cannot be stored on Locize, because we don't have access to translations from other languages
          return (
            <div
              css={css`
                text-align: center;
              `}
            >
              {
                lang === LANG_FR && (
                  <Fr404 />
                )
              }
              {
                lang === LANG_EN && (
                  <En404 />
                )
              }
            </div>
          );
        }
      }
    </PageLayout>
  );
};

export default NotFound404Page;