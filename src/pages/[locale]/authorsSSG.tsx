import { CommonServerSideParams } from '@/app/types/CommonServerSideParams';
import { StaticPropsInput } from '@/app/types/StaticPropsInput';
import Cards from '@/common/components/dataDisplay/Cards';
import EllipsisTextMultiline from '@/common/components/dataDisplay/EllipsisTextMultiline';
import { OnlyBrowserPageProps } from '@/layouts/core/types/OnlyBrowserPageProps';
import { SSGPageProps } from '@/layouts/core/types/SSGPageProps';
import DefaultLayout from '@/layouts/default/components/DefaultLayout';
import {
  getDefaultStaticPaths,
  getDefaultStaticProps,
} from '@/layouts/default/defaultSSG';
import { AMPLITUDE_PAGES } from '@/modules/core/amplitude/amplitude';
import fetchJSON from '@/modules/core/api/fetchJSON';
import useCustomer from '@/modules/core/data/hooks/useCustomer';
import { AirtableAttachment } from '@/modules/core/data/types/AirtableAttachment';
import { AirtableRecord } from '@/modules/core/data/types/AirtableRecord';
import { Author } from '@/modules/core/data/types/Author';
import { Customer } from '@/modules/core/data/types/Customer';
import { useTheme } from '@emotion/react';
import { createLogger } from '@unly/utils-simple-logger';
import deepmerge from 'deepmerge';
import {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsResult,
  NextPage,
} from 'next';
import React from 'react';
import { Card, CardBody, CardImg, CardTitle, Container } from 'reactstrap';

const fileLabel = 'pages/[locale]/authorsSSG';
const logger = createLogger({ // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
  label: fileLabel,
});

/**
 * Only executed on the server side at build time
 * Necessary when a page has dynamic routes and uses "getStaticProps"
 */
export const getStaticPaths: GetStaticPaths<CommonServerSideParams> = getDefaultStaticPaths;

/**
 * Only executed on the server side at build time.
 *
 * @return Props (as "SSGPageProps") that will be passed to the Page component, as props
 *
 * @see https://github.com/vercel/next.js/discussions/10949#discussioncomment-6884
 * @see https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
 */
export const getStaticProps: GetStaticProps<SSGPageProps, CommonServerSideParams> = async (props: StaticPropsInput): Promise<GetStaticPropsResult<SSGPageProps>> => {
  const defaultStaticProps: GetStaticPropsResult<SSGPageProps> = await getDefaultStaticProps(props);  
  try {

    const authorsList = await fetchJSON(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Authors`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
      },
    });

    if ('props' in defaultStaticProps) {
      const authorsPageProps = deepmerge(defaultStaticProps, {
        props: {
          authors: authorsList.records.map((author) => {return {...author.fields, id: author.id};}),
          builtAt: new Date().toISOString(),
        },
        revalidate: 480,
      });
      return authorsPageProps;
    } else {
      return defaultStaticProps;
    }
  } catch (error) {
    return defaultStaticProps;
  }
  
};

/**
 * SSG pages are first rendered by the server (during static bundling)
 * Then, they're rendered by the client, and gain additional props (defined in OnlyBrowserPageProps)
 * Because this last case is the most common (server bundle only happens during development stage), we consider it a default
 * To represent this behaviour, we use the native Partial TS keyword to make all OnlyBrowserPageProps optional
 *
 * Beware props in OnlyBrowserPageProps are not available on the server
 */
type Props = {
  authors: AirtableRecord<Author>[]
} & SSGPageProps<Partial<OnlyBrowserPageProps>>;

const Authors: NextPage<Props> = (props): JSX.Element => {
  const customer: Customer = useCustomer();  
  const {
    authors = []
  } = props;
  const theme = useTheme();
  const {
    logo: logoAirtable,
  } = theme;
  const logo: AirtableAttachment = logoAirtable;
  

  return (
    <DefaultLayout
      {...props}
      pageName={AMPLITUDE_PAGES.TEMPLATE_SSG_PAGE}
    >
      <Container>
        <Cards>
          {
            authors.map((author) => (
              <Card key={author.id}>
                <CardImg top width="100%" src={author?.photos?.[0]?.url || logo.url} alt={author.name} />
                <CardBody>
                  <CardTitle tag="h5">{author.name}</CardTitle>
                  <EllipsisTextMultiline>
                    {author.bio}
                  </EllipsisTextMultiline>
                </CardBody>
              </Card>
            ))
          }
        </Cards>
      </Container>
      
    </DefaultLayout>
  );
};

export default (Authors);