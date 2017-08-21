/**
 * The contents of this file are subject to the OpenMRS Public License
 * Version 1.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 * Copyright (C) OpenMRS, LLC.  All Rights Reserved.
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
    // this.reload = this.reload.bind(this);
  }
  /**
   * On component mount, performs api calls.
   */
  componentDidMount() {
    apiCall(null, 'get', `patient/${this.state.patient_uuid}/identifier?v=full`)
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          identifiers_array: res.results,
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
    console.log('clicked is', isPreferred);
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
  handleChange(e) {
    const label = e.target.name;
    console.log(e.target.name, 'this is the event', e.target.value, "this is the value");
    const { editIdentifiers } = this.state;
    editIdentifiers[label] = e.target.value;
    this.setState(
      Object.assign({}, this.state.editIdentifiers, {
        editIdentifiers
      })
    )
  }

  /**
   * 
   * @param {*} e
   *handles input change during creating new identifier
   */
  handleCreateChange(e) {
    const label = e.target.name;
    const { addIdentifiers } = this.state;

    if (label === 'preferred') {
      addIdentifiers['preferred'] = e.target.checked;
    } else {
      addIdentifiers[label] = e.target.value;
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
   * 
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
            toastr.success("Identifier Created Successfully.") && this.reload()
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
              this.reload()
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
            (toastr.success("Identifier Updated Successfully."), this.reload());
        })
        .catch(error => toastr.error(error))
      this.setState({
        editIdentifiers: {
          identifier: '',
          identifierType: '',
          location: '',
          preferred: false
        }
      })
    }
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
      toastr.error("cant delete preferred Identifier");
    }
  }
  /**
   * 
   * @param {*} e
   *handels closing the card on cancel
   */
  callCancel(e) {
    this.setState({ editState: false, newState: false })
  }

  render() {
    return (
      <div className="row">
        {
          this.state.identifiers_array.map((id, index) => {
            if (id.preferred === true) { this.state.preffered_identifier_uuid = id.uuid; }
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
                      defaultValue={id.identifier}
                      onChange={this.handleChange} />
                  </div>
                  {this.state.editState && this.state.active_card == index &&
                    <div>
                      <div>
                        <h6><b>Identifier type</b></h6>
                        <select
                          className="form-control"
                          name="identifierType"
                          defaultValue={id.identifierType.display}
                          onChange={this.handleChange}>
                          {
                            this.state.identifierstypes_array.map((id_type) => (
                              <option value={id_type.display}>{id_type.display}</option>
                            ))
                          }
                        </select>
                      </div>
                      <div>
                        <h6><b>Location</b></h6>
                        <select
                          className="form-control"
                          name="location"
                          defaultValue={id.location.display}
                          onChange={this.handleChange}>
                          {
                            this.state.location_array.map((location) => (
                              <option value={location.display}>{location.display}</option>
                            ))
                          }
                        </select>
                      </div>
                      <div>
                        <h6><b>Created By:</b></h6>
                        <h6
                          name="creator">{id.auditInfo.creator.display} on {new Date(id.auditInfo.dateCreated).toString()}
                        </h6>
                      </div>
                      <div>
                        <h6><b>Preferred</b></h6>
                        <input
                          className="form-check-input"
                          type="Checkbox"
                          name="preferred"
                          defaultChecked={id.preferred}
                          onChange={() => this.handlePreferred(id.preferred, id.uuid)}
                        />
                      </div>
                      <div id="buttons">
                        <button type="button" className="btn btn-success" onClick={this.callSave}>save</button>
                        <button type="button" className="btn btn-light" onClick={this.callCancel}>cancel</button>
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
                        defaultValue={id.identifierType.display}
                        onChange={this.handleChange}
                      />
                      <div id="buttons" >
                        <i
                          className="fa fa-pencil"
                          onClick={() => this.callEdit(index, id.uuid)}>
                        </i>

                        {id.voided == true &&
                          <i
                            className="fa fa-times"
                            onClick={() => this.handleDelete(id.uuid, id.voided)}>restore
                        </i>
                        }
                        <i
                          className="fa fa-times"
                          onClick={() => this.handleDelete(id.uuid, id.voided, this.state.preffered_identifier_uuid)}>
                        </i>
                      </div>
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
          <div className="card-header">
            <label className="card-link" onClick={this.callNew}>new identifier</label>
          </div>
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
                <h6><b>Identifier type</b></h6>
                <select
                  className="form-control"
                  name="identifierType"
                  defaultValue={this.state.addIdentifiers.type}
                  onChange={this.handleCreateChange}
                >
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
                  {
                    this.state.location_array.map((location) => (
                      <option value={location.display}>{location.display}</option>
                    ))
                  }
                </select>
                <h6><b>Preferred</b></h6>
                <input
                  className="form-check-input"
                  type="Checkbox"
                  name="preferred"
                  defaultChecked={this.state.addIdentifiers.preferred}
                  onChange={this.handleCreateChange}
                />
                <div id="buttons">
                  <button type="button" className="btn btn-success" onClick={this.callCreate}>create</button>
                  <button type="button" className="btn btn-light" onClick={this.callCancel}>cancel</button>
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
