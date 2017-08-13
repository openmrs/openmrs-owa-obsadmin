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