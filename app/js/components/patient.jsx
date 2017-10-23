/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import Collapsible from 'react-collapsible';
import apiCall from '../utilities/apiHelper';
import Addresses from './addresses'
import Demographics from './demographics';
import VisitsAndEncounters from './visitsAndEncounters'
//import your collapsible component here
import Name from './names'
import Identifiers from './identifiers/identifiers';
/**
 * Represents the Patient.
 * Used in managing patient data
 *
 * @class Patient
 * @extends {React.Component}
 */
export default class Patient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patient: [],
      uuid: null,
    }
    this.goHome = this.goHome.bind(this);
    this.updateName = this.updateName.bind(this);
    this.reload = this.reload.bind(this);
  }

  /**
   *
   * Loads pantient data and store in the state
   *
   * @memberOf Patient
   */
  componentDidMount() {
    this.state.uuid = this.props.params.id;
    if (this.state.uuid) {
      this.reload();
    } else {
      goHome()
    }
  }
  /**
   *
   * Pushes location backwards.
   */
  goHome() {
    this.props.router.push("/");
  }
  /**
   *
   * make API call to get the values then set to state
   */
  reload() {
    apiCall(null, 'get', `/patient/${this.state.uuid}?v=full`).then((response) => {
      this.setState({ patient: response });
    });
  }

  /**
   *
   * updates the patients name being displayed.
   */
  updateName() {
    this.reload();
  };

  /**
   * Renders the component
   *
   * @memberOf Patient
   */
  render() {
    return (
      <div>
        <div className="section top">
          <div className="col-sm-12 section search">
            <header className="patient-header">
              Patient: {this.state.patient.display}
            </header>
            <form className="form-horizontal">          
              <div className="form-group">
                <div className="control-label col-sm-2">
                <Name uuid={this.props.params.id} newName={this.updateName} /> 
                </div>
              <div className="control-label">
                <Demographics uuid={this.props.params.id} />   
              </div>
              </div>
            </form>
            <Identifiers uuid={this.props.params.id} />        
            <Addresses patient={this.state.patient}
              uuid={this.state.uuid || this.props.params.id} />             
            <VisitsAndEncounters uuid={this.props.params.id} />              
          </div>
        </div>
      </div>
    );
  }
}
