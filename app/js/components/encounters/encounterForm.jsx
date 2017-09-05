import React from 'react';
import PropTypes from 'react-proptypes';
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
              props.location_array.map((location, index) => (
                <option key={index} value={location.uuid}>{location.display}</option>
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
            onChange={props.handleTimeChange('encounterDatetime')}
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

      {props.toDelete && props.editable &&
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
          {props.editable &&
            <button
              type="button"
              name="update"
              data-toggle="modal"
              data-target="#myModal"
              className="btn btn-success form-control"
            >
              Update</button>
          }

          {!props.editable &&
            <button
              type="submit"
              name="update"
              onClick={props.handleEdit}
              className="btn btn-success form-control"
              disabled={(props.voided === true)}
            >
              Edit</button>
          }
        </div>

        <div id="button" className="col-sm-3">
          <button
            type="button"
            name="cancel"
            onClick={(props.editable || props.voided) ? props.handleCancel : props.handleDelete}
            className="btn btn-danger form-control cancelBtn"
            disabled={(props.voided === true)}
          >
            {(props.editable || props.voided) ? 'Cancel' : 'Delete'}</button>
        </div>
      </div>
    </form>

    <div className="modal fade" id="myModal" role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal">&times;</button>
            <h4 className="modal-title">Confirm Edit</h4>
          </div>
          <div className="modal-body">
            {(props.prevPatient === null || props.prevPatient === props.patientName) &&
              <p> Are you sure want to edit this encounter?</p>
            }
            {(props.prevPatient !== props.patientName && props.prevPatient !== null) &&
              <p> Are you sure want to move encounter from {props.prevPatient} to {props.patientName} </p>
            }
          </div>
          <div className="modal-footer">
            <div className="col-sm-4">
              <button
                type="button"
                className="btn btn-success form-control"
                onClick={e => props.handleUpdate(e)}
                data-dismiss="modal"
              >Confirm
              </button>
            </div>
            <div className="col-sm-4">
              <button type="button"
                className="btn btn-danger form-control cancelBtn"
                data-dismiss="modal"
              >Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div >
);

Encounter.propTypes = {
  editable: PropTypes.bool,
  handleSearchPatient: PropTypes.func,
  searchedPatients: PropTypes.array,
  location: PropTypes.String,
  handleChange: PropTypes.func,
  location_array: PropTypes.array,
  visit_array: PropTypes.array,
  handleTimeChange: PropTypes.func,
  visit: PropTypes.String,
  handleUpdate: PropTypes.func,
  handleCancel: PropTypes.func,
  handleDelete: PropTypes.func,
  handleEdit: PropTypes.func,
  form: PropTypes.String,
};
export default Encounter;
