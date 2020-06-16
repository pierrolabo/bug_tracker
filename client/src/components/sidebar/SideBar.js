import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBriefcase,
  faPaperPlane,
  faQuestion,
  faImage,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import {
  NavItem,
  NavLink,
  Nav,
  ListGroup,
  ListGroupItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  toggle,
  Collapse,
  NavbarText,
} from 'reactstrap';

import { Link } from 'react-router-dom';

import AdminTicketMenu from './AdminTicketMenu';
import AdminProjectMenu from './AdmiProjectMenu';
const SideBar = (props) => {
  console.log(props.role);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <div className='sideBar-container d-none d-xl-block'>
      <Navbar vertical color='dark' light expand='sm'>
        <NavbarToggler onClick={toggle} />
        <NavbarBrand className='position-fixed' href='/home'>
          Ticketter
        </NavbarBrand>
        <Collapse
          defect='true'
          className='position-fixed sidebar-position'
          isOpen={isOpen}
          navbar
        >
          <Nav vertical className='list-unstyled bg-dark sideBar'>
            <NavItem className='menu-item'>
              <NavLink href='/Tickets'>Tickets</NavLink>
            </NavItem>
            {props.role == 'ADMIN' ? (
              <AdminTicketMenu></AdminTicketMenu>
            ) : (
              <h1>not pass</h1>
            )}
            <NavItem>
              <Link to='/users'>User Roles</Link>
            </NavItem>
            {props.role == 'ADMIN' ? (
              <AdminProjectMenu></AdminProjectMenu>
            ) : (
              <h1>not pass</h1>
            )}
            <NavbarText>Simple Text</NavbarText>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};
const submenus = [
  [
    {
      title: 'Home 1',
      target: 'Home-1',
    },
    {
      title: 'Home 2',
      target: 'Home-2',
    },
    {
      itle: 'Home 3',
      target: 'Home-3',
    },
  ],
  [
    {
      title: 'Page 1',
      target: 'Page-1',
    },
    {
      title: 'Page 2',
      target: 'Page-2',
    },
  ],
];

export default SideBar;
