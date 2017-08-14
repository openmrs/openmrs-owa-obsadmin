/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';

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
      patients: [],
      searchTerm: '',
      uuid: '',
    }
    this.goHome = this.goHome.bind(this);
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
            <h3>Patient: {/*temporaly use for demo*/ this.props.params.id} </h3>  
          </div>
        </div>
      </div>
    );
  }
}