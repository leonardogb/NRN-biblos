import { AirtableRecord } from './AirtableRecord';
import { Asset } from './Asset';
import { Author } from './Author';
import { Customer } from './Customer';

export type Book = {
  id?: string;
  title?: string;
  author?: AirtableRecord<Author>[] | string[];
  coverPhoto?: AirtableRecord<Asset>;
  synopsis?: string[];
  personalNotes?: string[];
  customer?: AirtableRecord<Customer>[] | string[]; // Stored as an array of strings on AT API, converted to a Customer object once sanitised
  ISBN10?: number;
  ISBN13?: number;
  openlibrary?: string;
  publish_date?: string;
  publishers?: string;
};