/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import DatePicker from "react-bootstrap-date-picker";
import { AsyncTypeahead, Typeahead } from 'react-bootstrap-typeahead';
import apiCall from '../utilities/apiHelper';

export default class Obs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: null,
      concepts: [],
      obs: {
        person: '',
        encounter: '',
        order: '',
        location: '',
        obsdate: '2017-01-01',
        concept: '',
        comment: 'comment',
        encounterUuid: '',
      },
      conceptOptions: [],
      conceptSelected: [],
      conceptAnswers: [],
      selectedConceptData: [],
      locations: [],
      conceptDataType: 'Text',
      value: '',
      invalid: false,
      editValues: {},
    }
    this.getValue = this.getValue.bind(this);
    this.goToEncounter = this.goToEncounter.bind(this);
    this.conceptOnChange = this.conceptOnChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.loadConcepts = this.loadConcepts.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.goHome = this.goHome.bind(this);
    this.renderValue = this.renderValue.bind(this);
    this.renderInput = this.renderInput.bind(this);
    this.changeValue = this.changeValue.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.state.uuid = this.props.params.obsId;
    if (this.state.uuid) {
      apiCall(null, 'get', '/location')
        .then((result) => {
          apiCall(null, 'get', `/obs/${this.state.uuid}`)
            .then((res) => {
              if (res) {
                const obs = {
                  person: res.person.display.substr(res.person.display.indexOf('-') + 1).trim() || '',
                  encounter: res.encounter.display || '',
                  order: res.encounter.order || '',
                  location: res.location.display || '',
                  obsdate: res.obsDatetime || '',
                  concept: res.concept.display || '',
                  conceptUuid: res.concept.uuid || '',
                  comment: res.comment || '',
                  encounterUuid: res.encounter.uuid,
                }
                this.setState({
                  obs,
                  conceptOptions: [{ name: res.concept.display }] || [],
                  conceptSelected: [res.concept.display],
                  value: this.getValue(res.value) || '',
                  locations: result.results,
                });
                if (this.state.obs.conceptUuid) {
                  this.loadConcepts();
                }
              }
            })
            .catch((err) => {
              toastr.error(err);
            });
        })
        .catch((error) => {
          toastr.error(error);
        })
    } else {
      this.props.router.push('/');
    }
  }

  delete() {
    apiCall(null, 'delete', `obs/${this.state.uuid}`)
      .then((result) => {
        toastr.options.closeButton = true;
        toastr.success('Deleted successfully');
        this.goToEncounter();
      })
      .catch(error => toastr.error(error));
  }

  getValue(value) {
    if (value === null || undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object') {
      if (value.display) {
        return value.display;
      }
      else {
        return '';
      }
    }
    return '';
  }

  changeValue(event) {
    const valueHolder = event.target.value;
    const value = valueHolder.substring(valueHolder.indexOf("///") + 3);
    const editValue = valueHolder.substring(0, valueHolder.indexOf("///"));
    const newEditValues = this.state.editValues;
    newEditValues.value = editValue;
    this.setState({ value, editValues: newEditValues, });
  }

  handleChange(event) {
    let name;
    let value;
    if (event.target) {
      name = event.target.name;
      value = event.target.value;
    } else {
      name = "value";
      value = event;
    }
    const newEditValues = this.state.editValues;
    newEditValues[name] = value;
    if (name === "value") {
      this.setState({ value, editValues: newEditValues, });
    } else {
      const newObs = this.state.obs;
      newObs[name] = value;
      this.setState({
        obs: newObs,
        editValues: newEditValues,
      });
    }
  }

  goToEncounter() {
    this.props.router
      .push(`/patient/${this.props.params.patentId}/encounter/${this.state.obs.encounterUuid}`);
  }

  conceptOnChange(selected) {
    if (selected.length > 0) {
      let filtteredConceptData = [];
      if (selected[0].answers) {
        let newEditValues = this.state.editValues;
        newEditValues.concept = selected[0].uuid;
        delete newEditValues.value;
        filtteredConceptData = selected[0].answers.map(concept => {
          const conceptData = {
            uuid: concept.uuid,
            display: concept.display,
          };
          return conceptData;
        });
        const newData = selected[0];
        if (typeof newData === 'object') {
          newData.answers = filtteredConceptData;
        }
        this.setState({ selectedConceptData: newData, value: '', editValues: newEditValues })
      }
    }
  }

  onSearch(selected) {
    this.loadConcepts(selected);
  }

  goHome() {
    this.props.router.push('/');
  }

  renderInput(disabled) {
    return (<input type="text" name="value" disabled={disabled}
      onChange={this.handleChange}
      className="form-control bootstrap-typeahead-input-main"
      value={this.state.value}
    />);
  }

  renderValue() {
    let valueType = this.state.selectedConceptData;
    if (valueType !== undefined) {
      if (valueType.datatype !== undefined) {
        valueType = valueType.datatype;
        valueType = valueType.name ? valueType.name : null;
      } else {
        valueType = null;
      }
    } else {
      valueType = null;
    }
    switch (valueType) {
      case null:
        return this.renderInput(true)
      case "Text":
      case "Structured Numeric":
      case "Numeric":
        return this.renderInput(false);
      case "Datetime":
      case "Date":
      case "Time":
        return (<DatePicker
          dateFormat="DD-MM-YYYY"
          className="form-control"
          showClearButton={false}
          onChange={this.handleChange}
          name="value"
          value={this.state.value}
          onInvalid={this.handleInvalidDate}
        />);
      case "Boolean":
        return (<select
          className="form-control"
          name="value"
          value={this.value}
          onChange={this.handleChange}
        >
          <option value="">Select option</option>
          <option value="false">false</option>
          <option value="true">true</option>
        </select>);
      default:
        if (this.state.selectedConceptData.answers) {

          if (this.state.selectedConceptData.answers.length > 0) {
            const values = this.state.selectedConceptData.answers;
            values.push({ display: 'Select option', uuid: '' });
            return (<select
              className="form-control"
              name="value"
              onChange={this.changeValue}
            >
              {
                values.map((option, key) => (
                  <option selected={option.display === this.state.value ? true : false}
                    value={`${option.uuid}///${option.display}`}>{option.display}</option>
                ))
              }
            </select>

            );
          } else {
            return this.renderInput(false);;
          }
        } else {
          return this.renderInput(false);;
        }
    }
  }

  loadConcepts(searchValue) {
    let url = '/concept'
    url = searchValue ? `${url}?v=full&q=${searchValue}`
      : `${url}/${this.state.obs.conceptUuid}?v=full`;
    let allConcepts = [];
    apiCall(null, 'get', url)
      .then((res) => {
        if (res.results) {
          if (res.results.length > 0) {
            allConcepts = res.results.map(concept => {
              const description = concept.descriptions.filter(des => des.locale == 'en' ? des.description : '');
              const conceptData = {
                uuid: concept.uuid,
                units: concept.units || '',
                answers: concept.answers,
                hl7Abbrev: concept.datatype.hl7Abbreviation,
                name: concept.name.name,
                description: description.length > 0 ? description[0].description : 'no description available',
                datatype: concept.datatype
              };
              return conceptData;
            });
          }
          this.setState(Object.assign({}, this.state, { conceptOptions: allConcepts }));
        } else {
          if (res) {
            const conceptData = {
              uuid: res.uuid,
              units: res.units || '',
              answers: res.answers,
              hl7Abbrev: res.datatype.hl7Abbreviation,
              name: res.name.name,
              datatype: res.datatype
            };
            this.setState(Object.assign({}, this.state, { selectedConceptData: conceptData }));
          }
        }
      })
      .catch((err) => {
        toastr.error(err);
      });
  }

  update() {
    if (Object.keys(this.state.editValues).length > 0) {
      apiCall(this.state.editValues, 'post', `obs/${this.state.uuid}`)
        .then((response) => {
          if (response.error) {
            const err = response.error.message ? response.error.message : response.error;
            toastr.error(err);
          } else {
            toastr.options.closeButton = true;
            toastr.success('Observation updated successfully');
            let patientId = this.props.params.patentId;
            let encounterId = this.props.params.encounterId;
            let obsId = response.uuid
            patientId = patientId.trim();
            encounterId = encounterId.trim();
            obsId = obsId.trim()
            this.props.router.push(`/patient/${patientId}/encounter/${encounterId}/obs/${obsId}`);
          }

        })
        .catch((error) => {
          toastr.error(error);
        });
    } else {
      toastr.options.closeButton = true;
      toastr.info('Nothing to update');
    }
  }

  render() {
    return (
      <div>
        {
          <div className="modal fade" id="myModal" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                  <h4 className="modal-title">Confirm Delete</h4>
                </div>
                <div className="modal-body">
                  <p> Are you sure you want to Delete this Observation?</p>
                </div>
                <div className="modal-footer">
                  <div className="col-sm-6">
                    <button
                      type="button" className="btn btn-success form-control"
                      onClick={this.delete}
                      data-dismiss="modal"
                    >
                      Confirm
                  </button>
                  </div>
                  <div className="col-sm-6">
                    <button
                      type="button" className="btn btn-danger form-control cancelBtn"
                      data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        <div className="section top">
          <div className="col-sm-12 section search">
            <div className="form-group">
              <div className="col-sm-1">
              </div>
              <div className="col-sm-1">
              </div>
            </div>
            <p />
            <div>
              <h3>Observation</h3>
              <form className="form-horizontal">
                <div className="form-group ">
                  <label className="control-label col-sm-3">Person:</label>
                  <div className="col-sm-8">
                    <input type="text" disabled
                      className="form-control bootstrap-typeahead-input-main"
                      value={this.state.obs.person}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Encounter:</label>
                  <label className="control-label col-sm-8 custom-label encounter-label pointer"
                    onClick={this.goToEncounter}>
                    {this.state.obs.encounter}
                  </label>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Order:</label>
                  <div className="col-sm-8">
                    <input type="text" disabled={true}
                      name="order"
                      className="form-control bootstrap-typeahead-input-main"
                      value={this.state.obs.order}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Location:</label>
                  <div className="col-sm-8">
                    <select
                      className="form-control"
                      name="location"
                      onChange={this.handleChange}
                    >
                      {
                        this.state.locations.map((location, key) => (
                          <option selected={location.display === this.state.obs.location ? true : false}
                            value={location.uuid}>{location.display}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Observation Date:</label>
                  <div className="col-sm-8">
                    <DatePicker
                      dateFormat="DD-MM-YYYY"
                      disabled
                      className="form-control"
                      showClearButton={false}
                      name="obsdate"
                      value={this.state.obs.obsdate}
                      onInvalid={this.handleInvalidDate}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Concept Question:</label>
                  <div className="col-sm-8">
                    <AsyncTypeahead
                      ref="typeahead"
                      name="concept"
                      labelKey="name"
                      className="form-control bootstrap-typeahead-input-main"
                      options={this.state.conceptOptions}
                      onSearch={this.loadConcepts}
                      selected={this.state.conceptSelected}
                      onChange={this.conceptOnChange}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Answer Concept:</label>
                  <div className="col-sm-8">
                    {this.renderValue()}
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Comment:</label>
                  <div className="col-sm-8">
                    <textarea type="text"
                      onChange={this.handleChange}
                      name="comment"
                      className="form-control bootstrap-typeahead-input-main"
                      value={this.state.obs.comment}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-sm-offset-3 col-sm-3">
                    <button type="button" name="update" onClick={this.update}
                      className="btn btn-success form-control">Update</button>
                  </div>
                  <div className="col-sm-3">
                    <button type="button" name="delete" data-toggle="modal"
                      data-target="#myModal" className="btn btn-default form-control cancelBtn">
                      Delete
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
