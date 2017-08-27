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
  handleSave(e) {
    e.preventDefault();
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
        if (res.error){
        toastr.error(res.error.message)
    }
    else{
        toastr.success("Demographics Updated")
    }
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
            <form className="form-horizontal" onSubmit={this.handleSave}>
                <div className="form-group">
                        <label className="control-label col-sm-2">Gender</label>
                        <div className="col-sm-5">
                            <label className="radio-inline">
                                <input type="radio" id="inlineRadio1" value="option1"name="male" type="radio" value="M" checked={this.state.gender === "M"} onChange={this.setGender}/> Male
                            </label>
                            <label className="radio-inline">
                                <input type="radio" id="inlineRadio2" value="option2" name="female" type="radio" value="F" checked={this.state.gender === "F"} onChange={this.setGender}/> Female
                            </label>
                        </div>
                </div>

                <div className="form-group ">
                    <label className="control-label col-sm-2">Birth Date</label>
                    <div className="col-sm-5">
                        <DatePicker
                            dateFormat="DD-MM-YYYY"
                            className="form-control"
                            name="birthdate"
                            value={this.state.birthdate} onChange={this.handleTimeChange('birthdate')}/>
                    </div>
                    <label className="control-label col-sm-2"> Estimated </label>
                    <div className="col-sm-2">
                        <input
                            name="estimates"
                            type="checkbox"
                            defaultChecked={this.state.birthDateEstimated}
                            onChange={this.setBirthDateEstimate}/>
                    </div>
                </div>

                <div className="form-group">
                    <label className="control-label col-sm-2"> Deceased </label>
                    <div className="col-sm-2">
                        <input
                            name="deceased"
                            type="checkbox"
                            checked={this.state.deceased}
                            onChange={this.onDeceased}/>
                    </div>
                </div>

                {this.state.deceased &&
                <div>
                <div className="form-group">
                    <label className="control-label col-sm-2"> Death Date </label>
                    <div className="col-sm-5">
                        <DatePicker
                            dateFormat="DD-MM-YYYY"
                            className="form-control"
                            name="deathDate"
                            type="text"
                            value={this.state.deathDate}
                            onChange={this.handleTimeChange('deathDate')}/>
                    </div>
                    <label className="control-label col-sm-2"> Estimated </label>
                    <div className="col-sm-2">
                        <input
                            name="estimated"
                            type="checkbox"
                            value={this.state.deathDateEstimated}/>
                    </div>
                </div>

                <div className="form-group">
                    <label className="control-label col-sm-2"> Cause of death </label>
                    <div className="col-sm-5">
                        <select className= "form-control" onChange={this.handleChange} name="nameOfCauseOfDeath" value={this.state.nameOfCauseOfDeath}>
                          {
                            this.state.causeOfDeath.map((cause) => (
                              <option value={cause.uuid}>{cause.display}</option>

                            ))
                          }
                        </select>
                    </div>
                </div>
                </div>
                }

                <div className="form-group">
                    <label className="control-label col-sm-2"> Created By </label>
                    <div className="col-sm-5">
                        <input
                            className="form-control"
                            disabled={true}
                            name="created-by"
                            type="text"
                            value={this.state.createdBy + ' ' + this.state.dateCreated}/>
                    </div>
                </div>

                <div className="form-group">
                    <label className="control-label col-sm-2"> Deleted </label>
                    <div className="col-sm-2">
                        <input
                            className="form-control"
                            disabled
                            name="deleted"
                            type="text"
                            value={this.state.deleted}/>
                    </div>
                </div>
                <div className="form-group">
                    <label className="control-label col-sm-1"> </label>
                    <div className="control-label col-sm-2">
                        <button
                            type="submit"
                            onClick={this.handleSave}
                            className="btn btn-success form-control">
                            Save</button>
                    </div>
                </div>
        </form>
      </div>
    )
  }
}
