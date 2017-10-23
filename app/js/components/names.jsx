/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import apiCall from '../utilities/apiHelper';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'react-bootstrap';

class Name extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: 'view',
      givenName: '',
      middleName: '',
      familyName: '',
      voided: false,
      preferred: true,
      creator: '',
      dateCreated: '',
      response: '',
      errorGivenName: '',
      errorFamilyName: '',
      showModal: false
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fetchPatientInfo = this.fetchPatientInfo.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    this.fetchPatientInfo();
  };

  fetchPatientInfo() {
    apiCall(null, 'get', 'patient/' + this.props.uuid + '?v=full')
      .then((response) => {
        const { givenName, middleName, familyName, voided } =
          response.person.preferredName
        const { creator, dateCreated } =
          response.person.auditInfo
        this.setState({
          response: response.person,
          givenName: givenName,
          middleName: middleName,
          familyName: familyName,
          voided: voided,
          creator: creator.display,
          dateCreated: dateCreated
        });
      })
      .catch(error => (error));
  };

  handleEdit() {
    this.setState({
      display: 'edit',
      showModal: true
    });

  }
  toggle() {
    this.setState({
      showModal: !this.state.showModal
    });
  }


  handleChange(event) {
    const { name, value } = event.target
    event.preventDefault();
    this.setState({
      [name]: value,
      errorGivenName: '',
      errorFamilyName: ''
    },
      function () {
        if (!this.state.givenName || (/\s/g.test(this.state.givenName))) {
          this.setState(
            { errorGivenName: 'Given Name can not be null or contain spaces' }
          )
        }
        if (!this.state.familyName || (/\s/g.test(this.state.familyName))) {
          this.setState(
            { errorFamilyName: 'Family Name can not be null or contain spaces' }
          )
        }
      }
    );
  }

  handleSave(event) {
    event.preventDefault();
    let requestBody = {
      'givenName': this.state.givenName,
      'middleName': this.state.middleName,
      'familyName': this.state.familyName
    }
    let requestUrl = '/person/' + this.state.response.uuid +
      '/name/' + this.state.response.preferredName.uuid
    if (!this.state.errorGivenName && !this.state.errorFamilyName) {
      apiCall(requestBody, 'post', requestUrl)
        .then((response) => { this.props.newName() })
        .catch(error => (error));
      this.setState({ display: 'view', showModal: false })
      toastr.success('Name updated sucessfully');
    }
    else {
      toastr.error('Fix errors on page');
    }
  }

  handleCancel() {
    this.fetchPatientInfo();
    const given = this.state.response.preferredName.givenName;
    const middle = this.state.response.preferredName.middleName;
    const family = this.state.response.preferredName.familyName;
    this.setState((prevState) => ({
      display: 'view',
      givenName: given === null ? '' : prevState.givenName,
      middleName: middle === null ? '' : prevState.middleName,
      familyName: family === null ? '' : prevState.familyName,
      voided: prevState.response.preferredName.voided,
      preferred: prevState.preferred,
      creator: prevState.response.auditInfo.creator.display,
      dateCreated: prevState.response.auditInfo.dateCreated,
      errorGivenName: '',
      errorFamilyName: '',
      showModal: false

    }));
  };

  render() {
    let givenErrorClass = '';
    let familyErrorClass = '';
    if (this.state.errorGivenName && this.state.display === 'edit') {
      givenErrorClass = 'has-error'
    }
    if (this.state.errorFamilyName && this.state.display === 'edit') {
      familyErrorClass = 'has-error'
    }
    return (
      <div >
        <h4
        > {this.state.givenName} {' '} {this.state.middleName} {''} {this.state.familyName}</h4>
        <a onClick={this.handleEdit}> Edit </a>
        <Modal show={this.state.showModal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Edit Names</ModalHeader>
          <ModalBody>
            <form className='form-horizontal' id="names">
              <div className={'form-group ' + givenErrorClass}>
                <label className='control-label col-sm-5'> Given Name*: </label>
                <div className='col-sm-7'>
                  <input className='form-control'
                    name='givenName'
                    type='text'
                    value={this.state.givenName}
                    onChange={this.handleChange}
                    readOnly={
                      this.state.display === 'view' ?
                        'readonly' : null
                    }
                  />
                </div>
                {
                  this.state.errorGivenName &&
                  this.state.display === 'edit' &&
                  <div className='input'>
                    {this.state.errorGivenName}
                  </div>
                }
              </div>

              <div className='form-group '>
                <label className='control-label col-sm-5'> Middle Name: </label>
                <div className='col-sm-7'>
                  <input className='form-control'
                    name='middleName'
                    type='text'
                    value={this.state.middleName}
                    onChange={this.handleChange}
                    readOnly={
                      this.state.display === 'view' ?
                        'readonly' : null
                    }
                  />
                </div>
              </div>

              <div className={'form-group ' + familyErrorClass}>
                <label className='control-label col-sm-5'> Family Name*: </label>
                <div className='col-sm-7'>
                  <input className='form-control'
                    name='familyName'
                    type='text'
                    value={this.state.familyName}
                    onChange={this.handleChange}
                    readOnly={
                      this.state.display === 'view' ?
                        'readonly' : null
                    }
                  />
                </div>
                {
                  this.state.errorFamilyName &&
                  this.state.display === 'edit' &&
                  <div className='input'>
                    {this.state.errorFamilyName}
                  </div>
                }
              </div>

              <div className='form-group '>
                <label className='control-label col-sm-5'> Created By: </label>
                <div className='col-sm-7'>
                  <input className='form-control'
                    name='createdby'
                    type='text'
                    size='50'
                    value={
                      this.state.creator + '  ' +
                      this.state.dateCreated
                    }
                    disabled
                  />
                </div>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary"
              type='submit'
              name='update'
              className='btn-success'
              onClick={this.handleSave}
            >Save</Button>{' '}
            <Button color="secondary"
              type='button'
              name='cancel'
              onClick={this.handleCancel}
            >Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  };
};

export default Name;
