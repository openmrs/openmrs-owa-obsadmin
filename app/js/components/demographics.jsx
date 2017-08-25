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
import DatePicker from "react-bootstrap-date-picker";
import toastr from 'toastr'

export default class Demographics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: null,
      gender: '',
      birthdate: '',
      birthDateEstimated: false,
      deceased: false,
      deathDate: '',
      deathDateEstimated: false,
      causeOfDeath: [],
      nameOfCauseOfDeath: '',
      createdBy: '',
      dateCreated: '',
      deleted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.onDeceased = this.onDeceased.bind(this);
    this.setGender = this.setGender.bind(this);
    this.setBirthDateEstimate = this.setBirthDateEstimate.bind(this);
    this.setDeathDateEstimate = this.setDeathDateEstimate.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
  }

  /**
   * 
   * set to state patient attributes
   * 
   * @memberOf Demographics
   */
  componentWillMount() {
    this.state.uuid = this.props.uuid;
    apiCall(null,'get',`/patient/${this.state.uuid}?v=full`)
      .then((res) => {
        const { auditInfo, gender, birthdate, birthDateEstimated, dead: deceased, causeOfDeath, deathDate, deathDateEstimated, voided: deleted } = res.person
        const { display: createdBy } = auditInfo.creator
        const dateCreated = auditInfo.dateCreated
        const nameOfCauseOfDeath = causeOfDeath && causeOfDeath.uuid

        this.setState(
          { gender, birthdate, birthDateEstimated, deceased, deathDate, nameOfCauseOfDeath, createdBy, dateCreated, deleted }
        )
      })

  /**
   * 
   * make API call to get the values then set to state
   * 
   * @memberOf Demographics
   */
    apiCall(null,'get','/concept')
      .then((res) => {
        this.setState({
          causeOfDeath: res.results
        })
      })
  }
    /**
   * 
   * set to state the array of concepts
   * 
   * @memberOf Demographics
   */

  handleChange(event) {
    const { name, value } = event.target;
    event.preventDefault();
    if(name === 'nameOfCauseOfDeath'){
      this.setState({ nameOfCauseOfDeath: value });
    }
    this.setState({ [name]: value });
  }

  handleTimeChange(name) {
    return value => {
      this.setState({
        [name]: value // ISO String, ex: "2016-11-19T12:00:00.000Z" 
        
      });
    }
  }
  onDeceased(e) {
    this.setState({ deceased: !this.state.deceased })
  }
  setGender(e) {
    this.setState({ gender: e.target.value })

  }
  setBirthDateEstimate(e) {
    this.setState({ birthDateEstimated: !this.state.birthDateEstimated })
  }
  setDeathDateEstimate(e) {
    this.setState({ deathDateEstimated: !this.state.deathDateEstimated })
  }
  handleSave() {
    const { gender, birthdate, birthDateEstimated, nameOfCauseOfDeath, deceased, deathDate, deathDateEstimated } = this.state;
    apiCall(
      {
        "birthdate": birthdate,
        "birthdateEstimated": birthDateEstimated,
        "causeOfDeath": nameOfCauseOfDeath,
        "dead": deceased,
        "deathDate": deathDate,
        "deathdateEstimated": deathDateEstimated,
        "gender": gender

      },'post',`/person/${this.state.uuid}`,

    ).then((res) => {
      toastr.error(res.error.message)
    });
  }
    /**
   * 
   * post to the end point values of attribute stored in state after editing
   * 
   * @memberOf Demographics
   */

  render() {
        /**
   * 
   * Render patient attributes
   * 
   * @memberOf Demographics
   */
    return (
      <div>
        <form>
          <div className="form-row">
            <label className="col-sm-2 col-form-label">Gender</label>
            <div className="form-group col-sm-10">
                <label className="radio-inline">
                  <input type="radio" id="inlineRadio1" value="option1"name="male" type="radio" value="M" checked={this.state.gender === "M"} onChange={this.setGender}/> Male
                </label>
                <label className="radio-inline">
                    <input type="radio" id="inlineRadio2" value="option2" name="female" type="radio" value="F" checked={this.state.gender === "F"} onChange={this.setGender}/> Female
                </label>
              </div>
          </div>

          <div className="form-row">
                <div className="col-md-4">
                    <label className="col-form-label">Birth Date</label>
                    <DatePicker
                        dateFormat="DD-MM-YYYY"
                        className="form-control"
                        name="birthdate"
                        value={this.state.birthdate} onChange={this.handleTimeChange('birthdate')}
                    />
                </div>
                <div className="col-sm-8">
                  <label className="col-form-label"> Estimated </label>
                    <input
                      name="estimates"
                      type="checkbox"
                      className="form-control"
                      defaultChecked={this.state.birthDateEstimated}
                      onChange={this.setBirthDateEstimate} 
                    />
                </div>
          </div>
          
          <div className="form-group">
            <label className="col-form-label"> Deceased </label>
            <input
              className="form-control"
              name="deceased"
              type="checkbox"
              checked={this.state.deceased}
              onChange={this.onDeceased}
            
            />
          </div>
          
          {this.state.deceased &&
            <div className="form-row">
              <div className="form-group col-sm-4">
                <label className="col-form-label"> Death Date </label>
                        <DatePicker
                            dateFormat="DD-MM-YYYY"
                            className="form-control"
                            name="deathDate"
                  type="text"
                  value={this.state.deathDate}
                  onChange={this.handleTimeChange('deathDate')}
                        />
              </div>
              <div className="form-group col-sm-4">
                  <label className="col-form-label"> Estimated </label>
                  <input
                    className="form-control"
                    name="estimated"
                    type="checkbox"
                    value={this.state.deathDateEstimated}
                  />
              </div>
              <div className="form-group col-sm-4">
                <label className="col-form-label"> Cause of death </label>
                <select className= "form-control" onChange={this.handleChange} name="nameOfCauseOfDeath" value={this.state.nameOfCauseOfDeath}>
                  {
                    this.state.causeOfDeath.map((cause) => (
                      <option value={cause.uuid}>{cause.display}</option>

                    ))
                  }
                </select>
              </div>
            </div>
          }
           <div className="form-row">
          <div className="form-group col-sm-6">
            <label className="col-sm-12 col-form-label"> Created By </label>
            <div className="form-group col-sm-6">
              <input
              disabled={true}
                className="form-control"
                name="created-by"
                type="text"
                value={this.state.createdBy}
              />
            </div>
            <div className="form-group col-sm-6">
                <DatePicker
                  disabled={true}
                  display="view" 
                  dateFormat="DD-MM-YYYY"
                  className="form-control"
                  name="dateCreated"
                  type="text"
                  value={this.state.dateCreated}

                        />
              </div>
          </div>
          </div>
          
          
          <div className="form-group">
             <div className="form-group col-sm-12">
            <label className="col-form-label"> Deleted </label>
            <input
              className="form-control col-sm-6"
              disabled
              name="deleted"
              type="text"
              value={this.state.deleted}
            />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-sm-12">
            <button onClick={this.handleSave}>Save</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
