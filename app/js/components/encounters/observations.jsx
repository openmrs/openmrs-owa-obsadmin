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
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';

class Observations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      voidedObs: [],
      unVoidedObs: [],
      observations: [],
    };
    this.toggle = this.toggle.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { obs } = nextProps.stateData.encounterData;
    const voidedObs = [];
    const unVoidedObs = [];
    this.setState({
      observations: nextProps.stateData.encounterData.obs,
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

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    const { voidedObs, unVoidedObs } = this.state;
    return (
      <div className="observation">
        <header className="encounter-header">
          Observations
      </header>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Observations
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Deleted Observations
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
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
                  unVoidedObs.map((ob) => {
                    if (ob.groupMembers !== null) {
                      return (
                        (ob.groupMembers.map(observation => (
                          <tr key={observation.uuid}>
                            <a>
                              <td
                                onClick={() => { this.props.handleObservationClick(observation.uuid); }}
                              >{observation.concept.display}
                              </td>
                            </a>
                            <td>{observation.value.display}</td>
                            <td>{new Date(observation.obsDatetime).toString()}</td>
                          </tr>
                        )))
                      );
                    }
                    return (
                      <tr>
                        <a>
                          <td
                            onClick={() => { this.props.handleObservationClick(ob.uuid); }}
                          >{ob.concept.display}
                          </td>
                        </a>
                        <td>{ob.value}</td>
                        <td>{new Date(ob.obsDatetime).toString()}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </TabPane>
          <TabPane tabId="2">
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
                  voidedObs && voidedObs.length > 0 &&
                  voidedObs.map((ob) => {
                    if (ob.groupMembers !== null) {
                      return (
                        (ob.groupMembers.map(observation => (
                          <tr key={observation.uuid}>
                            <a>
                              <td
                                onClick={() => { this.props.handleObservationClick(observation.uuid); }}
                              >{observation.concept.display}
                              </td>
                            </a>
                            <td>{observation.value.display}</td>
                            <td>{new Date(observation.obsDatetime).toString()}</td>
                          </tr>
                        )))
                      );
                    }
                    return (
                      <tr>
                        <a>
                          <td
                            onClick={() => { this.props.handleObservationClick(ob.uuid); }}
                          >{ob.concept.display}
                          </td>
                        </a>
                        <td>{ob.value}</td>
                        <td>{new Date(ob.obsDatetime).toString()}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}

export default Observations;
