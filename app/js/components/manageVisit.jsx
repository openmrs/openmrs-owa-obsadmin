/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import toastr from 'toastr';
import moment from 'moment';
import apiCall from '../utilities/apiHelper';
import DateTimeField from 'react-bootstrap-datetimepicker';
import { Button, Form, FormGroup, Label, Input, FormText, Table, ListGroup, ListGroupItem } from 'reactstrap';
import { withRouter } from 'react-router'

const getSuggestionValue = suggestion => suggestion.name;

export class ManageVisit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: this.props.params.patentId,
      visituuid: this.props.params.visitId,
      display: '',
      location: [],
      locationName: '',
      patientName: '',
      format: "YYYY-MM-DD HH:mm:ss",
      inputFormat: "YYYY-MM-DD HH:mm:ss",
      mode: "date",
      startDatetime: '',
      finalStartTime: '',
      finalStopDatetime: '',
      stopDatetime: '',
      visitType: [],
      visitTypeName: '',
      voided: false,
      encounters: [],
      patients: [],
      searchTerm: 'm',
      errorName: ''
    };
    this.handleEncounterClick = this.handleEncounterClick.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleChange = this.handleChange.bind(this)
    this.handleSave = this.handleSave.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.goHome = this.goHome.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    if (this.state.uuid !== this.props.params.patentId) {
      this.setState({
        uuid: this.props.params.patentId
      })

    }
  }

  componentDidMount() {
    apiCall(null, 'get', `/visit/${this.state.visituuid}`)
      .then((res) => {
        const { display, encounters, location, patient, startDatetime: time, stopDatetime: time2, visitType, voided } = res
        const locationName = location.display
        const patientName = patient.display
        const visitTypeName = visitType.display
        const startDatetime = moment(time).format('YYYY-MM-DD HH:mm:ss')
        const finalStartTime = moment(startDatetime).format('YYYY-MM-DDTHH:mm:ss.000Z')
        const stopDatetime = moment(time2).format('YYYY-MM-DD HH:mm:ss')
        const finalStopDatetime = moment(stopDatetime).format('YYYY-MM-DDTHH:mm:ss.000Z')

        this.setState((prevState) => {
          return { display, locationName, encounters, patientName, startDatetime, finalStartTime, finalStopDatetime, stopDatetime, visitTypeName, voided }
        });
      })
      .catch(error => toastr.error(error));
    apiCall(null, 'get', `location`)
      .then((res) => {
        this.setState({
          location: res.results
        })
      })
    apiCall(null, 'get', `visittype`)
      .then((res) => {
        this.setState({
          visitType: res.results
        })
      })
  }
  handleEncounterClick(encounteruuid) {
    this.props.router.push(`/patient/${this.state.uuid}/encounter/${encounteruuid}`)
  }
  handleTimeChange(name) {
    return dateTime => {
      this.setState({
        [name]: dateTime

      });
    }
  }
  handleChange(event) {
    const { name, value } = event.target;
    event.preventDefault();
    this.setState({ [name]: value });
  }
  handleSave(event) {
    event.preventDefault();
    this.setState({
      errorName: ''
    })
    let error = false
    const { startDatetime, stopDatetime, locationName, visitTypeName, finalStopDatetime, finalStartTime } = this.state;
    if (finalStopDatetime < finalStartTime) {
      error = true
      this.setState({
        errorName: "Start date cannot be greater than Stop date"
      })

    }
    if (!error) {
      apiCall(
        {
          "startDatetime": finalStartTime,
          "stopDatetime": finalStopDatetime,
          "location": locationName,
          "visitType": visitTypeName

        }, 'post', `/visit/${this.state.visituuid}`,

      ).then((res) => {
        toastr.success('Saved!')
      });

    }
  }
  handleDelete() {
    apiCall(null, 'delete', `/visit/${this.state.visituuid}`)
      .then((res) => {
        this.props.router.push(`/patient/${this.props.params.patentId}`);
      });
  }
  goHome() {
    this.props.router.push("/");
  }

  render() {
    const { searchTerm, patients } = this.state;
    let editErrorClass = '';
    let editError = '';
    if (this.state.errorName !== '') {
      editErrorClass = 'has-error';
      editError = this.state.errorName;
    }
    return (
      <div className="section top">
        <header className="encounter-header">
          Manage Visit
        </header>
        {this.state.voided &&
          <div id="background">
            <p id="bg-text">SOFT DELETED</p>
          </div>
        }
        <form style={{ width: "" }} className="form-horizontal">
          <div className="form-group ">
          </div>
          <div className="form-group ">
            <label className="control-label col-sm-2"> Visit</label>
            <div className="col-sm-6">
              <input className="form-control"
                disabled={true}
                name="display"
                type="text"
                value={this.state.display}
                onChange={this.handleChange}
              />
            </div>
          </div>

          <div className="form-group ">
            <label className="control-label col-sm-2">Patient Name </label>
            <div className="col-sm-6">
              <input className="form-control"
                name="patientName"
                type="text"
                disabled={true}
                value={this.state.patientName}
                onChange={this.handleChange}
              />
            </div>
          </div>

          <div className="form-group ">
            <label className="control-label col-sm-2"> Location </label>
            <div className="col-sm-6">
              <select className="col-sm-6 form-control" name="locationName" value={this.state.locationName} onChange={this.handleChange}>
                {
                  this.state.location.map((onelocation) => (
                    <option >{onelocation.display}</option>

                  ))
                }
              </select>
            </div>
          </div>
          <div className="form-group ">
            <div className={editError.includes('Start') ? editErrorClass : ''}>
              <label className="control-label col-sm-2"> Start Date </label>
              <div className="col-sm-6">
                <DateTimeField
                  inputProps={{ disabled: true }}
                  className="form-control"
                  name="finalStartTime"
                  format={this.state.format}
                  inputFormat={this.state.inputFormat}
                  dateTime={this.state.startDatetime} onChange={this.handleTimeChange('finalStartTime')}
                />
                {(editError.includes("Start")) &&
                  <div className="input">{editError}</div>}
              </div>
            </div>

          </div>
          <div className="form-group ">
            <label className="control-label col-sm-2"> Stop Date </label>
            <div className="col-sm-6">
              <DateTimeField
                className="form-control"
                inputProps={{ disabled: true }}
                name="finalStopDatetime"
                format={this.state.format}
                inputFormat={this.state.inputFormat}
                dateTime={this.state.stopDatetime} onChange={this.handleTimeChange('finalStopDatetime')}
              />
            </div>

          </div>
          <div className="form-group ">
            <label className="control-label col-sm-2"> Visit Type </label>
            <div className="col-sm-6">
              <select className="col-sm-6 form-control" name="visitTypeName" value={this.state.visitTypeName} onChange={this.handleChange}>
                {
                  this.state.visitType.map((namedVisitType) => (
                    <option >{namedVisitType.display}</option>

                  ))
                }

              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="control-label col-sm-2"></label>
            <div className="col-sm-2">
              <button type="submit"
                name="update"
                onClick={this.handleSave}
                className="btn btn-success form-control">
                Save</button>
            </div>
            <div className="col-sm-2">
              <button type="button"
                name="cancel"
                onClick={this.handleDelete}
                className="btn btn-danger form-control cancelBtn">
                Delete</button>
            </div>
          </div>
        </form>
        <header className="encounter-header">
          Encounters
            </header>
        <ListGroup id="custom-a-tag">
          {
            this.state.encounters.map((encounter) => (
              <a><ListGroupItem onClick={() => this.handleEncounterClick(encounter.uuid)} value={encounter.uuid}>{encounter.display}</ListGroupItem></a>

            ))
          }
        </ListGroup>
      </div>
    )
  }
}
export default withRouter(ManageVisit);
