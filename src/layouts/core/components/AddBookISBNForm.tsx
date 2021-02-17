import React, { useState } from 'react';
import { CSSStyles } from '@/modules/core/css/types/CSSStyles';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from 'reactstrap';
import { css } from '@emotion/react';
import { Book } from '@/modules/core/data/types/Book';
import Animated3Dots from '@/common/components/animations/Animated3Dots';

export type Props = {
  style?: CSSStyles;
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  books: Book[]
};

const AddBookISBNForm: React.FunctionComponent<Props> = (props) => {
  const { style, setBooks, books } = props;  

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    show: false,
    error: false,
    message: ''
  });

  const resetMessage = () => {
    setMessage({
      show: false,
      error: false,
      message: ''
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const inputIsbn = search.replace(/[- ]/g, '');
    const isbn = /^\d{10}$|^\d{9}X$|^978\d{10}$|^979\d{10}$/.exec(inputIsbn)?.[0] || null;
    
    if (isbn) {
      setLoading(true);
      const response = await fetch(`/api/addBookISBN`, { method: 'POST', body: JSON.stringify({isbn: isbn}) });
      const data = await response.json();

      if (!data.error && data?.data?.fields) {
        const newBook = {...data?.data?.fields, id: data?.data?.id};
        setBooks([...books, newBook]);
        setMessage({
          show: true,
          error: false,
          message: `The book ${newBook.title} is added !`
        });
      } else {
        setMessage({
          show: true,
          error: true,
          message: data.message
        });
      }
    } else {
      setMessage({
        show: true,
        error: true,
        message: 'Bad ISBN format'
      });
    }
    setSearch('');
    setLoading(false);
  };

  return (
    <Form
      css={css`
        .form-group {
          max-width: 280px;
          margin: 0 0 0 auto;
        }
      `}
      onSubmit={handleSubmit}
    >
      <FormGroup>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>ISBN</InputGroupText>
          </InputGroupAddon>
          <Input
            type="text"
            name="ISBN"
            placeholder="ISBN 10 or ISBN 13"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.currentTarget.value)
            }
            value={search}
          />
          <InputGroupAddon addonType="append">
            {
              loading ? 
                <Animated3Dots
                  className="btn btn-secondary disabled"
                  width="3rem"
                /> :
                <Button
                  disabled={loading}
                >Add book</Button>
            }
          </InputGroupAddon>
        </InputGroup>
        {message.show && 
          <Alert 
            color={message.error ? 'danger' : 'success'}
            isOpen={message.show} toggle={resetMessage}
            className="mt-3"
          >{message.message}</Alert>
        }
      </FormGroup>
    </Form>
  );
};

export default AddBookISBNForm;