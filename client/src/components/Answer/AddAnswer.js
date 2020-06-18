import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  InputGroup,
  Input,
  InputGroupAddon,
  Button,
} from 'reactstrap';

export const AddAnswer = (props) => {
  const [reply, setReply] = useState();
  const handleChange = (e) => {
    setReply(e.target.value);
  };
  const handleClick = () => {
    setReply('');
    props.handleAddReply(reply);
  };
  return (
    <Card>
      <CardHeader>Reply</CardHeader>
      <InputGroup>
        <Input placeholder='and...' value={reply} onChange={handleChange} />
        <InputGroupAddon addonType='append'>
          <Button onClick={handleClick} color='secondary'>
            Reply
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Card>
  );
};