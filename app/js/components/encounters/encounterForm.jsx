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
import moment from 'moment';
import DateTimeField from 'react-bootstrap-datetimepicker';

const Encounter = (props) => {
  const {
    moveEncounter,
    prevPatient,
    format,
    inputFormat,
    searchedPatients,
    toDelete,
    editable,
    visitArray,
    locationArray,
    encounterData,
    editValues,
    editErrors,
    moveChecked
  } = props.stateData;

  let editErrorClass = '';
  let editError = '';
  if (editErrors.error.length > 0) {
    editErrorClass = 'has-error';
    editError = editErrors.error;
  }

  const encounterType = encounterData.encounterType && encounterData.encounterType.display;
  const form = encounterData.form && encounterData.form.display;
  const creator = encounterData.auditInfo && encounterData.auditInfo.creator.display;
  const encounterDatetime = moment(encounterData.encounterDatetime).format('YYYY-MM-DD HH:mm:ss');
  const voided = encounterData.voided;

  return (
    <div className="encounter">
      <form className="encounter-form">
        <div className="form-group row">
          <div className="col-sm-3">
          </div>
          {voided &&
            <div className="deleted">
              <span className="badge badge-error">Deleted</span>
            </div>
          }
        </div>

        <div className="form-group row">
          <div className={editError.includes('patient') ? editErrorClass : ''}>
            <label className="col-sm-4 col-form-label"> Patient:</label>
            <div className="col-sm-8">
              <input
                className="form-control"
                name="patientName"
                type="text"
                value={editValues.patientName}
                required
                disabled={!moveEncounter}
                onChange={props.handleSearchPatient}
              />
              {(moveEncounter && searchedPatients.length > 0) &&
                <div className="dropdown-menu" id="selectedPatient">
                  {
                    searchedPatients.map((patient, index) => (
                      <li
                        key={index}
                        className="dropdown-item"
                        value={patient.uuid}
                        key={index}
                        onClick={() => props.changeVisits(patient.uuid, patient.display)}
                      >{patient.display}</li>
                    ))
                  }
                </div>
              }
            </div>
            {(editError.includes('patient')) &&
              <div id="patientError" className="input">{editError}</div>}
          </div>
        </div>

        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Location: </label>
          <div className="col-sm-8">
            <select
              className="form-control"
              name="location"
              value={editValues.location}
              disabled={!editable && !moveEncounter}
              onChange={props.handleChange}
            >
              {
                locationArray.map(location => (
                  <option
                    key={location.uuid}
                    value={location.uuid}
                  >
                    {location.display}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        <div className="form-group row">
          <div className={(editError.includes('datetime')) ? editErrorClass : ''}
          >
            <label className="col-sm-4 col-form-label"> Encounter Date: </label>
            <div className="col-sm-8">
              <DateTimeField
                className="form-control"
                name="encounterDatetime"
                format={format}
                inputFormat={inputFormat}
                dateTime={encounterDatetime}
                inputProps={{ disabled: (!editable && !moveEncounter) }}
                onChange={props.handleTimeChange('encounter')}
              />
            </div>
            {editError.includes('datetime') &&
              <div className="input">{editError}</div>}
          </div>
        </div>

        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Visit:</label>
          <div className="col-sm-8">
            <select
              className="form-control"
              name="visit"
              type="text"
              value={editValues.visit}
              disabled={!editable && !moveEncounter}
              onChange={props.handleChange}
            >
              <option value="" >none</option>
              {
                visitArray.map((visit, index) => (
                  <option
                    key={index}
                    value={visit.uuid}
                  >{visit.display + ' to ' + moment(visit.stopDatetime).format('YYYY-MM-DD HH:mm')}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Encounter Type:</label>
          <div className="col-sm-8">
            <input
              className="form-control"
              name="encounterType"
              type="text"
              value={encounterType}
              disabled
              onChange={props.handleChange}
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Form:</label>
          <div className="col-sm-8">
            <input
              className="form-control"
              name="form"
              type="text"
              value={form}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Created By: </label>
          <div className="col-sm-8">
            <input
              className="form-control"
              name="creator"
              type="text"
              value={creator}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-sm-4 col-form-label"> Move Encounter: </label>
          <div id="move-encounter" className="col-sm-4">
            <input
              name="move"
              className="form-check-input"
              type="radio"
              id="no"
              checked={!moveEncounter}
              onChange={props.handleFieldEdits}
              disabled={voided}
            />
            <label for="no">NO</label>

            <input
              name="move"
              className="form-check-input"
              type="radio"
              id="yes"
              checked={moveEncounter}
              onChange={props.handleFieldEdits}
              disabled={voided}
            />
            <label for="yes">YES</label>
          </div>
        </div>
        {
          toDelete && !voided &&
          <div className="form-group row">
            <label className="col-sm-4 col-form-label">Reason for Deletion:</label>
            <div className="col-sm-7">
              <input
                className="form-control"
                name="voidReason"
                type="text"
                value={editValues.voidReason}
                onChange={props.handleChange}
                required
              />
            </div>
          </div>
        }

        <div id="button" className="form-group row">
          <div className="col-sm-3">
            {moveEncounter &&
              <button
                type="button"
                name="update"
                data-toggle="modal"
                data-target="#myModal"
                className="btn btn-success form-control"
              >
                Confirm Move</button>
            }

            {editable && !moveEncounter &&
              <button
                type="button"
                name="update"
                data-toggle="modal"
                data-target="#myModal"
                className="btn btn-success form-control"
              >
                Update</button>
            }

            {!editable && !moveEncounter &&
              <button
                type="submit"
                name="edit"
                onClick={props.handleFieldEdits}
                className="btn btn-success form-control"
                disabled={voided || moveEncounter}
              >
                Edit</button>
            }
          </div>

          <div id="button" className="col-sm-3">
            <button
              type="button"
              name="cancel"
              onClick={
                (editable || voided || moveEncounter)
                  ? props.handleCancel
                  : props.handleDelete}
              className="btn btn-danger form-control cancelBtn"
              disabled={(voided === true)}
            >
              {(editable || voided || moveEncounter) ? 'Cancel' : 'Delete'}
            </button>
          </div>
        </div>
      </form>

      <div className="modal fade" id="myModal" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                data-dismiss="modal"
              >
                &times;
              </button>
              <h4 className="modal-title">Confirm Edit</h4>
            </div>
            <div className="modal-body">
              {(moveEncounter) ?
                <p> Are you sure you want to move encounter from {prevPatient} </p>
                :
                <p> Are you sure you want to edit this encounter?</p>
              }
            </div>
            <div className="modal-footer">
              <div className="col-sm-4">
                <button
                  type="button"
                  className="btn btn-success form-control"
                  onClick={
                    moveEncounter ?
                      (e => props.handleUpdateNewPatient(e))
                      : (e => props.handleUpdateCurrentPatient(e))}
                  data-dismiss="modal"
                >Confirm
                </button>
              </div>
              <div className="col-sm-4">
                <button
                  type="button"
                  className="btn btn-danger form-control cancelBtn"
                  data-dismiss="modal"
                >Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Encounter.propTypes = {
  stateData: PropTypes.object.isRequired,
  handleSearchPatient: PropTypes.func,
  handleChange: PropTypes.func,
  handleTimeChange: PropTypes.func,
  handleUpdateCurrentPatient: PropTypes.func,
  handleUpdateNewPatient: PropTypes.func,
  handleCancel: PropTypes.func,
  handleDelete: PropTypes.func,
  handleFieldEdits: PropTypes.func,
};

export default Encounter;
