import React from 'react';
import { CSSStyles } from '@/modules/core/css/types/CSSStyles';
import { AirtableRecord } from '@/modules/core/data/types/AirtableRecord';
import { Book as BookType } from '@/modules/core/data/types/Book';
import map from 'lodash.map';
import { Author } from '@/modules/core/data/types/Author';
import EllipsisTextMultiline from '@/common/components/dataDisplay/EllipsisTextMultiline';
import I18nLink from '@/modules/core/i18n/components/I18nLink';
import Btn from '@/common/components/dataDisplay/Btn';
import { AirtableAttachment } from '@/modules/core/data/types/AirtableAttachment';
import { useTheme } from '@emotion/react';

export type Props = {
    style?: CSSStyles;
    book: AirtableRecord<BookType>;
  };

const Book: React.FunctionComponent<Props> = (props) => {
  const {
    book,
  } = props;

  const authors: BookType[] = book.author as any;
  const theme = useTheme();
  const {
    logo: logoAirtable,
  } = theme;
  const logo: AirtableAttachment = logoAirtable;
  

  return (
    
    <div className="book">
      <div className="book_content">
        <div className="book_image">
          <img src={book?.coverPhoto?.[0]?.url || logo.url} alt={book?.coverPhoto?.[0]?.filename} />
        </div>
        <div className="book_info">
          <p className="book_title">{book?.title}</p>
          <I18nLink
            href={'/book/[bookId]'}
            params={{
              bookId: book.id,
            }}
            className="float-right"
          >
            <Btn mode={'secondary-outline'}>More info!</Btn>
          </I18nLink>
          
          {
            map(authors, (author: AirtableRecord<Author>, i: number) => {
              return (<span key={author.id} className="book_authors">{author.name}</span>);
            })
          }
          <div className="isbn">
            {book.ISBN10 && <span><strong>ISBN 10: </strong>{book.ISBN10}</span>}
            {book.ISBN13 && <span><strong>ISBN 13: </strong>{book.ISBN13}</span>}
          </div>
          {
            book?.synopsis && (
              <EllipsisTextMultiline
                lineClamp={5}
                title={`Description of ${book?.title}`}
              >
                {book.synopsis}
              </EllipsisTextMultiline>
            )
          }
        </div>
      </div>
    </div>

    
  );
};

export default Book;