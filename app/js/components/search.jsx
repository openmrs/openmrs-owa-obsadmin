/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
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
        id: 'dead',
        Header: 'Dead',
        accessor: d => d.person.dead,
        Cell: props => {return props.value === false ? 'No' : 'Yes'}
      }, {
        id: 'uuid',
        Header: 'UUID',
        accessor: d => d.person.uuid,
        show: false
      }];

    return (
      <div>
        <div className="section top">
          <div className="col-sm-12 section search">
            <div className="col-sm-6 col-sm-offset-3 custom-typehead">
              <input type="text"
              ref = "search"
              className="form-control bootstrap-typeahead-input-main"
              onChange={this.search} placeholder="Search for patient by typing at least 2 letters of the name" />
            </div>
          </div>
        </div>

        <div className="section top">
          <div className="col-sm-12 section search">
            {this.state.patients.length > 0 ?
              <div>
                <h3>Search result </h3>
              <ReactTable
                className="-striped -highlight"
                data={this.state.patients}
                pageSize= {this.state.patients.length}
                columns={columns}
                noDataText='No patient found'
                showPageSizeOptions={false}
                getTdProps={(state, rowInfo, column, instance) => {
                  return {
                    onClick: (e, handleOriginal) => {
                      if(rowInfo){
                        this.setState({uuid: rowInfo.row.uuid});
                        this.props.router.push(`/patient/${rowInfo.row.uuid}`);
                        if (handleOriginal) {
                          handleOriginal()
                        }
                      }
                    }
                  }
                }}
              />
              </div>
            : this.state.searchTerm.length > 1 ? 'No Results Found' : ''
            }
          </div>
        </div>

      </div>
    );
  }
}
