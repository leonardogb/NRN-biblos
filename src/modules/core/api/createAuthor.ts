

/**
   *
   * Find the author in open library DB and create the author in airtable.
   *
   * @param args
   */
  const createAuthor  = async (id: string) => {
    try {
      
      const response = await fetch(`https://openlibrary.org/authors/${id}.json`,
        {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
            'Accept': 'application/json; charset=UTF-8',
          }
        }
      );
    
      if (response.status !== 200) {
        throw new Error(`Error openlibrary server status: ${response.status} message: ${response.statusText}`);
      }
      const OLAuthor = await response.json();
    
      const author = {
        name: OLAuthor?.name,
        photos: OLAuthor?.photos?.map((photo) => { return {url: photo !== -1 ? `https://covers.openlibrary.org/a/id/${photo}.jpg` : ''};}) || [],
        bio: OLAuthor?.bio?.value || '',
        openlibrary_key: OLAuthor?.key
      };
  
      const airtableResp = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Authors`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: [
              {
                fields: author
              }
            ]
          })
        }
      );
  
      const airtableAuthor = await airtableResp.json();
      
      return airtableAuthor;
      
    } catch (error) {
      console.error(error);
        
      return null;
    }
      
  };
      
  export default createAuthor;