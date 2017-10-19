/* This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import PropTypes from 'react-proptypes';
import { Collapse, Button } from 'reactstrap';

export default class Observations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      voidedObs: [],
      unVoidedObs: [],
      observations: [],
      encounterType: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { obs, encounterType } = nextProps.stateData.encounterData;
    const voidedObs = [];
    const unVoidedObs = [];
    this.setState({
      observations: nextProps.stateData.encounterData.obs,
      encounterType
    }, () => {
      this.state.observations && this.state.observations.map(observation => (
        (observation.voided) ? voidedObs.push(observation)
          : unVoidedObs.push(observation)
      ));
      this.setState({
        voidedObs,
        unVoidedObs
      })
    });
  }

  render() {
    const { voidedObs, unVoidedObs, encounterType } = this.state;
    return (
      <div className="observation">
        <header className="encounter-header">
          Observations
        </header>

        <span id="show-deleted">
          <input
            name="voided"
            className="form-check-input"
            type="checkbox"
          /> Show Deleted
        </span>

        {(encounterType && encounterType.display !== "Visit Note") ?
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Question Concept</th>
                <th>Value</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {
                unVoidedObs && unVoidedObs.length > 0 &&
                unVoidedObs.map((ob) => (
                  <tr>
                    <a>
                      <td
                        onClick={
                          () => {
                            this.props.handleObservationClick(ob.uuid);
                          }}
                      >{ob.concept.display}
                      </td>
                    </a>
                    <td>{ob.value}</td>
                    <td>{new Date(ob.obsDatetime).toString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          :
          <div id="accordion" role="tablist" aria-multiselectable="true">
            {
              unVoidedObs && unVoidedObs.length > 0 &&
              unVoidedObs.map((ob, index) => (
                ob.groupMembers !== null &&
                <div className="card">
                  <div
                    className="card-header"
                    role="tab"
                    id={`heading${index}`}
                  >
                    <h5 className="mb-0">
                      <a
                        data-toggle="collapse"
                        data-parent="#accordion"
                        href={`#collapse${index}`}
                        aria-expanded="true"
                        aria-controls={`collapse${index}`} >
                        {ob.display}{' '}
                      </a>
                      {new Date(ob.obsDatetime).toString()}
                    </h5>
                  </div>

                  <div
                    id={`collapse${index}`}
                    className="collapse"
                    role="tabpanel"
                    aria-labelledby={`heading${index}`}
                    data-parent="#accordion"
                  >
                    <div className="card-block">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Question Concept</th>
                            <th>Value</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(ob.groupMembers.map(observation => (
                            <tr key={observation.uuid}>
                              <a>
                                <td
                                  onClick={
                                    () => {
                                      this.props.handleObservationClick(observation.uuid);
                                    }}
                                >{observation.concept.display}
                                </td>
                              </a>
                              <td>{observation.value.display}</td>
                              <td>{new Date(observation.obsDatetime).toString()}</td>
                            </tr>
                          )))
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        }
      </div>
    );
  }
}
