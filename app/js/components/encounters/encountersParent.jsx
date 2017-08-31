/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from 'react';
import moment from 'moment';
import apiCall from '../../utilities/apiHelper';
import Providers from './encounterProviders';
import Encounter from './encounterForm';

export default class Encounters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      encounterUuid: props.params.encounterId,
      patientUuid: props.params.patentId,
      encounterDisplay: '',
      observations: [],
      providers: [],
      location_array: [],
      visit_array: [],
      encounterRoles: [],
      createProvidersArray: [],
      orders: [],
      patientName: '',
      location: '',
      locationUuid: '',
      visit: null,
      visitUuid: '',
      encounterType: '',
      encounterTypeUuid: '',
      form: null,
      formUuid: null,
      creator: '',
      voided: '',
      encounterDatetime: '',
      finalEncounterDatetime: '',
      changedBy: '',
      dateChanged: '',
      editable: false,
      toDelete: false,
      isChecked: false,
      selectedProviderUuid: '',
      encounterRole: '',
      providerName: '',
      voidReason: '',
      searchedPatients: [],
      prevPatient: '',
      newPatientUuid: '',
      searchValue: '',
      obsUuid: [],
      providersUuid: [],
      format: "YYYY-MM-DD HH:mm:ss",
      inputFormat: "YYYY-MM-DD HH:mm:ss",
      mode: "date",
    };
    this.goHome = this.goHome.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUndelete = this.handleUndelete.bind(this);
    this.handleObservationClick = this.handleObservationClick.bind(this);
    this.handleProviderChecked = this.handleProviderChecked.bind(this);
    this.removeProvider = this.removeProvider.bind(this);
    this.saveNewProvider = this.saveNewProvider.bind(this);
    this.handleSearchPatient = this.handleSearchPatient.bind(this);
    this.changeVisits = this.changeVisits.bind(this);
    this.handleCreateNewEncounter = this.handleCreateNewEncounter.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount() {
    this.fetchData(this.state.encounterUuid);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.encounterUuid !== this.props.encounterUuid) {
      this.setState({
        encounterUuid: nextProps.params.encounterId,
      });
    }
  }

  fetchData(id) {
    apiCall(null, 'get', `encounter/${id}?v=full`)
      .then((res) => {
        const encounterDatetime = moment(res.encounterDatetime).format('YYYY-MM-DD HH:mm:ss')
        const finalEncounterDatetime = moment(encounterDatetime).format('YYYY-MM-DDTHH:mm:ss.000Z')
        this.setState({
          patientName: res.patient.display,
          location: res.location.uuid,
          encounterType: res.encounterType.display,
          encounterTypeUuid: res.encounterType.uuid,
          observations: res.obs,
          visit: res.visit.uuid,
          form: res.form && res.form.display,
          formUuid: res.form && res.form.uuid,
          creator: res.auditInfo.creator.display,
          encounterDatetime: encounterDatetime,
          finalEncounterDatetime,
          changedBy: res.auditInfo.changedBy,
          dateChanged: res.auditInfo.dateChanged,
          providers: res.encounterProviders,
          voided: res.voided,
          orders: res.orders,

        });
      })
      .catch(error => toastr.error(error));

    apiCall(null, 'get', `visit?patient=${this.state.patientUuid}`)
      .then((res) => {
        this.setState({
          visit_array: res.results,
        });
      });

    apiCall(null, 'get', 'location')
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          location_array: res.results,
        }));
      });

    apiCall(null, 'get', 'encounterrole')
      .then((response) => {
        this.setState({
          encounterRoles: response.results,
        });
      })
      .catch(error => error);

    apiCall(null, 'get', 'provider')
      .then((response) => {
        this.setState({
          createProvidersArray: response.results,
        });
      })
  }

  handleTimeChange(name) {
    return dateTime => {
      this.setState({
        [name]: dateTime

      });
    }
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  handleSearchPatient(e) {
    const searchValue = e.target.value.toLowerCase();
    this.setState({ patientName: searchValue, searchValue });
    apiCall(null, 'get', `patient?q=${searchValue}`)
      .then((response) => {
        this.setState({ searchedPatients: response.results });
      });
  }

  changeVisits(newPatientUuid, patientname) {
    $('#selectedPatient').hide();
    apiCall(null, 'get', `visit?patient=${newPatientUuid}`)
      .then((res) => {
        this.setState(Object.assign({}, this.state.newPatientUuid, this.state.patientName, this.state.visit_array, {
          newPatientUuid,
          visit_array: res.results,
          patientName: patientname.split('-')[1],
          visit: null,
        }));
      });
  }

  handleEdit(event) {
    event.preventDefault();
    this.setState({
      editable: true,
      prevPatient: this.state.patientName,
    });
  }

  handleUpdate(event) {
    event.preventDefault();
    if (this.state.providers.length > 0) {
      if (this.state.prevPatient === this.state.patientName) {
        const { patientName, prevPatient, location, visit, finalEncounterDatetime } = this.state;
        apiCall({
          location,
          encounterDatetime: finalEncounterDatetime,
        }, 'post', `encounter/${this.state.encounterUuid}`)
          .then((res) => {
            (res.error) ? toastr.error(res.error) : toastr.success('Successfully Updated');
          })
          .catch(error => toastr.error(error));
        this.setState({
          editable: false,
        });
      } else {
        this.setState({
          toDelete: true,
          voidReason: `moved to patient${this.state.patientName}`,
        }, () => {
          this.handleCreateNewEncounter();
        });
      }
    } else {
      toastr.error('At least one provider is required');
    }
  }

  handleCreateNewEncounter() {
    const obsUuids = this.state.observations.map(obs => ({ uuid: obs.uuid }));
    const providersUuids = this.state.observations.map(provider => ({ uuid: provider.uuid }));
    this.setState({
      obsUuid: obsUuids,
      providersUuid: providersUuids,
    });
    const { obsUuid, providersUuid, form, location, newPatientUuid, finalEncounterDatetime, visit, encounterTypeUuid } = this.state;
    apiCall({
      encounterType: encounterTypeUuid,
      form,
      patient: newPatientUuid,
      encounterDatetime: finalEncounterDatetime,
      location,
      visit,
      encounterProviders: providersUuid,
    }, 'post', 'encounter')
      .then((response) => {
        (response.error) ? toastr.error(response.error) : toastr.success('Encounter successfully created');
        apiCall({
          obs: obsUuids,
        }, 'post', `encounter/${response.uuid}`)
          .then(response => {
            (response.error) ? toastr.error(response.error) : this.handleDelete();
          })
          .catch(error => toastr.error(error))
      })
      .catch(error => toastr.error(error));
  }

  handleDelete() {
    if (!this.state.toDelete) {
      this.setState({
        toDelete: true,
      });
    } else {
      apiCall(null, 'delete', `encounter/${this.state.encounterUuid}`)
        .then((res) => {
          apiCall({ auditInfo: { voidReason: this.state.voidReason } }, 'post', `encounter/${this.state.encounterUuid}`)
            .then((response) => {
              (response.error)
                ? toastr.error(response.error)
                : toastr.success(`Encounter for ${this.state.patientName} successfully deleted`);
            })
            .catch(error => toastr.error(error));
        })
        .catch(error => toastr.error(response.error));
    }
  }

  handleUndelete() {
    apiCall({ voided: false }, 'post', `encounter/${this.state.encounterUuid}`)
      .then((res) => {
        apiCall({ obs: { voided: false } }, 'post', `encounter/${this.state.encounterUuid}`);
      });
  }

  handleObservationClick(observationUuid) {
    this.props.router.push(
      `/patient/${this.state.patientUuid}/encounter/${this.state.encounterUuid}/obs/${observationUuid}
      `);
  }

  handleProviderChecked(e, uuid) {
    this.setState({
      isChecked: e.target.checked,
      selectedProviderUuid: uuid,
    });
  }

  removeProvider() {
    apiCall(
      null,
      'delete',
      `encounter/${this.state.encounterUuid}/encounterprovider/${this.state.selectedProviderUuid}`
    )
      .then((response) => {
        toastr.success('Provider deleted');
      })
      .catch(error => toastr.error(error));
  }

  saveNewProvider(event) {
    event.preventDefault();
    const { encounterRole, providerName } = this.state;
    apiCall({
      provider: providerName,
      encounterRole,
    }, 'post', `/encounter/${this.state.encounterUuid}/encounterprovider`)
      .then((response) => {
        this.props.router.push(`/patient/${this.state.patientUuid}/encounter/${this.state.encounterUuid}`);
        (response.error) ? toastr.error(response.error) : toastr.success('Provider Added');
      })
      .catch(error => toastr.error(error));
  }

  handleCancel() {
    this.setState(
      Object.assign({}, this.state.editable, {
        editable: false
      })
    )
  }

  goHome() {
    this.props.router.goBack();
  }
  render() {
    return (
      <div>
        <div className="section top">
          <div className="col-sm-12 section search">
            <span
              onClick={this.goHome}
              className="glyphicon glyphicon-home glyphicon-updated breadcrumb-item"
              aria-hidden="true"
            >Back</span>
            <header className="encounter-header">
              Encounter {this.state.encounterUuid}
            </header>
            <div className="display">
              <Encounter
                location_array={this.state.location_array}
                location={this.state.location}
                patientName={this.state.patientName}
                encounterDatetime={this.state.encounterDatetime}
                visit={this.state.visit}
                visit_array={this.state.visit_array}
                encounterType={this.state.encounterType}
                creator={this.state.creator}
                voided={this.state.voided}
                form={this.state.form}
                voidReason={this.state.voidReason}
                editable={this.state.editable}
                toDelete={this.state.toDelete}
                handleEdit={this.handleEdit}
                handleCancel={this.handleCancel}
                handleUpdate={this.handleUpdate}
                handleChange={this.handleChange}
                handleDelete={this.handleDelete}
                handleUndelete={this.handleUndelete}
                handleSearchPatient={this.handleSearchPatient}
                searchedPatients={this.state.searchedPatients}
                changeVisits={this.changeVisits}
                searchValue={this.state.searchValue}
                inputFormat={this.state.inputFormat}
                format={this.state.inputFormat}
                handleTimeChange={this.handleTimeChange}
              />

              <Providers
                providers={this.state.providers}
                isChecked={this.state.isChecked}
                handleProviderChecked={this.handleProviderChecked}
                removeProvider={this.removeProvider}
                encounterRoles={this.state.encounterRoles}
                createProvidersArray={this.state.createProvidersArray}
                providerName={this.state.providerName}
                encounterRole={this.state.encounterRole}
                handleChange={this.handleChange}
                saveNewProvider={this.saveNewProvider}
              />

              <div className="observation">
                <header className="encounter-header">
                  Observations
                  </header>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Question Concept</th>
                      <th>Value</th>
                      <th>Created</th>
                      <th>Deleted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.observations.length > 0 &&
                      this.state.observations.map((ob) => {
                        if (ob.groupMembers !== null) {
                          return (
                            (ob.groupMembers.map((observation, index) => (
                              <tr key={index}>
                                <a>
                                  <td
                                    onClick={() => { this.handleObservationClick(observation.uuid); }}
                                  >{observation.concept.display}
                                  </td>
                                </a>
                                <td>{observation.value.display}</td>
                                <td>{new Date(observation.obsDatetime).toString()}</td>
                                <td>{(observation.voided) ? 'Deleted' : 'Not Deleted'}</td>
                              </tr>
                            )))
                          );
                        }
                        return (
                          <tr>
                            <a>
                              <td
                                onClick={() => { this.handleObservationClick(ob.uuid); }}
                              >{ob.concept.display}
                              </td>
                            </a>
                            <td>{ob.value}</td>
                            <td>{new Date(ob.obsDatetime).toString()}</td>
                            <td>{(ob.voided) ? 'Deleted' : 'Not Deleted'}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
