import React, { useState } from 'react';
import { Card, CardImg, Popover, PopoverHeader, PopoverBody } from 'reactstrap';

const UserListSingleProject = (props) => {
  const { user, index } = props;
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggle = () => setPopoverOpen(!popoverOpen);
  return (
    <Card id={`popover${index}`} style={{ width: '50px', height: '50px' }}>
      <CardImg
        top
        width='50%'
        src={process.env.PUBLIC_URL + '/avatar.png'}
        alt='Card image cap'
      />
      <Popover
        placement='bottom'
        isOpen={popoverOpen}
        target={`popover${index}`}
        toggle={toggle}
      >
        <PopoverHeader>{`${user.name} ${user.lastname}`}</PopoverHeader>
        <PopoverBody>{user.email}</PopoverBody>
      </Popover>
    </Card>
  );
};
export default UserListSingleProject;