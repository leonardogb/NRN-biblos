import React from 'react';
import { CSSStyles } from '@/modules/core/css/types/CSSStyles';
import { AirtableRecord } from '@/modules/core/data/types/AirtableRecord';
import { Book } from '@/modules/core/data/types/Book';
import BooksListItem from './Book';
import { css } from '@emotion/react';


export type Props = {
    style?: CSSStyles;
    books: AirtableRecord<Book>[];
  };

const BooksList: React.FunctionComponent<Props> = (props) => {
  const {
    style,
    books,
  } = props;

      
  return (
    <div
      css={css`
          .book {
              position: relative;
              margin: 20px 0;
          }

          .book_content {
              margin-top: 20px;
              border: 1px solid #e4e4e4;
              background-color: #FFF;
              border-radius: 3px;
              position: relative;
              overflow: hidden;
              min-height: 285px;
              padding: 20px;
          }

          .book_image {
              float: left;
              max-width: 230px;
              width: 18%;
              padding-left: 2%;
              padding-right: 2%;
          }

          .book_info {
              float: left;
              margin-left: 3%;
              width: 75%;
              font-size: 14px;
              position: relative;
              text-align: left;
          }

          .book_title {
              font-size: 18px;
              font-weight: 600;
              color: #222;
              line-height: 1.4em;
              margin-top: 0;
          }

          .book_authors {
              font-size: 14px;
              font-weight: 600;
              color: #2E86C1;
              margin-right: 20px;
          }

          .book_description {
              margin-top: 15px;
              margin-bottom: 14px;
              padding-top: 15px;
              border-top: 1px solid #dedede;
              font-weight: 400;
              overflow-x: hidden;
              display: block;
          }

          img {
              width: 100%;
          }

          .isbn {
              margin-bottom: 15px;
          }

          .isbn span {
              margin-right: 10px;
          }
        `}
    >
      {
        books.map((book) => <BooksListItem key={book.id} book={book} />)
      }
    </div>
    
  );
};

export default BooksList;