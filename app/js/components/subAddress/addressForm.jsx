/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import {Modal} from 'react-bootstrap';
import apiCall from '../../utilities/apiHelper';
import AddressFormat from './addressFormat';
import FontAwesome from'react-fontawesome';

export default class AddressForm extends React.Component {
  constructor(props) {
    super(props);
    const address = props.address;
    const action = this.props.action;
    this.reload = props.reload;
    this.state = {
      address : address,
      editValues: {},
      address1: address.address1 || null,
      address2: address.address2 || null,
      cityVillage: address.cityVillage || null,
      stateProvince: address.stateProvince || null,
      country: address.country || null,
      postalCode: address.postalCode || null,
      voided: address.voided || false,
      action: action,
      secondaryAction: address.secondryAction || '',
      preferred: address.preferred || false,
      activeCard: address.activeCard || '',
      activeButton: null,
      uuid: address.uuid,
      parentUuid: props.parentUuid,
      showModal: false,
    }
    this.defaultValues = {
      address1: address.address1,
      address2: address.address2,
      cityVillage: address.cityVillage,
      stateProvince: address.stateProvince,
      country: address.country,
      postalCode: address.postalCode,
      preferred: address.preferred,
      action: 'display',
      activeCard: '',
      uuid: '1990',
      activeButton: null,
      showModal: false
    }
    this.emptyValues = {
      address1: '',
      address2: '',
      cityVillage: '',
      stateProvince: '',
      country: '',
      postalCode: '',
      preferred: 'false'
    }
    this.editClick = this.editClick.bind(this);
    this.addClick = this.addClick.bind(this);
    this.delete = this.delete.bind(this);
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeBox = this.onChangeBox.bind(this);
    this.cancelClick = this.cancelClick.bind(this);
  }

  onChange(e) {
    const { name, value } = e.target;
    const newValues = this.state.editValues;
    this.setState({ [name]: value });
    newValues[name] = value;
    this.setState({ editValues: newValues });
  }

  onChangeBox(e) {
    const { name, checked } = e.target;
    const newValues = this.state.editValues;
    this.setState({ [name]: checked });
    newValues[name] = checked;
    this.setState({ editValues: newValues });
  }

  editClick(e, uuid) {
    this.setState({
      action: 'edit',
      activeCard: uuid,
      activeButton: e.target,
      showModal: true
    });
  }

  addClick(e, uuid) {
    if (this.state.action === 'display') {
      const newValues = this.defaultValues;
      newValues.action = 'new';
      newValues.activeCard = uuid;
      newValues.showModal = true;
      this.setState(newValues);
    } else {

    }
  }

  cancelClick() {
    const defaults = this.defaultValues;
    defaults.action = "display";
    defaults.showModal = false;

    this.setState(defaults);
  }

  delete(e, uuid) {
    apiCall(this.state.editValues, 'delete', `person/${this.state.parentUuid}/address/${this.state.uuid}`)
      .then((response) => {
        this.reload();
        toastr.options.closeButton = true;
        toastr.success('Address deleted successfully');
      })
      .catch(error => toastr.error(error));
  }

  save() {
    apiCall(this.state.editValues, 'post', `person/${this.state.parentUuid}/address`)
      .then((response) => {
        this.reload();
        this.cancelClick();
        toastr.options.closeButton = true;
        toastr.success('Address created successfully');
      })
      .catch(error => toastr.error(error));
  }

  update(e, uuid) {
    if (Object.keys(this.state.editValues).length > 0) {
      apiCall(this.state.editValues, 'post', `person/${this.state.parentUuid}/address/${uuid}`)
        .then((response) => {
          const { address1, address2, cityVillage, stateProvince, country,
            postalCode, voided, preferred, uuid } = response;
          this.setState({
            address1, address2, cityVillage, stateProvince, country,
            postalCode, voided, preferred, uuid, action: 'display'
          });
          this.reload();
          toastr.options.closeButton = true;
          toastr.success('Address updated successfully');
        })
        .catch(error => toastr.error(error));
    } else {
      toastr.options.closeButton = true;
      toastr.info('Nothing to update');
    }
  }

