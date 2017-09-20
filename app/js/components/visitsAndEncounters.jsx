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
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, Table } from 'reactstrap';
import classnames from 'classnames';
import { withRouter } from 'react-router'

class VisitsAndEncounters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: this.props.uuid,
      visits: [],
      encounters: {},
      showEncounters: {
      },
      encounterSource: "visit",
      encountersWithNoVisits: [],
      activeTab: '1'
    };

    this.handleVisitClick = this.handleVisitClick.bind(this)
    this.handleShowMore = this.handleShowMore.bind(this)
    this.handleData = this.handleData.bind(this)
    this.handleEncounterClick = this.handleEncounterClick.bind(this)
    this.handleEncountersWithNoVisits = this.handleEncountersWithNoVisits.bind(this)
    this.handleEncountersWithVisits = this.handleEncountersWithVisits.bind(this)
    this.toggle = this.toggle.bind(this);

  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.uuid !== this.props.uuid) {
      this.setState({
        uuid: this.props.uuid
      })

    }
  }

  componentDidMount() {
    apiCall(null, 'get', `/visit?patient=${this.state.uuid}`)
      .then((res) => {
        let visits = res.results;
        const getVisits = visits.map(visit => apiCall(null, 'get', `/visit/${visit.uuid}`))

        return Promise.all(getVisits).then(data => {
          this.setState({ visits: data, encounters: this.handleData(data) });
          return data;
        })
          .catch(error => toastr.error(error));
      })
      .catch(error => toastr.error(error));
  }

  handleData(data) {
    let encounters = {};
    data.forEach(visit => {
      encounters[visit.uuid] = visit.encounters;
    });
    return encounters;
  }

  handleVisitClick(visituuid) {
    this.props.router.push(`/patient/${this.state.uuid}/visit/${visituuid}`)
  }

  handleEncounterClick(encounteruuid) {
    this.props.router.push(`/patient/${this.state.uuid}/encounter/${encounteruuid}`)
  }

  handleShowMore(encounter, id) {
    this.setState(({ showEncounters }) => ({
      showEncounters: Object.assign({}, showEncounters, {
        [id]: {
          id,
          length: encounter.length,
          expanded: !this.state.expanded
        }
      }),
      
    })
    )
  }

  handleShowLess(encounter, id) {
    this.setState(({ showEncounters }) => ({
      showEncounters: Object.assign({}, showEncounters, {
        [id]: undefined
      }),
    }))
  }

  handleEncountersWithNoVisits() {
    apiCall(null, 'get', `/encounter?patient=${this.state.uuid}&v=full`)
      .then((res) => {
        let encountersArray = res.results
        const encountersWithoutVisits = encountersArray.map(encounter => {
          return !encounter.visit ? encounter : null
        }).filter(enc => { return enc })
        this.setState({
          encountersWithNoVisits: encountersWithoutVisits,
          encounterSource: "noVisits"
        })
      })
  }

  handleEncountersWithVisits() {
    this.setState({ encounterSource: "visit" });
  }

  render() {
    return (
      <div>
        <Nav tabs >
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Encounters With Visits
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Encounters Without Visits
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col sm="12">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Visit Type</th>
                      <th>Location</th>
                      <th>Start Date</th>
                      <th>Stop Date</th>
                      <th>Encounters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.visits.map((visit) => {
                      const showEncounter = this.state.showEncounters[visit.uuid]
                      const endIndex = showEncounter ? showEncounter.length : 3;
                      return (
                        <tr id="custom-a-tag" key={visit.uuid}>
                          <a><td name="visituuid" onClick={() => this.handleVisitClick(visit.uuid)} value={visit.uuid}>{visit.display}</td></a>
                          <td>{visit.location.display}</td>
                          <td>{new Date(visit.startDatetime).toString()}</td>
                          <td>{new Date(visit.stopDatetime).toString()}</td>
                          <a><td>{this.state.encounters[visit.uuid].slice(0, endIndex).map(encounter => (
                            <li name="encounteruuid" onClick={() => this.handleEncounterClick(encounter.uuid)} value={encounter.uuid}>{encounter.display}</li>

                          ))
                          }
                            {(this.state.encounters[visit.uuid].length > 3 && !showEncounter)
                              ? <a id="bolded-a-tag" onClick={() => this.handleShowMore(this.state.encounters[visit.uuid], visit.uuid)}>
                                Show More!
                              </a>
                              :(showEncounter) ? <a id="bolded-a-tag" onClick={() => this.handleShowLess(this.state.encounters[visit.uuid], visit.uuid)}>
                                Show Less!
                              </a>
                              : ''
                            }

                          </td></a>
                        </tr>
                      )
                    }
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col sm="12">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Encounter</th>
                      <th>Location</th>
                      <th>Encounter Date</th>
                      <th>Form</th>
                    </tr>
                  </thead>
                  {this.state.encountersWithNoVisits.length > 0 ?
                    <tbody>
                      {this.state.encountersWithNoVisits.map((encounter) => {

                        return (
                          <tr key={encounter.uuid}>
                            <a><td name="encounteruuid" onClick={() => this.handleEncounterClick(encounter.uuid)} value={encounter.uuid}>{encounter.display}</td></a>
                            <td>{encounter.location.display}</td>
                            <td>{new Date(encounter.encounterDatetime).toString()}</td>
                            <td>{encounter.form.display}</td>
                          </tr>
                        )
                      }
                      )}
                    </tbody>
                    :
                    <tbody>
                      <h4>There are no encounters with out visits</h4>
                    </tbody>
                  }
                </Table>
              </Col>
            </Row>
          </TabPane>

        </TabContent>
      </div>
    )
  }
}

export default withRouter(VisitsAndEncounters);
