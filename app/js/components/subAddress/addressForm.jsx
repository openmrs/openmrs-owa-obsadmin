/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import apiCall from '../utilities/apiHelper';
import AddressFormat from './addressFormat';

export default class AddressForm extends React.Component {
  constructor(props) {
    super(props);
    const address = props.address;
    const action = this.props.action;
    this.reload = props.reload;
    this.state = {
      editValues: {},
      address1: address.address1 || null,
      address2: address.address2 || null,
      cityVillage: address.cityVillage || null,
      stateProvince: address.stateProvince || null,
      country: address.country || null,
      postalCode: address.postalCode || null,
      voided: address.voided || false,
      action: action,
      secondryAction: address.secondryAction || '',
      preferred: address.preferred || false,
      activeCard: address.activeCard || '',
      activeButton: null,
      uuid: address.uuid,
      parentUuid: props.parentUuid,
      isShowingModal: false,

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
      activeButton: null
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
    this.deleteClick = this.deleteClick.bind(this);
    this.delete = this.delete.bind(this);
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeBox = this.onChangeBox.bind(this);
    this.cancelClick = this.cancelClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(){
    this.setState({isShowingModal: true});
  }

  handleClose(){
    this.setState({isShowingModal: false});
  }

  onChange(e) {
    const { name, value } = e.target;
    const newValues = this.state.editValues;
    this.setState({[name]: value});
    newValues[name] = value;
    this.setState({ editValues: newValues });
  }

  onChangeBox(e) {
    const { name, checked } = e.target;
    const newValues = this.state.editValues;
    this.setState({[name]: checked});
    newValues[name] = checked;
    this.setState({ editValues: newValues });
  }

  editClick(e,uuid){
      this.setState({
        action: 'edit',
        activeCard: uuid,
        activeButton: e.target
      });
  }

  addClick(e,uuid){
    if(this.state.action === 'display'){
      const newValues = this.defaultValues;
      newValues.action = 'new';
      newValues.activeCard = uuid;
      this.setState(newValues);
    } else {

    }
  }

  cancelClick(){
    const defaults = this.defaultValues;
    defaults.action = "display";
    this.setState(defaults);
  }

  deleteClick(){
    this.handleClick();
  }

  delete(e,uuid){
    this.setState({isShowingModal: false});
    apiCall(this.state.editValues, 'delete', `person/${this.state.parentUuid}/address/${this.state.uuid}`)
      .then((response) => {
        this.reload();
        toastr.options.closeButton = true;
        toastr.success('Address deleted successfully');
      })
      .catch(error => toastr.error(error));
  }

  save(){
    apiCall(this.state.editValues, 'post', `person/${this.state.parentUuid}/address`)
      .then((response) => {
        this.reload();
        this.cancelClick();
        toastr.options.closeButton = true;
        toastr.success('Address created successfully');
      })
      .catch(error => toastr.error(error));
  }

  update(e,uuid){
    if(Object.keys(this.state.editValues).length > 0){
      apiCall(this.state.editValues, 'post', `person/${this.state.parentUuid}/address/${uuid}`)
        .then((response) => {
          const { address1, address2, cityVillage, stateProvince, country,
            postalCode, voided, preferred, uuid } = response;
          this.setState({ address1, address2, cityVillage, stateProvince, country,
            postalCode, voided, preferred, uuid, action: 'display' });
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
          {
            this.state.isShowingModal &&
            <ModalContainer onClose={this.handleClose}>
              <ModalDialog onClose={this.handleClose}>
                <h1>Dialog Address</h1>
                <p>Are you sure you want to delete? <br />
                  Click yes to delete or close this modal to cancel</p>
                <div>
                  <button type="button" name="modalDelete" onClick={this.delete}
                  className="btn btn-default form-control cancelBtn">Yes</button>
                </div>
              </ModalDialog>
            </ModalContainer>
          }
        </div>
        {(this.state.action === 'edit' || this.state.action === 'new')
          && this.state.activeCard === this.state.uuid?
          <form className="form-horizontal">
            <div className="form-group ">
              <label className="control-label col-sm-4">Preferred:</label>
              <div className="col-sm-8">
                <input name="preferred"
                  checked={this.state.preferred} type="checkbox"
                  onChange={this.onChangeBox}
                  disabled={this.state.action ==='display'}
                />
              </div>
            </div>
            <div className="form-group ">
              <label className="control-label col-sm-4">Address:</label>
              <div className="col-sm-8">
                <input type="text" name="address1"
                  value={this.state.address1}
                  className="form-control"
                  onChange={this.onChange}
                  placeholder={this.state.action === 'display'? "": "Enter Address"}
                  disabled={this.state.action==='display'}/>
              </div>
            </div>
            <div className="form-group ">
              <label className="control-label col-sm-4">Address 2:</label>
              <div className="col-sm-8">
                <input type="text" value={this.state.address2} name="address2" className="form-control"
                  onChange={this.onChange}
                  disabled={this.state.action==='display'}
                  placeholder={this.state.action === 'display'? "": "Enter Address 2"}/>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-4 control-label">City/Village:</label>
              <div className="col-sm-8">
                <input type="text" name="cityVillage" value={this.state.cityVillage}
                  className="form-control" disabled={this.state.action==='display'}
                  onChange={this.onChange}
                  placeholder={this.state.action === 'display'? "": "Enter City/Village"}/>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-4 control-label">State/Province:</label>
              <div className="col-sm-8">
                <input type="text" value={this.state.stateProvince}
                  onChange={this.onChange}
                  name="stateProvince" className="form-control"
                  placeholder={this.state.action === 'display'? "": "Enter State/Province"}
                  disabled={this.state.action==='display'}
                  />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-4 control-label">Country:</label>
              <div className="col-sm-8">
                <input name="country" type="text" value={this.state.country} className="form-control"
                  placeholder={this.state.action === 'display'? "": "Enter Country"}
                  onChange={this.onChange}
                  disabled={this.state.action==='display'}
                  />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-4 control-label">Postal Code:</label>
              <div className="col-sm-8">
                <input type="text" name="postalCode" value={this.state.postalCode}
                  className="form-control"
                  placeholder={this.state.action === 'display'? "": "Enter Postal Code"}
                  onChange={this.onChange}
                  disabled={this.state.action==='display'}
                  />
              </div>
            </div>
          </form>
        :
        <div>
          {this.state.secondryAction === 'new' ?
            <div className="form-group">
              <div className="col-sm-offset-4 col-sm-4">
                <button type="button" name="add" onClick={(e) => this.addClick(e,this.state.uuid)}
                  className="btn btn-success form-control">Add</button>
              </div>
            </div>
            :
            <AddressFormat address={this.state} formatString={this.props.addressFormat}/>
          }
        </div>
        }
        {this.state.action ==="new" ?
        <div className="form-group">
          <div className="col-sm-3">
            <button type="button" name="save" onClick={this.save}
              className="btn btn-success form-control">Save</button>
          </div>
          <div className="col-sm-4">
            <button type="button" name="reset" onClick={this.cancelClick}
              className="btn btn-default form-control cancelBtn">Cancel</button>
          </div>
        </div>
        : ''
        }
        {(this.state.action ==="display" && this.state.secondryAction === "" )?
        <div className="form-group">
          <div className="col-sm-3">
            <button type="button" name="edit" onClick={(e) => this.editClick(e,this.state.uuid)}
              className="btn btn-success form-control">Edit</button>
          </div>
          <div className="col-sm-4">
            <button type="button" name="delete" onClick={this.deleteClick}
              className="btn btn-default form-control cancelBtn">Delete</button>
          </div>
        </div>
        : ''
        }
        {this.state.action ==="edit" ?
          <div className="form-group">
            <div className="col-sm-4">
              <button type="button" name="update" onClick={(e) => this.update(e,this.state.uuid)}
                className="btn btn-success form-control">Update</button>
            </div>
            <div className="col-sm-4">
              <button type="button" name="cancel" onClick={this.cancelClick}
                className="btn btn-default form-control cancelBtn">Cancel</button>
            </div>
          </div>
          :''
        }
      </div>
    );
  }
}
