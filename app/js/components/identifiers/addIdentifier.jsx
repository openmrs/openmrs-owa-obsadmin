/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import PropTypes from 'react-proptypes';
import {Modal} from 'react-bootstrap';
import apiCall from '../../utilities/apiHelper';
import FontAwesome from'react-fontawesome';

class NewIdentifier extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNewIdentifier: false,
      showModal: false,
      addIdentifiers: {},
      editErrors: {
        uuid: '',
        error: '',
      },
      addErrors: {
        uuid: '',
        error: '',
      },
    };
    this.handleAddNew = this.handleAddNew.bind(this);
    this.callCreate = this.callCreate.bind(this);
    this.handleCreateChange = this.handleCreateChange.bind(this);
    this.handleCancelPromise = this.handleCancelPromise.bind(this);
  }

  handleAddNew() {
    this.setState({
      isNewIdentifier: true,
      showModal: true,
      addErrors: { uuid: '', error: '' }
    });
  }

  handleCreateChange(e) {
    const label = e.target.name;
    const value = e.target.value;
    const { addIdentifiers } = this.state;

    if(label === 'preferred') {
      addIdentifiers.preferred = e.target.checked;
    } else {
      addIdentifiers[label] = value;
    }
    this.setState((prevstate) => {
      return {
        addIdentifiers
      }
    });
  }

  callCreate() {
    const keys = [];
    const values = [];
    const { addIdentifiers } = this.state;
    Object.keys(addIdentifiers).filter((key) => {
      if(addIdentifiers[key] !== '') {
        keys.push(key);
        values.push(addIdentifiers[key]);
        return addIdentifiers[key];
      }
    });
    const newAddIdentifiers = values.reduce((acc, cur, i) => (acc[keys[i]] = cur, acc), {});
    if(this.state.addIdentifiers.preferred === true) {
      apiCall(newAddIdentifiers,
          'post', `patient/${this.props.patientId}/identifier`)
        .then((response) => {
          apiCall({ preferred: false },
            'post',
            `patient/${this.props.patientId}/identifier/${this.props.stateData.preferredIdentifierUuid}`,
          )
            .then((response) => {
              if(response.error) {
                this.setState({
                  addErrors: {
                    error: response.error.message,
                  },
                });
              } else {
                this.setState({
                  isNewIdentifier: false,
                  showModal: false,
                  addIdentifiers: {}
                });
                this.props.fetchIdentifiers();
              }
            })
            .catch(error => toastr.error(error));
        })
        .catch(error => toastr.error(error));
    } else {
      apiCall(newAddIdentifiers, 'post',
          `patient/${this.props.patientId}/identifier`)
        .then((response) => {
          if(response.error) {
            this.setState({ addErrors: { error: response.error.message } });
          } else {
            this.setState({
              isNewIdentifier: false,
              addIdentifiers: {},
              showModal: false
            });
            this.props.fetchIdentifiers();
          }
        })
        .catch(error => toastr.error(error));
    }
  }

  handleCancelPromise() {
    return(new Promise((resolve, reject) => {
      resolve(this.setState({
        isNewIdentifier: false,
        showModal: false,
      }, () => { this.props.callCancel; }));
    }, ));
  }

  render() {
    const { editErrors, addErrors } = this.state;
    let editErrorClass = '';
    let addErrorClass = '';
    let editError = '';
    let addError = '';
    if(editErrors.error.length > 0) {
      editErrorClass = 'has-error';
      editError = editErrors.error;
    }
    if(addErrors.error.length > 0) {
      addErrorClass = 'has-error';
      addError = addErrors.error;
    }

    return(
      <div>
        {!this.state.isNewIdentifier && !this.props.stateData.editState &&
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-2 btn-margin">
              <div >
                <FontAwesome className="fa fa-plus-square-o add-btn"
                            onClick={this.handleAddNew}
                            />
                <p className='add-content'>add Identifier</p>
              </div>
            </div>
          </div>
        }
        {
          this.state.isNewIdentifier && !this.props.stateData.editState &&
            <Modal show={this.state.showModal} onHide={this.handleCancelPromise}>
              <Modal.Header closeButton>
                <Modal.Title>Add Identifier</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="card1 full-width" id="add-card">
                  <div className="card-body">
                    <div>
                      <div className={addError.includes('identifier,') ||
                        !(addError.includes('identifierType') ||
                          addError.includes('Location')) ? addErrorClass : ''}
                      >
                        <h6><b>Identifier</b></h6>
                        <input
                          type="text"
                          className="form-control"
                          name="identifier"
                          defaultValue={this.state.addIdentifiers.id}
                          onChange={this.handleCreateChange}
                        />
                        {(addError.includes('identifier,') ||
                          !(addError.includes('identifierType') ||
                            addError.includes('Location'))) &&
                          <div className="input">{addError}</div>}
                      </div>
                      <div className={addError.includes(
                        'identifierType') ? addErrorClass : ''}
                      >
                        <h6><b>Identifier Type</b></h6>
                        <select
                          className="form-control"
                          name="identifierType"
                          defaultValue={this.state.addIdentifiers.type}
                          onChange={this.handleCreateChange}
                        >
                          <option value="">Choose type</option>
                          {
                            this.props.stateData.identifierstypesArray.map(idType => (
                              <option key={idType.uuid} value={idType.display}>{idType.display}</option>
                            ))
                          }
                        </select>

                        {addError.includes('identifierType') &&
                          <div className="input">{addError}</div>}
                      </div>
                      <div className={addError.includes('Location') ? addErrorClass : ''}>
                        <h6><b>Location</b></h6>
                        <select
                          className="form-control"
                          name="location"
                          defaultValue={this.state.addIdentifiers.location}
                          onChange={this.handleCreateChange}
                        >
                          <option value="">Choose location</option>
                          {
                            this.props.stateData.locationArray.map(location => (
                              <option key={location.uuid} value={location.display}>{location.display}
                              </option>
                            ))
                          }
                        </select>
                        {addError.includes('Location') &&
                          <div className="input">{addError}</div>}
                      </div>
                      <div className="arrange-horizontally">
                        <h6><b>Preferred  :</b></h6> <t />
                        <input
                          className="form-check-input"
                          type="Checkbox"
                          name="preferred"
                          defaultChecked={this.state.addIdentifiers.preferred}
                          onChange={this.handleCreateChange}
                        />
                      </div>

                      <div id="buttons">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={this.handleCancelPromise}
                        >Cancel</button>

                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={this.callCreate}
                        >Create</button>

                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
        }
      </div>
    );
  }
}

NewIdentifier.propTypes = {
  stateData: PropTypes.object.isRequired,
  callCancel: PropTypes.func.isRequired,
  fetchIdentifiers: PropTypes.func.isRequired,
};

export default NewIdentifier;
