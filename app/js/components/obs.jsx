/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import DatePicker from "react-bootstrap-date-picker";
import { AsyncTypeahead, Typeahead } from 'react-bootstrap-typeahead';
import apiCall from '../utilities/apiHelper';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';


/**
 * Represents the Obs component which loads Obs for display and manipulation.
 * 
 * @class Obs
 * @extends {React.Component}
 */
export default class Obs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: null,
      concepts: [],
      obs: {
        person: '',
        encounter: '',
        order: '',
        location: '',
        obsdate: '2017-01-01',
        concept: '',
        comment : 'comment',
        encounterUuid: '',
      },
      conceptOptions: [],
      conceptSelected: [],
      conceptAnswers: [],
      selectedConceptData: [],
      locations: [],
      conceptDataType: 'Text',
      value: '',
      invalid: false,
      editValues: {},
      isShowingModal: false,
    }
    this.getValue = this.getValue.bind(this);
    this.goToEncounter =  this.goToEncounter.bind(this);
    this.conceptOnChange =  this.conceptOnChange.bind(this);
    this.onSearch =  this.onSearch.bind(this);
    this.loadConcepts =this.loadConcepts.bind(this);
    this.handleChange =this.handleChange.bind(this);
    this.goHome = this.goHome.bind(this);
    this.renderValue = this.renderValue.bind(this);
    this.renderInput = this.renderInput.bind(this);
    this.changeValue = this.changeValue.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  /**
   * On component mount, performs api calls.
   */
  componentDidMount() {
    this.state.uuid = this.props.params.obsId;
    if (this.state.uuid ){
      apiCall(null, 'get', '/location')
        .then((result) => {
          apiCall(null, 'get', `/obs/${this.state.uuid}`)
            .then((res) => {
              if(res){
                const obs = {
                  person: res.person.display.substr(res.person.display.indexOf('-')+1).trim() || '',
                  encounter: res.encounter.display || '',
                  order: res.encounter.order || '',
                  location: res.location.display || '',
                  obsdate: res.obsDatetime || '',
                  concept: res.concept.display || '',
                  conceptUuid: res.concept.uuid || '',
                  comment : res.comment || '',
                  encounterUuid: res.encounter.uuid,
                }
                this.setState({
                  obs,
                  conceptOptions: [{name: res.concept.display}] || [],
                  conceptSelected: [res.concept.display],
                  value: this.getValue(res.value) || '',
                  locations: result.results,
                });
                if(this.state.obs.conceptUuid){
                  this.loadConcepts();
                }
              }
            })
            .catch((err) => {
              toastr.error(err);
            });
        })
        .catch((error) => {
          toastr.error(error);
        })
    } else {
      this.props.router.push('/');
    }
  }
  /**
   * deleteClick - calls the delete operation on Observation
   * by first asking user to confirm choice
   * 
   * 
   * @memberOf Obs
   */
  deleteClick(){
    this.setState({isShowingModal: true});
  }
  /**
   * delete - Performs delete operation on Observation
   * after getting confirmation from user
   * 
   * 
   * @memberOf Obs
   */
  delete(){
    this.setState({isShowingModal: false});
    apiCall(null, 'delete', `obs/${this.state.uuid}?!purge`)
      .then((result) => {
        toastr.options.closeButton = true;
        toastr.success('Deleted successfully');
        this.goToEncounter();
      })
      .catch(error => toastr.error(error));
  }
  /**
   * getValue - Gets the react Element to be displayed
   * when concept is selected
   * 
   * @param {object} value - from concept or api
   * @returns 
   * 
   * @memberOf Obs
   */
  getValue(value){
    if (value === null || undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' ) return value;
    if(typeof value === 'object'){
      if (value.display){
        return value.display;
      }
      else {
        return '';
      }
    } 
    return '';
  }
  /**
   * handleClose - closes confirmation dialog for delete
   * 
   * 
   * @memberOf Obs
   */
  handleClose(){
    this.setState({isShowingModal: false});
  }
  /**
   * changeValue - Handle changes from normal input elements
   * 
   * @param {object} event 
   * 
   * @memberOf Obs
   */
  changeValue(event){
    const valueHolder = event.target.value;
    const value = valueHolder.substring(valueHolder.indexOf("///")+3);
    const editValue =  valueHolder.substring(0,valueHolder.indexOf("///"));
    const newEditValues = this.state.editValues;
    newEditValues.value = editValue;
    this.setState({value, editValues: newEditValues,});
  }
/**
 * handleChange - Handle changes from select and date input elements
 * 
 * @param {object} event 
 * 
 * @memberOf Obs
 */
  handleChange(event){
    let name;
    let value;
    if(event.target){
      name = event.target.name;
      value = event.target.value;
    } else {
      name = "value";
      value = event;
    }
    const newEditValues = this.state.editValues;
    newEditValues[name] = value;
    if(name === "value"){
      this.setState({value, editValues: newEditValues,});
    } else {
      const newObs = this.state.obs;
      newObs[name] = value;
      this.setState({
        obs: newObs,
        editValues: newEditValues,
      });
    }
  }
  /**
   * goToEncounter - push back to encounter component
   * 
   * 
   * @memberOf Obs
   */
  goToEncounter(){
    this.props.router
    .push(`/patient/${this.props.params.patentId}/encounter/${this.state.obs.encounterUuid}`);
  }
  /**
   * conceptOnChange - Handles changes from concept component
   * 
   * @param {object} selected 
   * 
   * @memberOf Obs
   */
  conceptOnChange(selected){
    
    if(selected.length > 0){
      // if one, then this is the first time, load old value
      // selectedConceptData includes answers and datatype
      //let value = this.state.value;
      let filtteredConceptData = [];
      if(selected[0].answers){ //Check if its rendering for the first time
        let newEditValues = this.state.editValues;
        newEditValues.concept = selected[0].uuid;
        delete newEditValues.value;
        filtteredConceptData = selected[0].answers.map(concept => {
          const conceptData = {
            uuid: concept.uuid,
            display: concept.display,
          };
          return conceptData;
        });
        const newData = selected[0];
        if(typeof newData === 'object'){
          newData.answers = filtteredConceptData;
        }
        this.setState({selectedConceptData: newData, value: '', editValues: newEditValues})
      }
    }
  }
  /**
   * onSearch - Called when searching the concept component
   * 
   * @param {string} selected 
   * 
   * @memberOf Obs
   */
  onSearch(selected){
    this.loadConcepts(selected);
  }
  /**
   * goHome - push back to search component
   * 
   * 
   * @memberOf Obs
   */
  goHome() {
    this.props.router.push('/');
  }
  /**
   * renderInput - Renders text input for value depending on the output of concept
   * 
   * @param {string} disabled 
   * @returns react element
   * 
   * @memberOf Obs
   */
  renderInput(disabled){
    return (<input type="text" name="value" disabled={disabled}
                onChange={this.handleChange}
                className="form-control bootstrap-typeahead-input-main"
                value={this.state.value}
              />);
  }
  /**
   * renderValue - renders OBS value element depending on concept value
   * 
   * @returns react element
   * 
   * @memberOf Obs
   */
  renderValue(){
    let valueType =  this.state.selectedConceptData; 
    if (valueType !== undefined){
      if(valueType.datatype !== undefined){
        valueType = valueType.datatype;
        valueType = valueType.name ? valueType.name : null;
      } else {
        valueType = null;
      }
    } else {
      valueType = null;
    }
    switch(valueType){
      case null:
        return this.renderInput(true)
      case "Text":
      case "Structured Numeric":
      case "Numeric":
        return this.renderInput(false);
      case "Datetime":
      case "Date":  
      case "Time":
        return (<DatePicker
                dateFormat="DD-MM-YYYY"
                className="form-control"
                showClearButton={false}
                onChange={this.handleChange}
                name="value"
                value={this.state.value}
                onInvalid={this.handleInvalidDate}
               />);
      case "Boolean":
        return (<select
                className="form-control"
                name="value"
                value={this.value}
                onChange={this.handleChange}
               >
                <option value="">Select option</option>
                <option value="false">false</option>
                <option value="true">true</option>
              </select>);
      default:
        if(this.state.selectedConceptData.answers){
          
          if(this.state.selectedConceptData.answers.length > 0){
            const values = this.state.selectedConceptData.answers;
            values.push({display: 'Select option', uuid: ''});
              return (<select
                      className="form-control"
                      name="value"
                      onChange={this.changeValue}
                    >
                      { 
                        values.map((option, key) => (
                          <option  selected={option.display === this.state.value? true:false}
                          value={`${option.uuid}///${option.display}`}>{option.display}</option>
                        ))
                      }
                    </select>                  
                  
                  );
          } else {
            return this.renderInput(false);;
          } 
        } else {
            return this.renderInput(false);;
        }
    }
  }
  /**
   * loadConcepts - loads concept values
   * 
   * @param {string} searchValue 
   * 
   * @memberOf Obs
   */
  loadConcepts(searchValue){
    let url = '/concept'
    url = searchValue ? `${url}?v=full&q=${searchValue}` 
      : `${url}/${this.state.obs.conceptUuid}?v=full`;
    let allConcepts = [];
    apiCall(null, 'get', url)
      .then((res) => {
        if (res.results) {
          if (res.results.length > 0 ) {
            allConcepts = res.results.map(concept => {
              const description= concept.descriptions.filter(des => des.locale == 'en' ? des.description: '');
              const conceptData = {
                uuid: concept.uuid,
                units: concept.units || '',
                answers: concept.answers,
                hl7Abbrev: concept.datatype.hl7Abbreviation,
                name: concept.name.name,
                description: description.length > 0? description[0].description : 'no description available',
                datatype: concept.datatype
              };
              return conceptData;
            }); 
          }
          this.setState(Object.assign({}, this.state, {conceptOptions: allConcepts}));
        } else {
          if(res){
            const conceptData = {
              uuid: res.uuid,
              units: res.units || '',
              answers: res.answers,
              hl7Abbrev: res.datatype.hl7Abbreviation,
              name: res.name.name,
              datatype: res.datatype
            };
            this.setState(Object.assign({}, this.state, {selectedConceptData: conceptData}));
          }
        }
      })
      .catch((err) => {
        toastr.error(err);
      });
  }
  /**
   * update -Updates obs
   * 
   * 
   * @memberOf Obs
   */
  update(){
    if(Object.keys(this.state.editValues).length > 0){
      apiCall(this.state.editValues, 'post', `obs/${this.state.uuid}`)
        .then((response) => {
          if(response.error){
            const err = response.error.message ? response.error.message  : response.error;
            toastr.error(err);
          } else {
            toastr.options.closeButton = true;
            toastr.success('Observation updated successfully');
            let patientId = this.props.params.patentId;
            let encounterId = this.props.params.encounterId;
            let obsId = response.uuid
            patientId = patientId.trim();
            encounterId = encounterId.trim();
            obsId = obsId.trim()
            this.props.router.push(`/patient/${patientId}/encounter/${encounterId}/obs/${obsId}`);
          }

        })
        .catch((error) => {
          toastr.error(error);
        });
    } else {
        toastr.options.closeButton = true;
        toastr.info('Nothing to update');
    }
  }
  /**
   * render - renders the component
   * 
   * @returns 
   * 
   * @memberOf Obs
   */
  render() {
    return (
      <div>
        {
          this.state.isShowingModal &&
          <ModalContainer onClose={this.handleClose}>
            <ModalDialog onClose={this.handleClose}>
              <h1>Observation Dialog</h1>
              <p>Are you sure you want to delete? <br />
                Click yes to delete or close this modal to cancel</p>
              <div>
                <button type="button" name="modalDelete" onClick={this.delete}
                className="btn btn-default form-control cancelBtn">Yes</button>
              </div>
            </ModalDialog>
          </ModalContainer>
        }
        <div className="section top">
          <div className="col-sm-12 section search">  
            <div className="form-group">
              <div className="col-sm-1">          
                <span onClick={this.goHome} className="glyphicon glyphicon-home 
                  glyphicon-updated breadcrumb-item pointer" aria-hidden="true">
                  Home
                </span>
              </div>
              <div className="col-sm-1">
                <span onClick={this.goToEncounter} className="glyphicon glyphicon-step-backward 
                  glyphicon-updated breadcrumb-item pointer" aria-hidden="true">
                  Back
                </span>
              </div>
            </div>
            <p />
            <div>
              <h3>Observation</h3>
              <form className="form-horizontal">
                <div className="form-group ">
                  <label className="control-label col-sm-3">Person:</label>
                  <div className="col-sm-8">
                    <input type="text" disabled
                      className="form-control bootstrap-typeahead-input-main"
                      value={this.state.obs.person}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Encounter:</label>
                  <label className="control-label col-sm-8 custom-label encounter-label pointer"
                    onClick={this.goToEncounter}>
                    {this.state.obs.encounter}
                  </label>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Order:</label>
                  <div className="col-sm-8">
                    <input type="text" disabled={true}
                      name="order"
                      className="form-control bootstrap-typeahead-input-main"
                      value={this.state.obs.order}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Location:</label>
                  <div className="col-sm-8">
                    <select
                      className="form-control"
                      name="location"
                      onChange={this.handleChange}
                    >
                      {
                        this.state.locations.map((location, key) => (
                          <option  selected={location.display === this.state.obs.location? true:false}
                          value={location.uuid}>{location.display}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Observation Date:</label>
                  <div className="col-sm-8">
                    <DatePicker
                      dateFormat="DD-MM-YYYY"
                      disabled
                      className="form-control"
                      showClearButton={false}
                      name="obsdate"
                      value={this.state.obs.obsdate}
                      onInvalid={this.handleInvalidDate}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Concept Question:</label>
                  <div className="col-sm-8">
                    <AsyncTypeahead
                      ref="typeahead"
                      name="concept"
                      labelKey="name"
                      className="form-control bootstrap-typeahead-input-main"
                      options={this.state.conceptOptions}
                      onSearch={this.loadConcepts}
                      selected={this.state.conceptSelected}
                      onChange={this.conceptOnChange}
                    />
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Answer Concept:</label>
                  <div className="col-sm-8">
                    {this.renderValue()}
                  </div>
                </div>
                <div className="form-group ">
                  <label className="control-label col-sm-3">Comment:</label>
                  <div className="col-sm-8">
                    <textarea type="text"
                      onChange={this.handleChange}
                      name="comment"
                      className="form-control bootstrap-typeahead-input-main"
                      value={this.state.obs.comment}
                    />
                  </div>
                </div>  
                <div className="form-group">
                  <div className="col-sm-offset-3 col-sm-3">
                    <button type="button" name="update" onClick={this.update}
                      className="btn btn-success form-control">Update</button>
                  </div>
                  <div className="col-sm-3">
                    <button type="button" name="delete" onClick={this.deleteClick}
                      className="btn btn-default form-control cancelBtn">Delete</button>
                  </div> 
                </div>                                  
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}