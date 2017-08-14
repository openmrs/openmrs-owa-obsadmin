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
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import ReactTable from 'react-table'
import "react-table/react-table.css";

import apiCall from '../utilities/apiHelper';

/**
 * Represents the landing page with patient search feature
 * 
 * @class Search
 * @extends {React.Component}
 */
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patients: [],
      searchTerm: '',
      uuid: '',
    }
    this.search = this.search.bind(this);
  }

  /**
   * Peforms the real search for patient
   * 
   * @param {any} e 
   * 
   * @memberOf Search
   */
  search(e) {
    const searchValue = e.target.value.toLowerCase();
    this.setState({searchTerm: searchValue});
    apiCall(null, 'get', `/patient?q=${searchValue}&v=custom:(person)`).then((response) => {
      this.setState({patients: response.results});
    }); 
  }

  /**
   * Renders the component
   * 
   * @memberOf Search
   */
  render() {
    const columns = [{
        id: 'patientname',
        Header: 'Name',
        accessor: d => d.person.display
      }, {
        id: 'gender',
        Header: 'Gender',
        accessor: d => d.person.gender
      }, {
        id: 'age',
        Header: 'Age',
        accessor: d => d.person.age
      }, {
        id: 'uuid',
        Header: 'UUID',
        accessor: d => d.person.uuid
      }];

    return (
      <div>
        <div className="section top">
          <div className="col-sm-12 section search">                   
            <div className="col-sm-6 col-sm-offset-3 custom-typehead">  
              <input type="text"
              className="form-control bootstrap-typeahead-input-main"
              onChange={this.search} placeholder="Search Patient" />
            </div>
          </div>
        </div>

        <div className="section top">
          <div className="col-sm-12 section search">
            <h3>Search result </h3>  
            <span className="spanable">Sort table by clicking on the header.
              Resize by dragging column.
              Click on a patient to view.</span> 
              <p/>            
            <ReactTable
              className="-striped -highlight"
              data={this.state.patients}
              columns={columns}
              noDataText='No patient found'
              showPageSizeOptions={false}
              getTdProps={(state, rowInfo, column, instance) => {
                return {
                  onClick: (e, handleOriginal) => {
                    if(rowInfo){
                      this.setState({uuid: rowInfo.row.uuid});
                      this.props.router.push(`/patient/${rowInfo.row.uuid}`,);
                      if (handleOriginal) {
                        handleOriginal()
                      }                      
                    }
                  }
                }
              }}
            />
          </div>
        </div>

      </div>
    );
  }
}
