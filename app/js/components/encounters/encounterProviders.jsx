/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from 'react';
import PropTypes from 'react-proptypes';

const Providers = (props) => {
  return (
    <div className="provider">
      <header className="encounter-header">
        Providers
      </header>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Role</th>
            <th>Provider Name</th>
            <th>Identifier</th>
          </tr>
        </thead>
        <tbody>
          {props.providers.map((provider, index) => (
            <tr key={index}>
              <td>{provider.encounterRole.display}</td>
              <td>{provider.provider.display.split('-')[1]}</td>
              <td>{provider.provider.display.split('-')[0]}</td>
              <td><input
                name="voided"
                className="form-check-input"
                type="checkbox"
                value={props.isChecked}
                onChange={event => props.handleProviderChecked(event, provider.uuid)}
              />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="form-group row">
        <div id="button" className="col-sm-2">
          <button
            data-toggle="modal"
            data-target="#exampleModal"
            type="submit"
            name="add"
            className="btn btn-success form-control"
          >
            Add Provider</button>
        </div>

        <div id="button" className="col-sm-2">
          <button
            type="button"
            name="delete"
            onClick={props.removeProvider}
            disabled={!props.isChecked}
            className="btn btn-danger form-control cancelBtn"
          >
            Remove</button>
        </div>
      </div>
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <label>Add Provider</label>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <form>
                <div className="form-group row">
                  <label className="col-sm-6 col-form-label">Encounter Role </label>
                  <div className="col-sm-6">
                    <select
                      className="form-control"
                      name="encounterRole"
                      defaultValue={props.encounterRole}
                      onChange={props.handleChange}
                    >
                      <option value="" />
                      {
                        props.encounterRoles.map((role, index) => (
                          <option key={index} value={role.uuid}>{role.display}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="form-group row">
                  <label className="col-sm-6 col-form-label">Provider Name </label>
                  <div className="col-sm-6">
                    <select
                      className="form-control"
                      name="providerName"
                      defaultValue={props.providerName}
                      onChange={props.handleChange}
                    >
                      <option value="" />
                      {
                        props.createProvidersArray.map((providerName, index) => (
                          <option key={index} value={providerName.uuid}>{providerName.display}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <div className="col-sm-4">
                <button
                  type="button"
                  className="btn btn-success form-control"
                  data-dismiss="modal"
                  onClick={props.saveNewProvider}
                >Save changes</button>
              </div>
              <div className="col-sm-4">
                <button
                  type="button"
                  className="btn btn-danger form-control cancelBtn"
                  data-dismiss="modal"
                >Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Providers.propTypes = {
  providers: PropTypes.array.isRequired,
  isChecked: PropTypes.bool.isRequired,
  saveNewProvider: PropTypes.func.isRequired,
  createProvidersArray: PropTypes.array.isRequired,
  handleProviderChecked: PropTypes.func.isRequired,
  removeProvider: PropTypes.func.isRequired,
  encounterRoles: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default Providers;
