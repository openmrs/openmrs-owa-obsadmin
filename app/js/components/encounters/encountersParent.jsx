/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from 'react';
import apiCall from '../../utilities/apiHelper';
import Providers from './encounterProviders';
import Encounter from './encounterForm';
import Observations from './observations';

export default class Encounters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      encounterUuid: props.params.encounterId,
      patientUuid: props.params.patentId,
      encounterData: {},
      location_array: [],
      visit_array: [],
      encounterRoles: [],
      createProvidersArray: [],
      searchedPatients: [],
      editValues: {},
      editable: false,
      toDelete: false,
      isChecked: false,
      moveEncounter: false,
      selectedProviderUuid: '',
      searchValue: '',
      prevPatient: '',
      newPatientUuid: '',
      newPatientEncounterUuid: '',
      format: 'YYYY-MM-DD HH:mm:ss',
      inputFormat: 'YYYY-MM-DD HH:mm:ss',
      mode: 'date',
    };

    this.goHome = this.goHome.bind(this);
    this.fetchEncounterData = this.fetchEncounterData.bind(this);
    this.handleFieldEdits = this.handleFieldEdits.bind(this);
    this.handleUpdateCurrentPatient = this.handleUpdateCurrentPatient.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleObservationClick = this.handleObservationClick.bind(this);
    this.handleProviderChecked = this.handleProviderChecked.bind(this);
    this.removeProvider = this.removeProvider.bind(this);
    this.saveNewProvider = this.saveNewProvider.bind(this);
    this.handleSearchPatient = this.handleSearchPatient.bind(this);
    this.changeVisits = this.changeVisits.bind(this);
    this.handleCreateNewEncounter = this.handleCreateNewEncounter.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.goToPatient = this.goToPatient.bind(this);
    this.handleUpdateNewPatient = this.handleUpdateNewPatient.bind(this);
    this.fetchStaticData = this.fetchStaticData.bind(this);
  }

  componentWillMount() {
    this.fetchEncounterData(this.state.encounterUuid);
    this.fetchStaticData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.encounterUuid !== this.props.encounterUuid) {
      this.setState({
        encounterUuid: nextProps.params.encounterId,
      });
    }
  }

  fetchEncounterData(id) {
    apiCall(null, 'get', `encounter/${id}?v=full`)
      .then((response) => {
        this.setState({
          encounterData: response,
          editValues: Object.assign({}, this.state.editValues, {
            location: response.location && response.location.uuid,
            patientName: response.patient && response.patient.display.split('-')[1],
            visit: response.visit ? response.visit.uuid : null,
          }),
        });
      })
      .catch(error => toastr.error(error));
  }

  fetchStaticData() {
    apiCall(null, 'get', `visit?patient=${this.state.patientUuid}`)
      .then((res) => {
        this.setState({
          visit_array: res.results,
        });
      });

    apiCall(null, 'get', 'location')
      .then((res) => {
        this.setState({
          location_array: res.results,
        });
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
      });
  }

  handleTimeChange(name) {
    return (dateTime) => {
      this.setState(Object.assign({}, this.state.encounterData, {
        encounterData: Object.assign({}, this.state.encounterData.encounterDatetime, {
          encounterDatetime: dateTime,
        }),
      }),
      );
    };
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      editValues: Object.assign({}, this.state.editValues, { [name]: value }),
    });
  }

  handleSearchPatient(event) {
    const searchValue = event.target.value.toLowerCase();
    this.setState({
      searchValue,
      editValues: Object.assign({}, this.state.editValues, {
        patientName: searchValue,
      }),
    });
    apiCall(null, 'get', `patient?q=${searchValue}`)
      .then((response) => {
        this.setState({ searchedPatients: response.results });
      });
  }

  changeVisits(newPatientUuid, patientname) {
    $('#selectedPatient').hide();
    apiCall(null, 'get', `visit?patient=${newPatientUuid}`)
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          newPatientUuid,
          visit_array: res.results,
          editValues: Object.assign({}, this.state.editValues, {
            patientName: patientname.split('-')[1],
            visit: null,
          }),
        }));
      });
  }

  handleFieldEdits(event) {
    event.preventDefault();
    const eventTargetName = event.target.name;
    const providers = this.state.encounterData.encounterProviders;
    const patientName = this.state.encounterData.patient && this.state.encounterData.patient.display.split('-')[1];
    if (providers.length > 0) {
      (eventTargetName === 'edit') ?
        this.setState({
          editable: true,
          prevPatient: patientName,
        })
        : this.setState({
          moveEncounter: true,
          prevPatient: patientName,
        });
    } else {
      toastr.error('At least one provider is required');
    }
  }

  handleCancel() {
    this.setState({
      editable: false,
      moveEncounter: false,
    });
    this.fetchEncounterData(this.state.encounterUuid);
  }

  handleUpdateCurrentPatient(event) {
    event.preventDefault();
    const { encounterData, editValues } = this.state;
    apiCall({
      location: editValues.location,
      encounterDatetime: encounterData.encounterDatetime,
      visit: editValues.visit,
    }, 'post', `encounter/${this.state.encounterUuid}`)
      .then((response) => {
        if (response.error) {
          this.fetchEncounterData(this.state.encounterUuid);
          toastr.error(response.error.fieldErrors.encounterDatetime[0].message);
        }
        this.fetchEncounterData(this.state.encounterUuid);
      })
      .catch(error => toastr.error(error));
    this.setState({
      editable: false,
    }, () => { this.fetchEncounterData(this.state.encounterUuid); });
  }

  handleUpdateNewPatient(event) {
    event.preventDefault();
    if (this.state.prevPatient === this.state.editValues.patientName || this.state.prevPatient === null) {
      toastr.error('No new patient detected');
    } else {
      const createEncounter = new Promise((resolve, reject) => {
        resolve(this.handleCreateNewEncounter());
      });
      const updatePromise = new Promise((resolve, reject) => {
        resolve(this.setState({
          toDelete: true,
          editValues: Object.assign({}, this.state.editValues, {
            voidReason: `moved to patient${this.state.editValues.patientName}`,
          }),
        }));
      });
      createEncounter.then(() => updatePromise);
    }
  }

  handleCreateNewEncounter() {
    const { encounterData, editValues, newPatientUuid, encounterUuid } = this.state;
    const observationsUuids = encounterData.obs && encounterData.obs.map(obs => ({ uuid: obs.uuid }));
    const providersUuids = encounterData.encounterProviders.map(provider => (
      {
        provider: provider.provider.uuid,
        encounterRole: provider.encounterRole.uuid,
      }
    ));

    apiCall({
      encounterType: encounterData.encounterType.uuid,
      form: encounterData.form && encounterData.form.display,
      patient: newPatientUuid,
      encounterDatetime: encounterData.encounterDatetime,
      location: editValues.location,
      visit: editValues.visit,
      encounterProviders: providersUuids,
    }, 'post', 'encounter')
      .then((response) => {
        if (response.error) {
          this.fetchEncounterData(encounterUuid);
          toastr.error(response.error.fieldErrors.encounterDatetime[0].message);
          this.setState({ toDelete: false, editable: false, moveEncounter: false });
        } else {
          this.setState({ newPatientEncounterUuid: response.uuid });
          apiCall({
            obs: observationsUuids,
          }, 'post', `encounter/${response.uuid}`)
            .then((res) => {
              (res.error) ? toastr.error(res.error) : this.handleDelete();
            })
            .catch(error => toastr.error(error));
        }
      })
      .catch(error => toastr.error(error));
  }

  handleDelete() {
    const patient = (
      (this.state.prevPatient === this.state.editValues.patientName) ||
      (this.state.prevPatient === '')) ?
      this.state.editValues.patientName : this.state.prevPatient;

    if (!this.state.toDelete) {
      this.setState({
        toDelete: true,
      });
    } else {
      apiCall(null, 'delete', `encounter/${this.state.encounterUuid}`)
        .then(() => {
          apiCall({
            auditInfo: { voidReason: this.state.encounterData.voidReason },
          }, 'post', `encounter/${this.state.encounterUuid}`)
            .then((response) => {
              (response.error)
                ? toastr.error(response.error)
                : (patient === this.state.editValues.patientName)
                  ? toastr.success(`Encounter for ${patient} successfully deleted`) && this.fetchEncounterData(this.state.encounterUuid)
                  : toastr.success(`Encounter for ${patient} successfully deleted and for ${this.state.editValues.patientName} created`)
                  && this.fetchEncounterData(this.state.newPatientEncounterUuid);
            })
            .catch(error => toastr.error(error));
        })
        .catch(error => toastr.error(error));
      this.setState({
        toDelete: false,
        editable: false,
        moveEncounter: false,
        editValues: Object.assign({}, this.state.editValues, {
          voidReason: '',
        }),
      });
    }
  }

  handleProviderChecked(e, uuid) {
    this.setState({
      isChecked: e.target.checked,
      selectedProviderUuid: uuid,
    });
  }

  removeProvider() {
    if (this.state.encounterData.encounterProviders.length === 1 ||
      this.state.encounterData.encounterProviders === null) {
      toastr.error('At least one provider is required');
    } else {
      apiCall(
        null,
        'delete',
        `encounter/${this.state.encounterUuid}/encounterprovider/${this.state.selectedProviderUuid}`,
      )
        .then(() => {
          this.fetchEncounterData(this.state.encounterUuid);
        })
        .catch(error => toastr.error(error));
    }
  }

  saveNewProvider(event) {
    event.preventDefault();
    const { encounterRole, providerName } = this.state.editValues;
    apiCall({
      provider: providerName,
      encounterRole,
    }, 'post', `/encounter/${this.state.encounterUuid}/encounterprovider`)
      .then((response) => {
        (response.error) ? toastr.error(response.error) : toastr.success('Provider Added');
        this.fetchEncounterData(this.state.encounterUuid);
      })
      .catch(error => toastr.error(error));
  }

  handleObservationClick(observationUuid) {
    this.props.router.push(
      `/patient/${this.state.patientUuid}/encounter/${this.state.encounterUuid}/obs/${observationUuid}
      `);
  }

  goToPatient() {
    this.props.router
      .push(`/patient/${this.state.patientUuid}`);
  }

  goHome() {
    this.props.router.push('/');
  }

  render() {
    return (
      <div>
        <div className="section top">
          <div className="col-sm-12 section search">
            <div className="col-sm-1">
              <span
                onClick={this.goToPatient}
                className="glyphicon glyphicon-step-backward glyphicon-updated breadcrumb-item pointer"
                aria-hidden="true"
              >
                Back
              </span>
            </div>
            <span
              onClick={this.goHome}
              className="glyphicon glyphicon-home glyphicon-updated breadcrumb-item"
              aria-hidden="true"
            >
              Home
            </span>
            <header className="encounter-header">
              Encounter on {this.state.encounterDatetime}
            </header>
            <div className="display">
              <Encounter
                stateData={this.state}
                changeVisits={this.changeVisits}
                handleTimeChange={this.handleTimeChange}
                handleFieldEdits={this.handleFieldEdits}
                handleCancel={this.handleCancel}
                handleUpdateCurrentPatient={this.handleUpdateCurrentPatient}
                handleChange={this.handleChange}
                handleDelete={this.handleDelete}
                handleUndelete={this.handleUndelete}
                handleSearchPatient={this.handleSearchPatient}
                handleUpdateNewPatient={this.handleUpdateNewPatient}
              />
              <Providers
                stateData={this.state}
                handleChange={this.handleChange}
                saveNewProvider={this.saveNewProvider}
                handleProviderChecked={this.handleProviderChecked}
                removeProvider={this.removeProvider}
              />
              <Observations
                stateData={this.state}
                handleObservationClick={this.handleObservationClick}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
