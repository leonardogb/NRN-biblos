import find from 'lodash.find';
import get from 'lodash.get';
import isArray from 'lodash.isarray';
import map from 'lodash.map';
import size from 'lodash.size';
import { AirtableRecord } from '../../types/data/Airtable';
import { AirtableDataset } from '../../types/data/AirtableDataset';
import { AirtableFieldsMapping } from '../../types/data/AirtableFieldsMapping';
import { BaseTable } from '../api/fetchAirtableTable';
import { DEFAULT_FIELDS_MAPPING, getGenericLocalisedField, hasGenericLocalisedField, isLocalisedField } from './airtableField';

/**
 * Sanitize an airtable record into a proper type.
 * Avoids manipulating Airtable's weird object, and resolve fields linking.
 *
 * @param record
 * @param dataset
 * @param preferredLocales
 * @param tableLinks
 */
export const sanitizeRecord = <Record extends AirtableRecord = {}>(record: AirtableRecord<Record>, dataset: AirtableDataset, preferredLocales: string[], tableLinks: AirtableFieldsMapping = DEFAULT_FIELDS_MAPPING): Record => {
  const sanitizedRecord: Record = {
    id: record.id,
    createdTime: record.createdTime,
  } as Record;

  // Resolve relationships
  map(record?.fields, (fieldValue: any | any[], fieldName: string) => {
    // If the field exists in the tableLinks, then it's a relation to resolve
    const fieldRecordType: BaseTable | null = get(tableLinks, fieldName, null);

    if (fieldRecordType) {
      if (isArray(fieldValue) && size(fieldValue) > 1) {
        map(fieldValue, (subFieldValue: any, subFieldName: string) => {
          const linkedRecord = find(dataset?.[fieldRecordType], { id: subFieldValue });

          // Init array if not yet init
          if (!sanitizedRecord[fieldName]) {
            sanitizedRecord[fieldName] = [];
          }

          // If a linked record has been resolved, apply it
          if (typeof linkedRecord !== 'undefined') {
            sanitizedRecord[fieldName].push({
              ...linkedRecord,
              __typename: fieldRecordType,
            });
          } else {
            // Otherwise, keep the existing data
            // It's possible the "dataset" doesn't contain the related field
            sanitizedRecord[fieldName] = fieldValue; // TODO optimisation, currently applied as many times as there are items, could be done only once
          }
        });
      } else {
        const id = isArray(fieldValue) ? fieldValue[0] : fieldValue;
        const linkedRecord = find(dataset?.[fieldRecordType], { id });
        sanitizedRecord[fieldName] = linkedRecord;

        // If a linked record has been resolved, apply it
        if (typeof linkedRecord !== 'undefined') {
          sanitizedRecord[fieldName] = {
            ...linkedRecord,
            __typename: fieldRecordType,
          };
        } else {
          // Otherwise, keep the existing data
          // It's possible the "dataset" doesn't contain the related field
          sanitizedRecord[fieldName] = fieldValue;
        }
      }
    } else {
      // Otherwise, it's a normal field and must be copied over
      sanitizedRecord[fieldName] = fieldValue;
    }

    // If the record contains the generic localised field, then it's been resolved already in a previous loop iteration (ignore)
    const hasBeenLocalised = isLocalisedField(fieldName, preferredLocales) ? hasGenericLocalisedField(sanitizedRecord, fieldName) : false;

    // Resolve value to use, depending on what value is available
    // Basically, if the current locale is "FR" and we got a value for a "labelFR" then we use it
    // If we don't have a value in "labelFR" then we fallback to `label${DEFAULT_LOCALE}` (i.e: labelEN)
    if (isLocalisedField(fieldName, preferredLocales) && !hasBeenLocalised) {
      const genericLocalisedField = getGenericLocalisedField(fieldName);

      map(preferredLocales, (locale: string, i: number) => {
        const hasBeenLocalised = isLocalisedField(fieldName, preferredLocales) ? hasGenericLocalisedField(sanitizedRecord, fieldName) : false;
        const value = get(record.fields, `${genericLocalisedField}${locale.toUpperCase()}`); // Look into the record, because field may not have been copied onto sanitizedFields yet

        if (value && !hasBeenLocalised) {
          sanitizedRecord[genericLocalisedField] = value;
        }
      });
    }
  });

  // Copy system fields
  sanitizedRecord.id = record.id;
  sanitizedRecord.createdTime = record.createdTime;

  // Auto resolve the main record type
  map(dataset, (records: AirtableRecord[], recordType: BaseTable) => {
    if (find(records, { id: record.id })) {
      sanitizedRecord.__typename = recordType;
    }
  });

  return sanitizedRecord;
};