  render() {
    return (
      <div>
        <div>
          <div className="modal fade" id="myModal" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                  <h4 className="modal-title">Confirm Delete</h4>
                </div>
                <div className="modal-body">
                  <p> Are you sure you want to delete this address?</p>
                </div>
                <div className="modal-footer">
                  <div className="col-sm-6">
                    <button
                      type="button"
                      className="btn btn-success form-control"
                      onClick={this.delete}
                      data-dismiss="modal"
                    >
                      Confirm
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <button
                      type="button"
                      className="btn btn-danger form-control cancelBtn"
                      data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="preffered">
          {this.state.address.preferred ?
              <span className="badge badge-info">Preferred</span>
            :
            <span className="badge badge-no-color">&nbsp;</span>
          }
          {(this.state.action === "display" && this.state.secondaryAction === "") ?
                  <div>
                    <FontAwesome className="fa fa-trash-o delete"
                    data-toggle="modal" data-target="#myModal"/>
                    <FontAwesome onClick={(event) => this.editClick(event, this.state.uuid)}
                                className="fa fa-pencil-square-o"/>
                  </div>
                  : ''
          }
       </div>
        {(this.state.action === 'edit' || this.state.action === 'new')
          && this.state.activeCard === this.state.uuid ?
            <Modal show={this.state.showModal} onHide={this.cancelClick}>
              <Modal.Header closeButton>
                <Modal.Title>Add new Address</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form className="form-horizontal">
                  {!this.props.address.preferred &&
                    <div className="form-group ">
                      <label className="control-label col-sm-4">Preferred:</label>
                      <div className="col-sm-8">
                        <input name="preferred"
                          checked={this.state.preferred} type="checkbox"
                          onChange={this.onChangeBox}
                          disabled={this.state.action === 'display'}
                        />
                      </div>
                    </div>
                  }
                  <div className="form-group ">
                    <label className="control-label col-sm-4">Address:</label>
                    <div className="col-sm-8">
                      <input type="text" name="address1"
                        value={this.state.address1}
                        className="form-control"
                        onChange={this.onChange}
                        placeholder={this.state.action === 'display' ? "" : "Enter Address"}
                        disabled={this.state.action === 'display'} />
                    </div>
                  </div>
                  <div className="form-group ">
                    <label className="control-label col-sm-4">Address 2:</label>
                    <div className="col-sm-8">
                      <input type="text" value={this.state.address2} name="address2" className="form-control"
                        onChange={this.onChange}
                        disabled={this.state.action === 'display'}
                        placeholder={this.state.action === 'display' ? "" : "Enter Address 2"} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-4 control-label">City/Village:</label>
                    <div className="col-sm-8">
                      <input type="text" name="cityVillage" value={this.state.cityVillage}
                        className="form-control" disabled={this.state.action === 'display'}
                        onChange={this.onChange}
                        placeholder={this.state.action === 'display' ? "" : "Enter City/Village"} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-4 control-label">State/Province:</label>
                    <div className="col-sm-8">
                      <input type="text" value={this.state.stateProvince}
                        onChange={this.onChange}
                        name="stateProvince" className="form-control"
                        placeholder={this.state.action === 'display' ? "" : "Enter State/Province"}
                        disabled={this.state.action === 'display'}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Country:</label>
                    <div className="col-sm-8">
                      <input name="country" type="text" value={this.state.country} className="form-control"
                        placeholder={this.state.action === 'display' ? "" : "Enter Country"}
                        onChange={this.onChange}
                        disabled={this.state.action === 'display'}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Postal Code:</label>
                    <div className="col-sm-8">
                      <input type="text" name="postalCode" value={this.state.postalCode}
                        className="form-control"
                        placeholder={this.state.action === 'display' ? "" : "Enter Postal Code"}
                        onChange={this.onChange}
                        disabled={this.state.action === 'display'}
                      />
                    </div>
                  </div>
                  {this.state.action === "edit" ?
                    <div className="form-group">
                      <div id="buttons">
                        <div className="col-sm-4">
                          <button type="button" name="cancel" onClick={this.cancelClick}
                            className="btn btn-danger form-control cancelBtn">Cancel</button>
                        </div>
                        <div className="col-sm-4">
                          <button type="button" name="update" onClick={(e) => this.update(e, this.state.uuid)}
                            className="btn btn-success form-control">Update</button>
                        </div>
                      </div>
                    </div>
                    : ''
                  }
                  {this.state.action === "new" ?
                    <div className="form-group">
                      <div id="buttons">
                          <div className="col-sm-4">
                            <button type="button" name="reset" onClick={this.cancelClick}
                              className="btn btn-danger form-control cancelBtn">Cancel</button>
                          </div>
                          <div className="col-sm-4">
                            <button type="button" name="save" onClick={this.save}
                              className="btn btn-success form-control">Save</button>
                          </div>
                      </div>
                    </div>
                    : ''
                  }
                </form>
              </Modal.Body>
            </Modal>
          :
          <div>
            {this.state.secondryAction === 'new' ?
              <div className="form-group">
                <div >
                  <FontAwesome className="fa fa-plus-square-o add-btn"
                               onClick={(event) => this.addClick(event, this.state.uuid)}/>
                </div>
              </div>
              :
              <AddressFormat address={this.state} formatString={this.props.addressFormat} />
            }
          </div>
        }
      </div>
    );
  }
}
