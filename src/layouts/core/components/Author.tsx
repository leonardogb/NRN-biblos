import React from 'react';
import { CSSStyles } from '@/modules/core/css/types/CSSStyles';
import { AirtableRecord } from '@/modules/core/data/types/AirtableRecord';
import { Author as AuthorType } from '@/modules/core/data/types/Author';
import map from 'lodash.map';
import EllipsisTextMultiline from '@/common/components/dataDisplay/EllipsisTextMultiline';
import { Card, CardBody, CardDeck, CardGroup, CardImg, CardText, CardTitle } from 'reactstrap';

export type Props = {
    style?: CSSStyles;
    author: AirtableRecord<AuthorType>;
  };

const Author: React.FunctionComponent<Props> = (props) => {
  const {
    author,
  } = props;

  return (
    <Card>
      <CardImg top width="100%" src={author?.photos?.[0]?.url} alt={author.name} />
      <CardBody>
        <CardTitle tag="h5">{author.name}</CardTitle>
        <EllipsisTextMultiline>
          {author.bio}
        </EllipsisTextMultiline>
      </CardBody>
    </Card>
  );
};

export default Author;