/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import toastr from 'toastr';
import apiCall from '../utilities/apiHelper';
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col,
  Table
} from 'reactstrap';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import ReactTable from 'react-table';

export class VisitsAndEncounters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: this.props.uuid,
      visits: [],
      encounters: {},
      showEncounters: {},
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
    this.getAllEncounters = this.getAllEncounters.bind(this);

  }

  toggle(tab) {
    if(this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.uuid !== this.props.uuid) {
      this.setState({
        uuid: this.props.uuid
      });
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
    this.handleEncountersWithNoVisits()
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

    }))
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

  getAllEncounters() {
    let data = {}
    let output = []
    this.state.visits.map((visit) => {
      visit.encounters.map((encounter) => {
        data["visit"] = visit.visitType.display
        data["location"] = visit.location.display
        data["date"] = visit.startDatetime
        data["encounter"] = encounter.display
        data["visitUuid"] = visit.uuid
        data["encounterUuid"] = encounter.uuid
        output.push(data)
        data = []
      })
    });
    this.state.encountersWithNoVisits.map((encounter) => {
      data["location"] = encounter.location.display
      data["date"] = encounter.encounterDatetime
      data["encounter"] = encounter.display
      data["encounterUuid"] = encounter.uuid
      output.push(data)
      data = []
    })

    function compareEncountersByDate(firstEncounter, secondEncounter) {
      if(secondEncounter.date > firstEncounter.date)
        return 1;
      if(secondEncounter.date < firstEncounter.date)
        return -1;
      return 0;
    }

  return output.sort(compareEncountersByDate)
}

render() {
  const columns = [{
      id: 'type',
      Header: 'Type',
      accessor: rowProps => <a>{rowProps.encounter.slice(0, -10)}</a>,
    },
    {
      id: 'location',
      Header: 'Location',
      accessor: rowProps => rowProps.location,
    },
    {
      id: 'date',
      Header: 'Date',
      accessor: rowProps => rowProps.date.split("T")[0],
    },
    {
      id: 'visit',
      Header: 'Visit',
      accessor: rowProps => <a>{rowProps.visit}</a>,
    }
  ];
  return(
    <div>
        <Nav tabs >
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Visits
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Encounters
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col sm="12">
                <Table hover striped>
                  <thead>
                    <tr>
                      <th className="thead">Date</th>
                      <th className="thead">Visit</th>
                      <th className="thead">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.visits.map((visit) => {
                      const showEncounter = this.state.showEncounters[visit.uuid]
                      const endIndex = showEncounter ? showEncounter.length : 3;
                      return (
                        <tr id="custom-a-tag" key={visit.uuid} className="thead">
                          <td className="thead">
                            {visit.startDatetime.split("T")[0]}
                          </td>
                          <td className="thead"
                              name="visituuid"
                              onClick={() => this.handleVisitClick(visit.uuid)}
                              value={visit.uuid}>
                              <a>{visit.display.split("@")[0]}</a>
                          </td>
                          <td className="thead">{visit.location.display}</td>

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
              <ReactTable
                className="-striped -highlight"
                data={this.getAllEncounters()}
                pageSize= {this.getAllEncounters().length}
                columns={columns}
                showPageSizeOptions={false}
                getTdProps={(state, rowInfo, column, instance) => {
                  return {
                    onClick: (event, handleOriginal) => {
                      if(column.Header === "Visit" && row.original.visit){
                        this.handleVisitClick(rowInfo.original.visitUuid)
                        if (handleOriginal) {
                          handleOriginal()
                        }
                      }
                      if(column.Header === "Type"){
                        this.handleEncounterClick(rowInfo.original.encounterUuid)
                        if (handleOriginal) {
                          handleOriginal()
                        }
                      }
                    }
                  }
                }}
              />
              </Col>
            </Row>
          </TabPane>

        </TabContent>
      </div>
  )
}
}

export default withRouter(VisitsAndEncounters);
