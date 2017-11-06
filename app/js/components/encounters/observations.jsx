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
      observations: [],
      encounterType: undefined,
      deletedChecked: false,
    };
    this.showDeletedObs = this.showDeletedObs.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { obs, encounterType } = nextProps.stateData.encounterData;
    this.setState({
      observations: nextProps.stateData.observations,
      encounterType
    })
  }

  showDeletedObs() {
    this.setState({
      deletedChecked: !this.state.deletedChecked
    })
  }

  render() {
    const { observations, encounterType, deletedChecked } = this.state;
    const encounterVoided = this.props.stateData.encounterData.voided;
    const filteredObs = observations && observations.filter((observation) => {
      if (deletedChecked) {
        return observation;
      } else {
        return !observation.voided;
      }
    });
    const isGroupMember = observation => !observation.obsGroup && observation.groupMember;
    const visitNoteObs = filteredObs.reduce((observations, nextObs) => {
      if (isGroupMember(nextObs)) {
        if (!observations[nextObs.uuid]) {
          observations[nextObs.uuid] = nextObs
          observations[nextObs.uuid].groupMembers = {}
        }
        return observations;
      }

      if (nextObs.obsGroup) {
        const parentUuid = nextObs.obsGroup.uuid
        if (observations[parentUuid]) {
          observations[parentUuid].groupMembers[nextObs.uuid] = nextObs
        } else {
          observations[parentUuid] = nextObs.obsGroup
          observations[parentUuid].groupMembers = { [nextObs.uuid]: nextObs };
        }
      }
      return observations;
    }, {});

    const visitNoteObsArray = Object.values(visitNoteObs);
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
            checked={this.state.deletedChecked}
            onChange={this.showDeletedObs}
            disabled={encounterVoided}
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
                filteredObs && filteredObs.length > 0 &&
                filteredObs.map((observation) => (
                  <tr className={(observation.voided) ? 'deletedObs' : ''}>
                    <a>
                      <td
                        onClick={
                          () => {
                            this.props.handleObservationClick(observation.uuid);
                          }}
                      >{observation.concept.display}
                      </td>
                    </a>
                    <td>{observation.value}</td>
                    <td>{new Date(observation.obsDatetime).toString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          :
          <div id="accordion" role="tablist" aria-multiselectable="true">
            {
              visitNoteObsArray &&
              visitNoteObsArray.length > 0 &&
              visitNoteObsArray.map((observation, index) => {
                const groupMembersArray = Object.values(observation.groupMembers);
                return (
                  <div className="card" >
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
                          {observation.display}{' '}
                        </a>
                        {new Date(observation.obsDatetime).toString()}
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
                            {
                              groupMembersArray.map(observation => {
                                return (
                                  <tr className={(observation.voided) ? 'deletedObs' : ''} key={observation.uuid}>
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
                                )
                              })
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              }
              )
            }
          </div>
        }
      </div>
    );
  }
}
