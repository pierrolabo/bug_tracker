import React, { Component } from 'react';
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Col,
  Row,
  Button,
} from 'reactstrap';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getUsers } from '../actions/userActions';
import { getTicket } from '../actions/ticketActions';
import { addReply } from '../actions/ticketActions';
import { clearTicket } from '../actions/ticketActions';
import { deleteReply } from '../actions/ticketActions';
import { setCompletedTicket } from '../actions/ticketActions';
import { setAssignedTo } from '../actions/ticketActions';
import { Answer } from '../components/Answer/Answer';
import { AddAnswer } from '../components/Answer/AddAnswer';
import SelectSingleUser from '../components/Select/SelectSingleUser';

class ViewSingleTicket extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    getTicket: PropTypes.func.isRequired,
    clearTicket: PropTypes.func.isRequired,
    setCompletedTicket: PropTypes.func.isRequired,
  };
  state = {
    nextAssignedUser: null,
  };
  UNSAFE_componentWillMount() {
    //  Get the params in url
    const id = this.props.router.location.pathname.slice(14);
    this.props.getTicket(id);
  }

  async componentDidUpdate(prevProps) {
    try {
      //  If the key in history has change, it means the location has changed
      //  So we update the ticket
      if (prevProps.router.location.key !== this.props.router.location.key) {
        const id = this.props.router.location.pathname.slice(14);
        await this.props.getTicket(id);
      }
    } catch (err) {}
  }
  handleAddReply = (reply) => {
    const ticketID = this.props.router.location.pathname.slice(14);
    const { user } = this.props.auth;
    const status = this.props.ticket.ticket.status;
    this.props.addReply(reply, ticketID, user._id, status);
  };
  //  Delete a reply
  handleDelete = (event) => {
    let id = event.target.parentNode.id;

    //  If svg or <th> is clicked, sometimes we dont get id
    //  this fix the bug
    if (!id) {
      id = event.target.id;
    }
    const ticketID = this.props.ticket.ticket._id;
    const answerID = id;
    this.props.deleteReply(ticketID, answerID);
  };
  getUserFromID = (id) => {
    if (id === '') return 'Unassigned';
    const { users } = this.props.user;
    const filteredUser = users.filter((user) => user._id === id);
    //  If no user has been found, return default
    if (filteredUser.length !== 0) {
      return filteredUser[0].email;
    }
    return 'User not Found';
  };
  handleChangeSelectUser = (event) => {
    this.setState({
      nextAssignedUser: event.value,
    });
  };
  handleSaveSelectUser = () => {
    const ticketID = this.props.ticket.ticket._id;
    const userID = this.state.nextAssignedUser;
    this.props.setAssignedTo(ticketID, userID);
    this.setState({
      nextAssignedUser: null,
    });
  };
  handleMarkAsCompleted = () => {
    const ticketID = this.props.ticket.ticket._id;
    const { user } = this.props.auth;
    this.props.setCompletedTicket(ticketID, user._id);
  };
  render() {
    //  default ticket to print
    let ticket = {
      answers: [],
      history: [],
      status: 'PROGRESS',
      assigned_to: '5f9596e82a5d267341e909fb',
      completed_by: null,
      ip_address: null,
      isCompleted: false,
      _id: '5f981747d1e1983424ceb3e4',
      projectID: '5f9410c86fdcef63a19cd1b6',
      title: 'loading',
      description: 'validated',
      created_by: '5f95975d2a5d267341e909fe',
      last_updated: '2020-10-27T12:49:11.745Z',
      date: '2020-10-27T12:49:11.745Z',
      __v: 0,
    };
    let loadingTicket = this.props.ticket.ticket;
    //  Fix a bug when this.props.ticket is undefined
    if (loadingTicket) ticket = loadingTicket;
    const { users } = this.props.user;
    const answers = ticket.answers;
    const created_by = this.getUserFromID(ticket.created_by);
    const assigned_to = this.getUserFromID(ticket.assigned_to);
    const loading = this.props.ticket.isLoading;
    const hasRightOptions = this.props.auth.role !== 'USER';
    return (
      <Row className="m-auto">
        <Col md="12" sm="12" lg="8" className="mt-5">
          <Card>
            <CardHeader>
              <Row>
                <Col className="text-center">{ticket.title}</Col>
              </Row>
            </CardHeader>
            <CardHeader>
              <Container className="themed-container">
                <Row>
                  <Col md="12" lg="3">
                    <span>Created_by: {created_by}</span>
                  </Col>
                  <Col md="12" lg="3">
                    <span>Assigned_to: {assigned_to}</span>
                  </Col>
                  <Col md="12" lg="3">
                    <span>{new Date(ticket.date).toUTCString()}</span>
                  </Col>
                  {ticket.isCompleted ? (
                    <Col md="12" lg="3" className="text-right">
                      <Badge color="danger">Completed</Badge>
                    </Col>
                  ) : (
                    <Col md="12" lg="3" className="text-right">
                      <Badge color="danger">{ticket.status}</Badge>
                    </Col>
                  )}
                </Row>
              </Container>
            </CardHeader>
            <CardBody>{ticket.description}</CardBody>
          </Card>

          {answers.map((answer, index) => {
            return (
              <Answer
                getUserFromId={this.getUserFromID}
                role={this.props.auth.role}
                answer={answer}
                handleDelete={this.handleDelete}
                key={index}
              />
            );
          })}

          <AddAnswer handleAddReply={this.handleAddReply} />
        </Col>
        <Col md="12" lg="4">
          <Container className=" mt-sm-3 pl-sm-0 mt-md-5">
            {ticket.isCompleted || !hasRightOptions ? (
              ''
            ) : (
              <Button color="danger" onClick={this.handleMarkAsCompleted}>
                Mark as Completed
              </Button>
            )}
            {/*
          We render only if the ticket is loaded
          its doesnt update if the props change :(
        */}
            {!loading && hasRightOptions ? (
              <SelectSingleUser
                users={users}
                assigned_to={ticket.assigned_to}
                handleChange={this.handleChangeSelectUser}
              />
            ) : (
              ''
            )}
            {this.state.nextAssignedUser ? (
              <Button color="success" onClick={this.handleSaveSelectUser}>
                Reassign
              </Button>
            ) : (
              ''
            )}
          </Container>
        </Col>
      </Row>
    );
  }
}
const mapStateToProps = (state) => ({
  auth: state.auth,
  user: state.user,
  isLoading: state.ticket.isLoading,
  project: state.project,
  ticket: state.ticket,
});
export default connect(mapStateToProps, {
  getTicket,
  getUsers,
  addReply,
  deleteReply,
  clearTicket,
  setCompletedTicket,
  setAssignedTo,
})(ViewSingleTicket);
