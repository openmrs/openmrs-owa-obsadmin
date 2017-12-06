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

} from 'reactstrap';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import ReactTable from 'react-table';
import matchSorter from 'match-sorter';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import BS from 'react-bootstrap';
import jquery from 'jquery';

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
      activeTab: '1',
      ranges: {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  },
      startDate: moment().subtract(9855, 'days'),
      endDate: moment()
    };
    this.handleEvent = this.handleEvent.bind(this)
    this.handleVisitClick = this.handleVisitClick.bind(this)
    this.handleShowMore = this.handleShowMore.bind(this)
    this.handleData = this.handleData.bind(this)
    this.handleEncounterClick = this.handleEncounterClick.bind(this)
    this.handleEncountersWithNoVisits = this.handleEncountersWithNoVisits.bind(this)
    this.handleEncountersWithVisits = this.handleEncountersWithVisits.bind(this)
    this.toggle = this.toggle.bind(this);
    this.getAllEncounters = this.getAllEncounters.bind(this);
    this.onFiltersChange = this.onFiltersChange.bind(this);
  }

  handleEvent(event, picker) {
    this.setState((prevState) => {
      this.onFiltersChange(picker);
			return { startDate: picker.startDate,
      endDate: picker.endDate }
    });
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
    apiCall(null, 'get', `/visit?patient=${this.state.uuid}&includeAll=true&v=full`)
      .then((res) => {
        let visits = res.results;
        const getVisits = visits.map(visit => apiCall(null, 'get', `/visit/${visit.uuid}`));
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

  getAllVisits() {
    let data = {}
    let output = []
    this.state.visits.map((visit) => {
        data["date"] = visit.startDatetime.split("T")[0]
        data["visit"] = visit['display'].split("@")[0]
        data["voided"] = visit.voided.toString()
        data["location"] = visit.location.display
        data["visitUuid"] = visit.uuid
        output.push(data)
        data = []
      })
    return output
  }

  onFiltersChange(value) {
    let startValue = new Date(value.startDate.format('YYYY-MM-DD'));
    let endValue = new Date(value.endDate.format('YYYY-MM-DD'));
    let searchElements = document.getElementsByClassName("filterDate");
    for(let i = 0; i < searchElements.length; i++) {
        let colValue = searchElements[i].textContent;
        let colDateValue= new Date(colValue);
        let hide_content = searchElements[i].parentElement;
        if ((colDateValue >= startValue ) && (colDateValue <= endValue)) {          
          hide_content.style.visibility='visible';
        }
        else{
          hide_content.style.visibility="hidden";
        }
  }
  }
  
  render() {
  let start = this.state.startDate.format('YYYY-MM-DD');
  let end = this.state.endDate.format('YYYY-MM-DD');
  let label = start + ' - ' + end;
  if (start === end) {
    label = start;
  }
    const columns = [
      {
        className:"filterDate",
        id: 'date',
        Header: 'Date',
        accessor: rowProps => rowProps.date.split("T")[0],  
        Filter: ({ filter, onFiltersChange}) =>  
           <DateRangePicker  startDate={this.state.startDate}
                             endDate={this.state.endDate} ranges={this.state.ranges} 
                             onEvent={this.handleEvent} 
                            >
              <Button className="selected-date-range-btn">
                  <input className="dateField"   onChange={this.handleEvent} value={label} />
                  <span className="caret"></span>
              </Button>
          </DateRangePicker>         
     ,
       },
      {
        id: 'location',
        Header: 'Location',
        accessor: rowProps => rowProps.location,
        filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["location"] }),
        filterAll: true
      },
      {
        className:'columnType',
        id: 'type',
        Header: 'Type',
        accessor: rowProps => rowProps.encounter.slice(0, -10),
        filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["type"] }),
        filterAll: true,
        
      },
      {
        className:'columnVisit',
        id: 'visit',
        Header: 'Visit',
        accessor: rowProps => rowProps.visit,
        filterMethod: (filter, rows) =>{
        matchSorter(rows, filter.value, { keys: ["visit"]});
        filterAll: true;
      }
       
      }
    ];

    const columnsvisit = [{
      className:"filterDate",
      id: 'date',
      Header: 'Date',
      accessor: rowProps => rowProps.date,           
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            textDecoration: rowInfo.row.voided === 'true' ? 'line-through' : null 
          }
        }
      },
      Filter: ({ filter, onFiltersChange}) =>  
         <DateRangePicker  startDate={this.state.startDate}
                           endDate={this.state.endDate} ranges={this.state.ranges} 
                           onEvent={this.handleEvent} 
                          >
            <Button className="selected-date-range-btn" style={{width:'100%'}}>
                <input className="dateField"   onChange={this.handleEvent} value={label} />
                <span className="caret"></span>
            </Button>
        </DateRangePicker>        
   ,
     }
    ,
  
    {
      className:"visitTable",
      id: 'visit',
      Header: 'Visit',
      accessor: rowProps => rowProps.visit,
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            textDecoration: rowInfo.row.voided === 'true' ? 'line-through' : null           
          }
        }
      },
      filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ["visit"] }),
      filterAll: true
    },
    {
      id: 'location',
      Header: 'Location',
      accessor: rowProps => rowProps.location,
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            textDecoration: rowInfo.row.voided === 'true' ? 'line-through' : null           
          }
        }
      },
      filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ["location"] }),
      filterAll: true
    },
    {
      id: 'voided',
      Header: 'Deleted Visits',
      show: false,
      accessor: rowProps => rowProps.voided,
    },
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
              <ReactTable
              id="visit"
              className="-striped"
              data={this.getAllVisits()}
              filterable          
              defaultFilterMethod={(filter, coloums) =>
                String(row[filter.id]) === filter.value}
              pageSize= {this.getAllVisits().length}
              columns={columnsvisit}
              showPageSizeOptions={false}
              getTdProps={(state, rowInfo, column, instance) => {
                return {
                  onClick: (e, handleOriginal) => {
                    if(column.Header === "Visit"){
                      this.handleVisitClick(rowInfo.original.visitUuid)
                      if (handleOriginal) {
                        handleOriginal()
                      }
                    }

                  }
                }
              }}
              defaultSorted={[
                {
                  id: "voided",
                  desc: false
                }
              ]}
            />
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col sm="12">
              <ReactTable
                className="-striped -highlight"
                data={this.getAllEncounters()}
                filterable
                defaultFilterMethod={(filter, coloums) =>
                  String(row[filter.id]) === filter.value}
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
