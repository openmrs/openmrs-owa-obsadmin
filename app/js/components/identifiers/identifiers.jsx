/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
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
      voided: false,
      hideViewCard: false,
      prefferedIdentifierUuid: '',
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
      `patient/${this.props.uuid}/identifier?v=full`)
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

  handleChange(e, index) {
    e.preventDefault();
    const { name, value } = e.target;
    this.setState({
      editIdentifiers: Object.assign({}, this.state.editIdentifiers, {
        [name]: value,
      }),
    });
  }

  callEdit(id, uuid) {
    this.setState({
      editState: true,
      activeCard: id,
      identifierUuid: uuid,
      hideViewCard: true,
      errors: {
        edit: '',
        add: '',
      },
    });
  }

  callSave(e) {
    e.preventDefault();
    this.setState({ editErrors: { uuid: '', error: '' } });
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
      this.state.prefferedIdentifierUuid) &&
      this.state.editIdentifiers.preferred) {
      apiCall(newEditIdentifiers,
        'post',
        `patient/${this.props.uuid}/identifier/${this.state.identifierUuid}`)
        .then((res) => {
          apiCall({ preferred: false },
            'post',
            `patient/${this.props.uuid}/identifier/${this.state.prefferedIdentifierUuid}`)
            .then((res) => {
              toastr.success('Successfully Updated');
              this.fetchIdentifiers();
              this.handleError();
            })
            .catch(error => toastr.error(error));
        })
        .catch(error => toastr.error(error));
    } else if (this.state.identifierUuid !==
      this.state.prefferedIdentifierUuid) {
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
      activeCard: '',
      hideViewCard: false,
      editIdentifiers: {},
    });
  }

  handleDelete(uuid, voided, preferred) {
    if ((uuid !== this.state.prefferedIdentifierUuid) && voided === false) {
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
      });
    } else {
      toastr.error('Can not delete Preferred Identifier');
    }
  }

  callCancel(e) {
    e.preventDefault();
    this.setState(prevState => ({
      editState: false,
      activeCard: '',
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
          this.state.identifiersArray.map((id, index) => {
            if (id.preferred) { this.state.prefferedIdentifierUuid = id.uuid; }
            return (
              <div key={id.uuid}>
                {!this.state.hideViewCard &&
                  <div className="viewCard">
                    {id.identifierType.display}{': '}
                    {this.state.activeCard !== index ? id.identifier : editIdentifiers.identifier || id.identifier}
                    {'   '}
                    {this.state.editState === false &&
                      <a onClick={() => this.callEdit(index, id.uuid)}>Edit
											</a>
                    }
                  </div>
                }

                {this.state.editState && this.state.activeCard == index &&
                  <div className="editCard">
                    <div className="card1" id={index} key={index}>
                      <i className="close" aria-label="Close">
                        <span
                          className="deleteIcon"
                          aria-hidden="true"
                          onClick={this.callCancel}
                        >&times; </span>
                      </i>
                      <div className="card-header">
                        <h4>Identifier {id.identifier}</h4></div>
                      <div className="card-body">
                        <div className={this.state.editErrors.uuid === id.uuid ? editErrorClass : ''}>
                          <h6><b>Identifier</b></h6>
                          <input
                            className="form-control"
                            type="text"
                            name="identifier"
                            defaultValue={this.state.activeCard !== index ?
                              id.identifier : editIdentifiers.identifier ||
                              id.identifier}
                            onChange={e => this.handleChange(e, index)}
                            disabled={!this.editState && (
                              this.state.activeCard !== index) ? 'disabled' : null}
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
                              onChange={e => this.handleChange(e, index)}
                            >
                              {
                                this.state.identifierstypesArray.map(idType => (
                                  <option key={idType.uuid} value={idType.display} > {idType.display}
                                  </option>
                                ))
                              }
                              disabled={!this.state.editState ? 'disabled' : null}
                            </select>
                          </div>
                          <div>
                            <h6><b>Location</b></h6>
                            <select
                              className="form-control"
                              name="location"
                              value={editIdentifiers.location || id.location.display}
                              onChange={this.handleChange}
                            >
                              {
                                this.state.locationArray.map(location => (
                                  <option key={location.uuid} value={location.display}>{location.display}
                                  </option>
                                ))
                              }
                              disabled={!this.state.editState ? 'disabled' : null}
                            </select>
                          </div>
                          <div className="arrange-horizontally">
                            <h6><b>Created By </b></h6>
                            <h6 name="creator">
                              {id.auditInfo.creator.display} on
                              {new Date(id.auditInfo.dateCreated).toString()}
                            </h6>
                          </div>
                          <div className="arrange-horizontally">
                            <h6><b>Preferred  </b></h6> <t />
                            <input
                              className="form-check-input"
                              type="Checkbox"
                              name="preferred"
                              defaultChecked={id.preferred}
                              onChange={() => this.handlePreferred(id.preferred)}
                            />
                          </div>
                          <div id="buttons">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={this.callSave}
                            >Save</button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => this.handleDelete(id.uuid, id.voided)}
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
