import { AirtableRecord } from './AirtableRecord';
import { Asset } from './Asset';
import { Book } from './Book';

export type Author = {
  id?: string;
  name?: string;
  photos?: AirtableRecord<Asset>;
  bio?: string[];
  books?: AirtableRecord<Book>;
};