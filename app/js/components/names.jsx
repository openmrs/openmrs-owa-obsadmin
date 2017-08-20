/**
 * The contents of this file are subject to the OpenMRS Public License
 * Version 1.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 * Copyright (C) OpenMRS, LLC.  All Rights Reserved.
 */
import React from 'react';
import apiCall from '../utilities/apiHelper';
import toastr from 'toastr'

class Name extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: 'view',
            givenName: '',
            middleName: '',
            familyName: '',
            voided: false,
            preferred: true,
            creator: '',
            dateCreated: '',
            res: '',
        };
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.fetch = this.fetch.bind(this);
    }

    /**
     *
     * set to state patient attributes
     *
     * @memberOf Names
     */
    componentWillMount() {
        this.fetch();
    };

    /**
     *
     * make API call to get the values then set to state
     *
     * @memberOf Names
     */
    fetch(){
        apiCall(null, 'get', 'patient/' + this.props.uuid + '?v=full').then((res) => {
          this.setState({   res: res.person,
              givenName: res.person.preferredName.givenName,
              middleName: res.person.preferredName.middleName,
              familyName: res.person.preferredName.familyName,
              voided: res.person.preferredName.voided,
              creator: res.person.auditInfo.creator.display,
              dateCreated: res.person.auditInfo.dateCreated
            });
        });
    };

    /**
     * handleEdit - changes display state to view to enable editing of input elements
     *@param {object} event - event object
     *
     * @memberOf Name
     */
    handleEdit(){
        this.setState({display: 'edit'});
    }

    /**
     * handleChange - handles changes on input elements
     *@param {object} event - event object
     *
     * @memberOf Name
     */
    handleChange(event) {
        const { name, value } = event.target
        event.preventDefault();
        this.setState({[name]: value});
    }

    /**
     * save - saves names to database and refreshes the page
     *
     *
     * @memberOf Name
     */
    handleSave(){
        this.setState((prevState) => (
            {   display: 'view',
                res: {
                    preferredName: {
                        givenName: this.refs.givenname.value,
                        middleName: this.refs.middlename.value,
                        familyName: this.refs.familyname.value
                    },
                    auditInfo: {
                        creator: {
                            display: prevState.creator
                        },
                        dateCreated: prevState.dateCreated
                    }
                }
        }));
        apiCall(
          {
            "givenName": this.state.givenName,
            "middleName": this.state.middleName,
            "familyName": this.state.familyName
        },'post','/person/' + this.state.res.uuid + '/name/' + this.state.res.preferredName.uuid)
        .then((res) => {
            console.log("here",res)
            toastr.error(res.error.message)
        });
        window.location.reload();
    };

    /**
     * handleCancel - resets info names field to state before start of edit
     *
     *
     * @memberOf Name
     */
    handleCancel(){
        this.setState((prevState) => (
            {   display: 'view',
                givenName: prevState.res.preferredName.givenName,
                middleName: prevState.res.preferredName.middleName,
                familyName: prevState.res.preferredName.familyName,
                voided: prevState.res.preferredName.voided,
                preferred: prevState.preferred,
                creator: prevState.res.auditInfo.creator.display,
                dateCreated: prevState.res.auditInfo.dateCreated
        }));
    };

    /**
     * Renders the component
     *
     * @returns react element to be rendered.
     *
     * @memberOf Name
     */
    render() {
        return (
            <div>
            <form className="form-horizontal">
                <div className="form-group">
                    <div className="col-sm-2">
                        <input className="btn btn-success form-control"
                               name="edit"
                               type="button"
                               value="Edit Name"
                               onClick={this.handleEdit}
                               disabled={this.state.display !== 'view' ? 'disabled' : null}/>
                    </div>
                </div>

                <div className="form-group ">
                    <label className="control-label col-sm-2">Preferred</label>
                    <div className="col-sm-2">
                        <input
                            name="username"
                            type="checkbox"
                            checked={this.state.preferred}
                            disabled={this.state.display === 'view' ? 'disabled' : null}/>
                    </div>
                </div>

                <div className="form-group ">
                    <label className="control-label col-sm-2"> Given Name* </label>
                    <div className="col-sm-5">
                        <input  className="form-control"
                                ref="givenname"
                                name="givenName"
                                type="text"
                                value={this.state.givenName}
                                onChange={this.handleChange}
                                readOnly={this.state.display === 'view' ? 'readonly' : null}
                                required />
                    </div>
                </div>

                <div className="form-group ">
                    <label className="control-label col-sm-2">Middle Name  </label>
                    <div className="col-sm-5">
                        <input  className="form-control"
                                ref="middlename"
                                name="middleName"
                                type="text"
                                value={this.state.middleName}
                                onChange={(event) => this.handleChange(event)}
                                readOnly={this.state.display === 'view' ? 'readonly' : null}/>
                    </div>
                </div>

                <div className="form-group ">
                    <label className="control-label col-sm-2"> Family Name* </label>
                    <div className="col-sm-5">
                        <input  className="form-control"
                                ref="familyname"
                                name="familyName"
                                type="text"
                                value={this.state.familyName}
                                onChange={(event) => this.handleChange(event)}
                                readOnly={this.state.display === 'view' ? 'readonly' : null}
                                required />
                    </div>
                </div>

                <div className="form-group ">
                    <label className="control-label col-sm-2"> Created By: </label>
                    <div className="col-sm-5">
                        <input  className="form-control"
                                name="createdby"
                                type="text"
                                size="50"
                                value= {this.state.creator +'  ' + this.state.dateCreated}
                                disabled />
                    </div>
                </div>

                <div className="form-group">
                    <div className="col-sm-2">
                        <button type="submit"
                             name="update"
                             onClick={this.handleSave}
                             disabled={this.state.display === 'view' ? 'disabled' : null}
                             className="btn btn-default form-control">
                             Save</button>
                    </div>
                    <div className="col-sm-2">
                        <button type="button"
                             name="cancel"
                             onClick={this.handleCancel}
                             disabled={this.state.display === 'view' ? 'disabled' : null}
                             className="btn btn-default form-control cancelBtn">
                             Cancel</button>
                    </div>
               </div>

            </form>
            </div>
        );
    };
};

export default Name;
