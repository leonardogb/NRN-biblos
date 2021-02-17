import findOrCreateAuthor from '@/modules/core/api/findOrCreateAuthor';
import Sentry, { configureReq } from '@/modules/core/sentry/sentry';
import { createLogger } from '@unly/utils-simple-logger';
import isEmpty from 'lodash.isempty';
import { NextApiRequest, NextApiResponse } from 'next';

const fileLabel = 'api/addBookISBN';
const logger = createLogger({
  label: fileLabel,
});

export const addBookISBN = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    configureReq(req, { fileLabel });
    const { isbn } = JSON.parse(req.body);
    if (!isbn) {
      throw Error(`Invalid isbn code ${isbn}`);
    }

    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    
    if (response.status !== 200) {
      throw Error('Error from openlibrary.org');
    }
      
    const book = await response.json();

    if (isEmpty(book)) {
      throw Error('Book not found');
    }

    const bookDetails = book?.[`ISBN:${isbn}`];
    
    const authorsList = await findOrCreateAuthor(bookDetails?.authors);
    
    const airBook = {
      title: bookDetails?.title,
      author: authorsList?.map((author) => { return author.id;}),
      coverPhoto: [
        {
          url: bookDetails?.cover?.large || ''
        }
      ],
      synopsis: bookDetails?.description || '',
      customer: [
        process.env.NEXT_PUBLIC_CUSTOMER_AIRTABLE_ID || ''
      ],
      ISBN10: bookDetails?.identifiers?.isbn_10?.[0] || '',
      ISBN13: bookDetails?.identifiers?.isbn_13?.[0] || '',
      openlibrary: bookDetails?.identifiers?.openlibrary?.[0] || '',
      number_of_pages: bookDetails?.number_of_pages || null,
      publish_date: bookDetails?.publish_date || '',
      publishers: bookDetails?.publishers?.map((publisher) => publisher.name).join(', ')
    };    

    const airResponse = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Books`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [
            {
              fields: airBook
            }
          ]
        })
      }
    );

    const newBook = await airResponse.json();
    newBook.records[0].fields.author = authorsList;

    res.statusCode = 200;
    res.json({error: false, data: newBook?.records?.[0]});
    

  } catch (e) {
    Sentry.captureException(e);
    logger.error(e.message);

    res.json({
      error: true,
      message:
        process.env.NEXT_PUBLIC_APP_STAGE === 'production'
          ? 'Book not found'
          : e.message,
    });
  }
};

export default addBookISBN;