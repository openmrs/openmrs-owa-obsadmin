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

export default class Identifiers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patient_uuid: props.uuid,
      identifier_uuid: '',
      active_card: '',
      editState: false,
      newState: false,
      editable: false,
      voided: false,
      preffered_identifier_uuid: '',
      identifier: '',
      identifierType: '',
      location: '',
      identifiers_array: [],
      identifierstypes_array: [],
      location_array: [],
      addIdentifiers: {
        identifier: '',
        identifierType: '',
        location: '',
        preferred: false
      },
      editIdentifiers: {
        identifier: '',
        identifierType: '',
        location: '',
        preferred: false,
      }
    };
    this.callEdit = this.callEdit.bind(this);
    this.callSave = this.callSave.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.callCancel = this.callCancel.bind(this);
    this.callNew = this.callNew.bind(this);
    this.callCreate = this.callCreate.bind(this);
    this.handleCreateChange = this.handleCreateChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handlePreferred = this.handlePreferred.bind(this);
  }
  /**
   * On component mount, performs api calls.
   */
  componentDidMount() {
    apiCall(null, 'get', `patient/${this.state.patient_uuid}/identifier?v=full`)
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          identifiers_array: res.results
        }))
      })
    apiCall(null, 'get', 'patientidentifiertype')
      .then(res => {
        this.setState(Object.assign({}, this.state, {
          identifierstypes_array: res.results,
        }))
      })
    apiCall(null, 'get', 'location')
      .then(res => {
        this.setState(Object.assign({}, this.state, {
          location_array: res.results
        }))
      })
  }

  /**
   * reload component.
   */
  reload() {
    apiCall(null, 'get', `patient/${this.state.patient_uuid}/identifier?v=full`)
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          identifiers_array: res.results,
        }))
      })
  }
  /**
   *
   * @param {*} isPreferred
   * @param {*} identifier_uuid
   *It handle change of the preferred identifier
   */
  handlePreferred(isPreferred, identifier_uuid) {
    let new_editIdentifiers = Object.assign({}, this.state.editIdentifiers);
    if (!isPreferred) {
      new_editIdentifiers.preferred = !isPreferred;
      this.setState({ editIdentifiers: new_editIdentifiers });
    }
  }
  /**
   *
   * @param {*} e
   *Handles chnage of input during edit
   */
  handleChange(e, index) {
      e.preventDefault();
        const { name, value } = e.target;
        this.setState({
          editIdentifiers: Object.assign({}, this.state.editIdentifiers, {
            [name]: value
          })
        })
  }

  /**
   *
   * @param {*} e
   *handles input change during creating new identifier
   */
  handleCreateChange(e) {
    const label = e.target.name;
    const value = e.target.value;
    const { addIdentifiers } = this.state;

    if (label === 'preferred') {
      addIdentifiers['preferred'] = e.target.checked;
    } else {
      addIdentifiers[label] = value;
    }
    this.setState({
      addIdentifiers
    });
  }
  /**
   *
   * @param {*} id
   * @param {*} uuid
   *sets to state currently active card
   */
  callEdit(id, uuid) {
    this.setState({ editState: true, active_card: id, identifier_uuid: uuid });
  }

  /**
   * f
   * @param {*} e
   *Opens the new card
   */
  callNew(e) {
    this.setState({ newState: true })
  }

  /**
   *
   * @param {*} e
   *creates new identifier
   */
  callCreate(e) {
    this.setState({ newState: false });
    let keys = [];
    let values = [];
    let { addIdentifiers } = this.state;
    const returned_addIdentifiers = Object.keys(addIdentifiers).filter((key) => {
      if (addIdentifiers[key] !== "") {
        keys.push(key);
        values.push(addIdentifiers[key]);
        return addIdentifiers[key];
      }
    });
    const new_addIdentifiers = values.reduce((acc, cur, i) => (acc[keys[i]] = cur, acc), {});
    if (this.state.addIdentifiers.preferred === true) {
      apiCall(new_addIdentifiers, 'post', `patient/${this.state.patient_uuid}/identifier`)
        .then((response) => {
          apiCall({ preferred: false },
            'post',
            `patient/${this.state.patient_uuid}/identifier/${this.state.preffered_identifier_uuid}`
          )
            .then((response) => {
              (response.error) ?
                toastr.error(response.error.message)
                :
                toastr.success("Identifier Created Successfully.") && this.reload();
            })
            .catch(error => toastr.error(error))
        })
        .catch(error => toastr.error(error));
    } else {
      apiCall(new_addIdentifiers, 'post', `patient/${this.state.patient_uuid}/identifier`)
        .then((response) => {
          (response.error) ?
            toastr.error(response.error.message)
            :
            toastr.success("Identifier Created Successfully.") && this.reload();
        })
        .catch(error => toastr.error(error));
    }
  }

  /**
   *
   * @param {*} e
   *called on save when editing an identifier
   */
  callSave(e) {
    this.setState({ editState: false })
    let keys = [];
    let values = [];
    let { editIdentifiers } = this.state;
    const returned_editIdentifiers = Object.keys(editIdentifiers).filter((key) => {
      if (editIdentifiers[key] !== "") {
        keys.push(key);
        values.push(editIdentifiers[key]);
        return editIdentifiers[key];
      }
    });
    const new_editIdentifiers = values.reduce((acc, cur, i) => (acc[keys[i]] = cur, acc), {});

    if ((this.state.identifier_uuid !==
      this.state.preffered_identifier_uuid) &&
      this.state.editIdentifiers.preferred) {
      apiCall(new_editIdentifiers,
        'post',
        `patient/${this.state.patient_uuid}/identifier/${this.state.identifier_uuid}`
      )
        .then((res) => {
          apiCall({ preferred: false },
            'post',
            `patient/${this.state.patient_uuid}/identifier/${this.state.preffered_identifier_uuid}`
          )
            .then(res => {
              toastr.success("Successfully Updated");
              this.reload();
            })
            .catch(error => toastr.error(error))
        })
        .catch(error => toastr.error(error));
    } else if (this.state.identifier_uuid !==
      this.state.preffered_identifier_uuid) {
      apiCall(new_editIdentifiers,
        'post',
        `patient/${this.state.patient_uuid}/identifier/${this.state.identifier_uuid}`
      )
        .then((res) => {
          (res.error) ?
            toastr.error(res.error.message)
            :
            toastr.success("Identifier Updated Successfully.") && this.reload();
        })
        .catch(error => toastr.error(error))
    } else {
      new_editIdentifiers.preferred = true;
      apiCall(new_editIdentifiers,
        'post',
        `patient/${this.state.patient_uuid}/identifier/${this.state.identifier_uuid}`
      )
        .then((res) => {
          (res.error) ?
            toastr.error(res.error.message)
            :
            toastr.success("Identifier Updated Successfully.") && this.reload();
        })
        .catch(error => toastr.error(error))
    }
    this.setState({
        editState: false,
        active_card: '',
      editIdentifiers: {
        identifier: '',
        identifierType: '',
        location: '',
        preferred: false,
      }
    })
  }

  /**
   *
   * @param {*} uuid
   * @param {*} voided
   * @param {*} preferred
   *handles delete of an idientifier
   */
  handleDelete(uuid, voided, preferred) {
    if ((uuid !== this.state.preffered_identifier_uuid) && voided === false) {
      apiCall(null, 'delete', `patient/${this.state.patient_uuid}/identifier/${uuid}?!purge`)
        .then((res) => {
          this.setState({ voided: !voided })
          toastr.error("successfully deleted");
          this.reload();
        })
        .catch(error => toastr.error(error))
    } else {
      toastr.error("Can not delete Preferred Identifier");
    }
  }
  /**
   *
   * @param {*} e
   *handels closing the card on cancel
   */
  callCancel(e) {
    this.setState((prevState) => (
                    {   editState: false,
                        newState: false,
                        active_card: '',
                        identifier: prevState.identifier,
                        identifierType: prevState.identifierType
                }));
  }

  render() {
    const { editIdentifiers } = this.state;
    return (
      <div className="row">
        {
          this.state.identifiers_array.map((id, index) => {
            if (id.preferred) { this.state.preffered_identifier_uuid = id.uuid; }
            /**
             * displays the view identifier cards
             */
            return (
              <div className="card1" id={index} key={index}>
                <div className="card-header"> <h4>Identifier {id.identifier}</h4></div>
                <div className="card-body">
                  <div>
                    <h6><b>Identifier</b></h6>
                    <input
                      className="form-control"
                      type="text"
                      name="identifier"
                      value={this.state.active_card !== index ? id.identifier : editIdentifiers.identifier || id.identifier}
                      onChange={(e)=>this.handleChange(e,index)}
                      disabled={!this.editState && (this.state.active_card !== index) ? "disabled" : null}/>
                  </div>
                  {this.state.editState && this.state.active_card == index &&
                    <div>
                      <div>
                        <h6><b>Identifier Type</b></h6>
                        <select
                          className="form-control"
                          name="identifierType"
                          value={editIdentifiers.identifierType || id.identifierType.display}
                          onChange={(e)=>this.handleChange(e,index)}>

                          {
                            this.state.identifierstypes_array.map((id_type) => (
                              <option value={id_type.display}>{id_type.display}</option>
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
                          onChange={this.handleChange}>
                          {
                            this.state.location_array.map((location) => (
                              <option value={location.display}>{location.display}</option>
                            ))
                          }
                          disabled={!this.state.editState ? 'disabled' : null}
                        </select>
                      </div>
                      <div className="arrange-horizontally">
                        <h6><b>Created By :</b></h6>
                        <h6
                          name="creator">{id.auditInfo.creator.display} on {new Date(id.auditInfo.dateCreated).toString()}
                        </h6>
                      </div>
                      <div className="arrange-horizontally">
                        <h6><b>Preferred  :</b></h6> <t />
                        <input
                          className="form-check-input"
                          type="Checkbox"
                          name="preferred"
                          defaultChecked={id.preferred}
                          onChange={() => this.handlePreferred(id.preferred, id.uuid)}
                        />
                        </div>
                      <div id="buttons">
                        <button type="button" className="btn btn-success" onClick={this.callSave}>Save</button>
                        <button type="button" className="btn btn-light" onClick={this.callCancel}>Cancel</button>
                      </div>
                    </div>
                  }
                  {this.state.editState == false &&
                    <div>
                      <h6><b>Identifier Type</b></h6>
                      <input
                        className="form-control"
                        type="text"
                        name="identifierType"
                        value={id.identifierType.display}
                      />
                    </div>
                  }
                  {this.state.editState == false &&
                    <div id="buttons">
                      <button type="button" className="btn btn-success"
                        onClick={() => this.callEdit(index, id.uuid)}>Edit
                      </button>

                      {id.voided == true &&
                        <button type="button" className="btn btn-light"
                          onClick={() => this.handleDelete(id.uuid, id.voided)}>
                          restore
                        </button>
                      }
                      <button type="button" className="btn btn-light"
                        onClick={() => this.handleDelete(id.uuid, id.voided, this.state.preffered_identifier_uuid)}>
                        Delete
                      </button>
                    </div>
                  }
                </div>
              </div>
            )
          })
          /**
           * displays the create new identifierreact-bootstrap card
           */
        }
        <div className="card1" id="add-card">
          <div className="card-header" >
            <h4  onClick={this.callNew}>Add New Identifier</h4>
          </div>
          { !this.state.newState &&
            <div className="form-group">
              <div className="col-sm-offset-4 col-sm-4 btn-margin">
                <button type="button" name="add" onClick={this.callNew}
                  className="btn btn-success form-control">Add</button>
              </div>
            </div>
          }
          <div className="card-body">
            {this.state.newState &&
              <div>
                <h6><b>Identifier</b></h6>
                <input
                  type="text"
                  className="form-control"
                  name="identifier"
                  defaultValue={this.state.addIdentifiers.id} onChange={this.handleCreateChange}
                />
                <h6><b>Identifier Type</b></h6>
                <select
                  className="form-control"
                  name="identifierType"
                  defaultValue={this.state.addIdentifiers.type}
                  onChange={this.handleCreateChange}
                >
                <option value="">Choose type</option>
                  {
                    this.state.identifierstypes_array.map((id_type) => (
                      <option value={id_type.display}>{id_type.display}</option>
                    ))
                  }
                </select>
                <h6><b>Location</b></h6>
                <select
                  className="form-control"
                  name="location"
                  defaultValue={this.state.addIdentifiers.location}
                  onChange={this.handleCreateChange}
                >
                <option value="">Choose location</option>
                  {
                    this.state.location_array.map((location) => (
                      <option value={location.display}>{location.display}</option>
                    ))
                  }
                </select>
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
                  <button type="button" className="btn btn-success" onClick={this.callCreate}>Create</button>
                  <button type="button" className="btn btn-light" onClick={this.callCancel}>Cancel</button>
                </div>
              </div>
            }
            {this.state.newState == false &&
              <div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}
