import React from 'react';
import { CommonServerSideParams } from '@/app/types/CommonServerSideParams';
import { StaticPath } from '@/app/types/StaticPath';
import { StaticPropsInput } from '@/app/types/StaticPropsInput';
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
import { AirtableRecord } from '@/modules/core/data/types/AirtableRecord';
import { Author } from '@/modules/core/data/types/Author';
import { Customer } from '@/modules/core/data/types/Customer';
import { createLogger } from '@unly/utils-simple-logger';
import deepmerge from 'deepmerge';
import map from 'lodash.map';
import {
  GetStaticPaths,
  GetStaticPathsContext,
  GetStaticProps,
  GetStaticPropsResult,
  NextPage,
} from 'next';
import { StaticPathsOutput } from '@/app/types/StaticPathsOutput';
import { Book } from '@/modules/core/data/types/Book';
import NotFound404Page from '@/pages/404';
import {
  Card, CardBody, CardText, CardTitle, Col, Container, Row 
} from 'reactstrap';
import { css, useTheme } from '@emotion/react';
import size from 'lodash.size';
import { AirtableAttachment } from '@/modules/core/data/types/AirtableAttachment';
import { Router } from 'next/router';


const fileLabel = 'pages/[locale]/pageTemplateSSG';
const logger = createLogger({ // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
  label: fileLabel,
});

type PageAdditionalServerSideParams = {
  bookId: string;
}

/**
 * Only executed on the server side at build time
 * Necessary when a page has dynamic routes and uses "getStaticProps"
 */
export const getStaticPaths: GetStaticPaths<CommonServerSideParams> = async (context: GetStaticPathsContext): Promise<StaticPathsOutput<PageAdditionalServerSideParams>> => {
  const commonStaticPaths: StaticPathsOutput<PageAdditionalServerSideParams> = await getDefaultStaticPaths(context) as StaticPathsOutput<PageAdditionalServerSideParams>;
  const { paths } = commonStaticPaths;
  const newPaths: StaticPathsOutput<PageAdditionalServerSideParams> = {
    paths: [],
    fallback: true
  };
  const books = await fetchJSON(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Books`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    }
  );  

  map(books?.records, (book: Book): void => {
    map(paths, (path: StaticPath<PageAdditionalServerSideParams>) => {
      newPaths.paths.push({
        params: {
          ...path.params,
          bookId: book.id
        }
      });
    });
  });

  const staticPaths: StaticPathsOutput<PageAdditionalServerSideParams> = {
    ...newPaths,
    fallback: true,
  };

  return staticPaths;
};

/**
 * Only executed on the server side at build time.
 *
 * @return Props (as "SSGPageProps") that will be passed to the Page component, as props
 *
 * @see https://github.com/vercel/next.js/discussions/10949#discussioncomment-6884
 * @see https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
 */
export const getStaticProps: GetStaticProps<SSGPageProps, CommonServerSideParams> = async (props: StaticPropsInput & PageAdditionalServerSideParams): Promise<GetStaticPropsResult<SSGPageProps>> => {
  const defaultStaticProps: GetStaticPropsResult<SSGPageProps> = await getDefaultStaticProps(props);  
  try {
    
    const { params: { bookId } } = props;
    
    
    const airBook = await fetchJSON(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Books/${bookId}`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
      },
    });

    if (airBook.fields?.author) {
      const airBookAuthors: Author[] = [];

      await Promise.all(airBook.fields.author.map(async (authorId: string) => {
        const bookAuthor = await fetchJSON(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Authors/${authorId}`, {
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
          },
        });
        airBookAuthors.push({
          ...bookAuthor.fields,
          id: bookAuthor.id
        });
      }));

      airBook.fields.author = airBookAuthors;
      airBook.fields.id = airBook.id;
    }
  
    if ('props' in defaultStaticProps) {
      const authorsPageProps = deepmerge(defaultStaticProps, {
        props: {
          book: airBook?.fields || null,
        },
        revalidate: 30,
      });
      return authorsPageProps;
    } else {
      return defaultStaticProps;
    }
  } catch (error) {
    console.error(error);

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
    authors?: AirtableRecord<Author>[]
    book?: AirtableRecord<Book>
} & SSGPageProps<Partial<OnlyBrowserPageProps>>;

const bookInfoPage: NextPage<Props> = (props): JSX.Element => {
  const customer: Customer = useCustomer();
  const { book } = props;
  const authorsBook: AirtableRecord<Author>[] = book?.author as AirtableRecord<Author>[];
  const theme = useTheme();
  const {
    logo: logoAirtable,
  } = theme;
  const logo: AirtableAttachment = logoAirtable;

  return (!book ? <NotFound404Page {...props} /> :
    <DefaultLayout
      {...props}
      pageName={AMPLITUDE_PAGES.TEMPLATE_SSG_PAGE}
    >
      <Container
        css={css`
          .card {
            flex-direction: row;

            @media (max-width: 778px) {
              flex-direction: column;
              padding-top: 20px;

              img {
                width: 100%;
              }

              .card-body {
                max-width: 100%;
              }
            }
          }
          

          .card img {
            min-width: 250px;
            max-width: 40%;
            margin: auto;
          }

          .card-body {
            margin: 0 auto;
            max-width: 60%;
          }

          .author {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2E86C1;
            margin-right: 20px;
          }

          .isbn span {
            margin-right: 10px;
          }

          
        `}
      >
        <h1>{book.title}</h1>
        <Card>
          <img
            src={book.coverPhoto?.[0]?.thumbnails?.large?.url || logo.url}
            alt={book.title}
          />
          <CardBody>
            <CardText>
              {
                map(authorsBook, (author) => {
                  return (<span className="author" key={author.id}>{author.name}</span>);
                })
              }
            </CardText>
            <CardText className="isbn">
              {book.ISBN10 && <span><strong>ISBN 10: </strong>{book.ISBN10}</span>}
              {book.ISBN13 && <span><strong>ISBN 13: </strong>{book.ISBN13}</span>}
              {book.openlibrary && <span><strong>Open Library ID: </strong>{book.openlibrary}</span>}
            </CardText>
            <CardText>
              <span>Publisher{book.publish_date && ` in ${book.publish_date}`}{book.publish_date && ` by ${book.publishers}`}</span>
            </CardText>
            <CardText>{book.synopsis}</CardText>
          </CardBody>
        </Card>
        <br />
        <h2>Author{size(book.author) > 1 && 's'}</h2>
        {
          map(authorsBook, (author) => {
            return (
              <Card key={author.id}>
                <img
                  src={author.photos?.[0]?.thumbnails?.large?.url || logo.url}
                  alt={author.name}
                />
                <CardBody>
                  <CardTitle>
                    {author.name}
                  </CardTitle>
                  <CardText>{author.bio}</CardText>
                </CardBody>
              </Card>
            );
          })
        }
      </Container>
    </DefaultLayout>
  );
};

export default (bookInfoPage);