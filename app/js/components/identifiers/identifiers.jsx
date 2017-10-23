/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import {Modal} from 'react-bootstrap';
import apiCall from '../../utilities/apiHelper';
import NewIdentifier from './addIdentifier';

export default class Identifiers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      identifierUuid: '',
      activeCard: '',
      editState: false,
      editable: false,
      showModal: false,
      voided: false,
      hideViewCard: false,
      preferredIdentifierUuid: '',
      identifier: '',
      identifierType: '',
      location: '',
      identifiersArray: [],
      identifierstypesArray: [],
      locationArray: [],
      editIdentifiers: {},
      editErrors: {
        uuid: '',
        error: '',
      },
      addErrors: {
        uuid: '',
        error: '',
      },
    };

    this.callEdit = this.callEdit.bind(this);
    this.callSave = this.callSave.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.callCancel = this.callCancel.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handlePreferred = this.handlePreferred.bind(this);
    this.handleError = this.handleError.bind(this);
    this.fetchIdentifiers = this.fetchIdentifiers.bind(this);
    this.handleUnDelete = this.handleUnDelete.bind(this);
  }

  componentDidMount() {
    this.fetchIdentifiers();
    apiCall(null, 'get', 'patientidentifiertype')
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          identifierstypesArray: res.results,
        }));
      });
    apiCall(null, 'get', 'location')
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          locationArray: res.results,
        }));
      });
  }

  fetchIdentifiers() {
    apiCall(null, 'get',
      `patient/${this.props.uuid}/identifier?v=full&includeAll=true`)
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          identifiersArray: res.results,
        }));
      });
  }

  handlePreferred(isPreferred) {
    const newEditIdentifiers = Object.assign({}, this.state.editIdentifiers);
    if (!isPreferred) {
      newEditIdentifiers.preferred = !isPreferred;
      this.setState({ editIdentifiers: newEditIdentifiers });
    }
  }

  handleChange(event, index) {
    event.preventDefault();
    const { name, value } = event.target;
    this.setState({
      editIdentifiers: Object.assign({}, this.state.editIdentifiers, {
        [name]: value,
      }),
    });
  }

  callEdit(id, uuid) {
    this.setState({
      editState: true,
      showModal: true,
      activeCard: id,
      identifierUuid: uuid,
      hideViewCard: true,
      errors: {
        edit: '',
        add: '',
      },
    });
  }

  callSave(event) {
    event.preventDefault();
    this.setState({ editErrors: { uuid: '', error: '' } });
    console.log("this", this.state.editIdentifiers)
    const keys = [];
    const values = [];
    const { editIdentifiers } = this.state;
    Object.keys(editIdentifiers).filter((key) => {
      if (editIdentifiers[key] !== '') {
        keys.push(key);
        values.push(editIdentifiers[key]);
        return editIdentifiers[key];
      }
    });
    const newEditIdentifiers = values.reduce((acc, cur, i) => (
      acc[keys[i]] = cur, acc), {});

    if ((this.state.identifierUuid !==
      this.state.preferredIdentifierUuid) &&
      this.state.editIdentifiers.preferred) {
      apiCall(newEditIdentifiers,
        'post',
        `patient/${this.props.uuid}/identifier/${this.state.identifierUuid}`)
        .then((res) => {
          apiCall({ preferred: false },
            'post',
            `patient/${this.props.uuid}/identifier/${this.state.preferredIdentifierUuid}`)
            .then((res) => {
              toastr.success('Successfully Updated');
              this.fetchIdentifiers();
              this.handleError();
            })
            .catch(error => toastr.error(error));
        })
        .catch(error => toastr.error(error));
    } else if (this.state.identifierUuid !==
      this.state.preferredIdentifierUuid) {
      apiCall(newEditIdentifiers,
        'post',
        `patient/${this.props.uuid}/identifier/${this.state.identifierUuid}`)
        .then((res) => {
          if (res.error) {
            this.setState({
              editErrors: {
                uuid: this.state.identifierUuid,
                error: res.error.message,
              },
            });
          } else {
            this.handleError();
            toastr.success('Identifier Updated Successfully.') && this.fetchIdentifiers();
          }
        })
        .catch(error => toastr.error(error));
    } else {
      newEditIdentifiers.preferred = true;
      apiCall(newEditIdentifiers,
        'post',
        `patient/${this.props.uuid}/identifier/${this.state.identifierUuid}`)
        .then((res) => {
          if (res.error) {
            this.setState({
              editErrors: {
                uuid: this.state.identifierUuid,
                error: res.error.message,
              },
            });
          } else {
            toastr.success('Identifier Updated Successfully.') && this.fetchIdentifiers();
            this.handleError();
          }
        })
        .catch(error => toastr.error(error));
    }
  }

  handleError() {
    this.setState({
      editState: false,
      showModal: false,
      activeCard: '',
      hideViewCard: false,
      editIdentifiers: {},
    });
  }

  handleDelete(uuid, voided, preferred) {
    if ((uuid !== this.state.preferredIdentifierUuid) && voided === false) {
      apiCall(null, 'delete',
        `patient/${this.props.uuid}/identifier/${uuid}?!purge`)
        .then((res) => {
          toastr.error('successfully deleted');
          this.fetchIdentifiers();
        })
        .catch(error => toastr.error(error));
      this.setState({
        voided: !voided,
        hideViewCard: false,
        editState: false,
        showModal: false,
      });
    } else {
      toastr.error('Can not delete Preferred Identifier');
    }
  }

  handleUnDelete(uuid) {
    apiCall({ 'voided': 'false' },
      'post',
      `patient/${this.props.uuid}/identifier/${uuid}`)
      .then((response) => {
        toastr.error(response.error);
      })
  }

  callCancel(event) {
    event.preventDefault();
    this.setState(prevState => ({
      editState: false,
      activeCard: '',
      showModal: false,
      identifier: prevState.identifier,
      identifierType: prevState.identifierType,
      hideViewCard: false,
      editErrors: {
        uuid: '',
        error: '',
      },
      addErrors: {
        uuid: '',
        error: '',
      },
    }));
  }

  render() {
    const { editIdentifiers, editErrors, addErrors } = this.state;
    let editErrorClass = '';
    let addErrorClass = '';
    let editError = '';
    let addError = '';
    if (editErrors.error.length > 0) {
      editErrorClass = 'has-error';
      editError = editErrors.error;
    }
    if (addErrors.error.length > 0) {
      addErrorClass = 'has-error';
      addError = addErrors.error;
    }
    return (
      <div className="row">
        {
          this.state.identifiersArray.sort((first, second) => {
            if (
              (!first.preferred && second.preferred) &&
              (!first.voided && !second.voided) ||
              (first.voided && !second.voided)) {
              return 1;
            } else if (
              (!first.preferred && !second.preferred) &&
              (first.voided && !second.voided)) {
              return 1;
            } else {
              return 0;
            }
          }).map((id, index) => {
            if (id.preferred) {
              this.state.preferredIdentifierUuid = id.uuid;
            }
            return (
              <div key={id.uuid}>
                {!this.state.hideViewCard &&
                  <div>
                    <div className="viewCard">
                      {
                        id.preferred &&
                        <div className="preferred">
                          <span className="badge badge-info">Preferred</span>
                        </div>
                      }
                      {(id.voided) ?
                        <del>
                          <p>
                            {id.identifierType.display}{': '}
                            {this.state.activeCard !== index
                              ? id.identifier
                              : editIdentifiers.identifier || id.identifier}
                            {<br />}
                            {this.state.editState === false &&
                              <a onClick={() => this.callEdit(index, id.uuid)}
                              >Edit
                            </a>
                            }
                          </p>
                        </del>
                        : <p>
                          {id.identifierType.display}{': '}
                          {(this.state.activeCard !== index)
                            ? id.identifier
                            : editIdentifiers.identifier || id.identifier}
                          {<br />}
                          {this.state.editState === false &&
                            <a onClick={() => this.callEdit(index, id.uuid)}
                            >Edit
                            </a>
                          }
                        </p>
                      }
                    </div>
                  </div>
                }

                {this.state.editState && this.state.activeCard == index &&
                  <Modal show={this.state.showModal} onHide={this.callCancel}>
                    <Modal.Header closeButton>
                      <Modal.Title>Edit Identifier</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="editCard">
                        <div className="card1 full-width" id={index} key={index}>
                          <div className="card-header transparent">
                            {(id.preferred) ?
                              (<div className="preferred">
                                <span className="badge badge-info">Preferred</span>
                              </div>
                              ) : id.voided ?
                                (<div className="preferred">
                                  <span className="badge badge-error">Deleted</span>
                                </div>
                                )
                                : ''
                            }
                          </div>
                          <div className="card-body">
                            <div
                              className={
                                this.state.editErrors.uuid === id.uuid ?
                                  editErrorClass : ''
                              }>
                              <h6><b>Identifier</b></h6>
                              <input
                                className="form-control col-sm-8"
                                type="text"
                                name="identifier"
                                defaultValue={
                                  this.state.activeCard !== index
                                    ? id.identifier
                                    : editIdentifiers.identifier ||
                                    id.identifier
                                }
                                onChange={e => this.handleChange(e, index)}
                                disabled={id.voided}
                              />
                              {this.state.editErrors.uuid === id.uuid &&
                                <div className="input">{editError}</div>}
                            </div>
                            <div>
                              <div>
                                <h6><b>Identifier Type</b></h6>
                                <select
                                  className="form-control"
                                  name="identifierType"
                                  value={editIdentifiers.identifierType ||
                                    id.identifierType.display}
                                  disabled={id.voided}
                                  onChange={e => this.handleChange(e, index)}
                                >
                                  {
                                    this.state.identifierstypesArray.map(idType => (
                                      <option
                                        key={idType.uuid}
                                        value={idType.display}
                                      > {idType.display}
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                              <div>
                                <h6><b>Location</b></h6>
                                <select
                                  className="form-control"
                                  name="location"
                                  value={
                                    editIdentifiers.location || id.location.display
                                  }
                                  disabled={id.voided}
                                  onChange={this.handleChange}
                                >
                                  {
                                    this.state.locationArray.map(location => (
                                      <option
                                        key={location.uuid}
                                        value={location.display}
                                      >{location.display}
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                              <div className="arrange-horizontally">
                                <h6><b>Created By </b></h6>
                                <h5 name="creator">
                                  {id.auditInfo.creator.display} on {'  '}
                                  {new Date(id.auditInfo.dateCreated).toString()}
                                </h5>
                              </div>
                              {!id.preferred && !id.voided &&
                                <div className="arrange-horizontally">
                                  <h6><b>Preferred  </b></h6> <t />
                                  <input
                                    className="form-check-input"
                                    type="Checkbox"
                                    name="preferred"
                                    defaultChecked={id.preferred}
                                    disabled={id.voided}
                                    onChange={() => this.handlePreferred(id.preferred)}
                                  />
                                </div>
                              }
                              <div id="buttons">
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={this.callSave}
                                  disabled={id.voided}
                                >Save</button>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={
                                    (!id.voided)
                                      ? () => this.handleDelete(id.uuid, id.voided)
                                      : () => this.handleUnDelete(id.uuid)}
                                >{(!id.voided) ? 'Delete' : 'Restore'}</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Modal.Body>
                  </Modal>
                }
              </div>
            );
          })
        }
        <NewIdentifier
          stateData={this.state}
          callCancel={this.callCancel}
          fetchIdentifiers={this.fetchIdentifiers}
          patientId={this.props.uuid}
        />
      </div>
    );
  }
}
