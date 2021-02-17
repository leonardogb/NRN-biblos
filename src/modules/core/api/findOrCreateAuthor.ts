import createAuthor from './createAuthor';

type AuthorBook = {
  name: string,
  url: string
};


/**
 *
 * Find the id of the author passed as an argument in the "Authors"'s table or create it.
 *
 * @param args
 */
const findOrCreateAuthor  = async (authors: AuthorBook[]) => {
  
  try {
    const authorsIds = [];
    await Promise.all(authors.map(async (author) => {
      const splitedURL = author.url.split('/');
      const id = splitedURL[4];
      
      const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Authors/?filterByFormula={openlibrary_key}="/authors/${id}"`, {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
      });

      const airtableAuthor = await response.json();      
      
      if (airtableAuthor.records[0]) {
        authorsIds.push(
          {
            id: airtableAuthor.records[0].id,
            name: airtableAuthor.records[0].fields?.name
          }
        );
      } else {
        
        const newAuthor = await createAuthor(id);
        if (newAuthor) {          
          authorsIds.push(
            {
              id: newAuthor?.records[0]?.id,
              name: newAuthor?.records[0]?.fields?.name
            }
          );
        }
      }

    }));    
    
    return authorsIds;
  } catch (error) {
    return null;
  }
};
  
export default findOrCreateAuthor;