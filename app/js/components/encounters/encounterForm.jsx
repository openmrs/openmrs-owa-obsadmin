import React from 'react';
import DateTimeField from 'react-bootstrap-datetimepicker';

const Encounter = props => (
  <div className="encounter">
    <form className="encounter-form">
      <div className="form-group row">
        <label className="col-sm-4 col-form-label"> Patient</label>
        <div className="col-sm-6">
          <input
            className="form-control"
            name="patientName"
            type="text"
            value={props.patientName}
            required
            disabled={(props.editable === false)}
            onChange={props.handleSearchPatient}
          />
          {(props.editable === true && props.searchedPatients.length > 0) &&
            <div className="dropdown-menu" id="selectedPatient">
              {
                props.searchedPatients.map((patient, index) => (
                  <li
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
      </div>

      <div className="form-group row">
        <label className="col-sm-4 col-form-label">Location </label>
        <div className="col-sm-6">
          <select
            className="form-control"
            name="location"
            value={props.location}
            disabled={(props.editable === false)}
            onChange={props.handleChange}
          >
            {
              props.location_array.map((location, key) => (
                <option value={location.uuid}>{location.display}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div className="form-group row">
        <label className="col-sm-4 col-form-label"> Encounter Date </label>
        <div className="col-sm-6">
          <DateTimeField
            className="form-control"
            name="encounterDatetime"
            format={props.format}
            inputFormat={props.inputFormat}
            dateTime={props.encounterDatetime}
            disabled={(props.editable === false)}
            onChange={props.handleTimeChange("encounterDatetime")}
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-sm-4 col-form-label">Visit</label>
        <div className="col-sm-6">
          <select
            className="form-control"
            name="visit"
            type="text"
            value={props.visit}
            disabled={(props.editable === false)}
            onChange={props.handleChange}
          >
            <option value="" />
            {
              props.visit_array.map((visit, index) => (
                <option key={index} value={visit.uuid}>{visit.display}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div className="form-group row">
        <label className="col-sm-4 col-form-label">Encounter Type</label>
        <div className="col-sm-6">
          <input
            className="form-control"
            name="encounterType"
            type="text"
            value={props.encounterType}
            disabled
            onChange={props.handleChange}
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-sm-4 col-form-label">Form</label>
        <div className="col-sm-6">
          <input
            className="form-control"
            name="form"
            type="text"
            value={props.form}
            disabled
            onChange={props.handleChange}
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-sm-4 col-form-label">Created By:</label>
        <div className="col-sm-6">
          <input
            className="form-control"
            name="creator"
            type="text"
            value={props.creator}
            disabled
            onChange={props.handleChange}
          />
        </div>
      </div>

      <div className="form-group row">
        <label className="col-sm-4 col-form-label">Deleted</label>
        <div className="col-sm-6">
          <input
            name="voided"
            className="form-check-input"
            type="checkbox"
            checked={props.voided}
            disabled
            onChange={props.handleChange}
          />
        </div>
      </div>
      {props.toDelete &&
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Reason for Deletion</label>
          <div className="col-sm-6">
            <input
              className="form-control"
              name="voidReason"
              type="text"
              value={props.voidReason}
              onChange={props.handleChange}
              required
            />
          </div>
        </div>
      }
      <div id="button" className="form-group row">
        <div className="col-sm-3">
          <button
            type="submit"
            name="update"
            onClick={(props.editable) ? e => props.handleUpdate(e) : props.handleEdit}
            className="btn btn-success form-control"
          >
            {(props.editable) ? 'Update' : 'Edit'}</button>
        </div>

        <div id="button" className="col-sm-3">
          <button
            type="button"
            name="cancel"
            onClick={
              (props.editable) ? props.handleCancel
                : (props.voided) ? props.handleUndelete
                  : props.handleDelete}
            className="btn btn-danger form-control cancelBtn"
          >
            {(props.editable || props.voided) ? 'Cancel' : 'Delete'}</button>
        </div>
      </div>
    </form>
  </div>
);

export default Encounter;
