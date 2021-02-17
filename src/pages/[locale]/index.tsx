import Btn from '@/common/components/dataDisplay/Btn';
import ExternalLink from '@/common/components/dataDisplay/ExternalLink';
import AddBookISBNForm from '@/layouts/core/components/AddBookISBNForm';
import BooksList from '@/layouts/core/components/BooksList';
import { OnlyBrowserPageProps } from '@/layouts/core/types/OnlyBrowserPageProps';
import { SSGPageProps } from '@/layouts/core/types/SSGPageProps';
import { SSRPageProps } from '@/layouts/core/types/SSRPageProps';
import DefaultLayout from '@/layouts/default/components/DefaultLayout';
import { getDefaultServerSideProps } from '@/layouts/default/defaultSSR';
import { AMPLITUDE_PAGES } from '@/modules/core/amplitude/amplitude';
import useCustomer from '@/modules/core/data/hooks/useCustomer';
import { Customer } from '@/modules/core/data/types/Customer';
import I18nLink from '@/modules/core/i18n/components/I18nLink';
import { createLogger } from '@unly/utils-simple-logger';
import {
  GetServerSideProps,
  NextPage,
} from 'next';
import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';

const fileLabel = 'pages/[locale]/pageTemplateSSR';
const logger = createLogger({ // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
  label: fileLabel,
});

/**
 * Props that are only available for this page
 */
type CustomPageProps = {}

type GetServerSidePageProps = CustomPageProps & SSRPageProps

/**
 * Fetches all products and customer in one single GQL query
 *
 * XXX You should fetch everything you need in one single query, for performance reasons.
 *  It fetches all customer data by default, because those data are needed on all pages (displayed in footer/nav header).
 *
 * @param context
 */
export const getServerSideProps: GetServerSideProps<GetServerSidePageProps> = getDefaultServerSideProps;

/**
 * SSR pages are first rendered by the server
 * Then, they're rendered by the client, and gain additional props (defined in OnlyBrowserPageProps)
 * Because this last case is the most common (server bundle only happens during development stage), we consider it a default
 * To represent this behaviour, we use the native Partial TS keyword to make all OnlyBrowserPageProps optional
 *
 * Beware props in OnlyBrowserPageProps are not available on the server
 */
type Props = CustomPageProps & (SSRPageProps & SSGPageProps<OnlyBrowserPageProps>);

const HomePageSSR: NextPage<Props> = (props): JSX.Element => {
  const customer: Customer = useCustomer();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    setBooks(customer?.books);
  }, [customer]);

  return (
    <DefaultLayout
      {...props}
      pageName={AMPLITUDE_PAGES.TEMPLATE_SSR_PAGE}
    >
      <Container>
        <h1>My books</h1>
        <AddBookISBNForm 
          setBooks={setBooks}
          books={books}
        />
        <BooksList 
          books={books}
        />
      </Container>
    </DefaultLayout>
  );
};

export default (HomePageSSR);