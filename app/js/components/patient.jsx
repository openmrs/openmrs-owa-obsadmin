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
//import your collapsible component here
import Name from './names'
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
  }

  /**
   *
   * Loads pantient data and store in the state
   *
   * @memberOf Patient
   */
  componentDidMount(){
    this.state.uuid = this.props.params.id;
    if(this.state.uuid){
      apiCall(null, 'get', `/patient/${this.state.uuid}?v=full`).then((response) => {
        this.setState({patient: response});
      });
    } else {
      goHome()
    }
  }
  /**
   *
   * Pushes location backwards.
   */
  goHome(){
    this.props.router.push("/");
  }

  /**
   * Renders the component
   *
   * @memberOf Patient
   */
  render(){
    return (
      <div>
        <div className="section top">
          <div className="col-sm-12 section search">
          <span onClick={this.goHome} className="glyphicon glyphicon-home glyphicon-updated breadcrumb-item"
            aria-hidden="true">Back</span>
            <header className="patient-header">
              Patient: {this.state.patient.display}
            </header>
            <div className="collapsible-header-top"></div>
            <Collapsible open={true} trigger="Identifiers" triggerOpenedClassName="CustomTriggerCSS--open">
              <p>While connecting your component, pass props to it as well, check comment for example </p>
              {/** <componentName uuid={this.state.uuid} patient={this.state.patient} */}
              <p>This is the collapsible content. It can be any element or React component you like.</p>
              <p>It can even be another Collapsible component. Check out the next section!</p>
              <p>This is the collapsible content. It can be any element or React component you like.</p>
              <p>It can even be another Collapsible component. Check out the next section!</p>
              <p>This is the collapsible content. It can be any element or React component you like.</p>
              <p>It can even be another Collapsible component. Check out the next section!</p>
            </Collapsible>
            <Collapsible triggerOpenedClassName="CustomTriggerCSS--open"
            trigger="Names">
              <Name uuid={this.props.params.id} />
            </Collapsible>
            <Collapsible trigger="Addresses" triggerOpenedClassName="CustomTriggerCSS--open">
              <Addresses patient={this.state.patient}
              uuid={this.state.uuid || this.props.params.id} />
            </Collapsible>
            <Collapsible trigger="Demographics" triggerOpenedClassName="CustomTriggerCSS--open">
              <p>This is the collapsible content. It can be any element or React component you like.</p>
              <p>It can even be another Collapsible component. Check out the next section!</p>
            </Collapsible>
            <Collapsible trigger="Vists & Encounters" triggerOpenedClassName="CustomTriggerCSS--open">
              <p>This is the collapsible content. It can be any element or React component you like.</p>
              <p>It can even be another Collapsible component. Check out the next section!</p>
            </Collapsible>
          </div>
        </div>
      </div>
    );
  }
}
