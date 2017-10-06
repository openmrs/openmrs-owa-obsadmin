/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import apiCall from '../utilities/apiHelper';
import DateTimeField from 'react-bootstrap-datetimepicker';
import moment from 'moment';

export default class Demographics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uuid: null,
            gender: '',
            birthdate: '',
            birthDateTime: '',
            birthdateEstimated: false,
            deceased: false,
            deathDate: '',
            finalDeathdate: '',
            deathDateEstimated: false,
            causeOfDeath: [],
            nameOfCauseOfDeath: '',
            createdBy: '',
            dateCreated: '',
            deleted: false,
            birthdateError: '',
            deathDateError: '',
            causeOfDeathError: '',
            format: 'YYYY-MM-DD HH:mm:ss',
            inputFormat: 'YYYY-MM-DD',
            mode: 'date',
            deathDateTime: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.onDeceased = this.onDeceased.bind(this);
        this.setGender = this.setGender.bind(this);
        this.setbirthdateEstimate = this.setbirthdateEstimate.bind(this);
        this.setDeathDateEstimate = this.setDeathDateEstimate.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
    }


    componentDidMount() {
        this.state.uuid = this.props.uuid;
        apiCall(null, 'get', `/patient/${this.state.uuid}?v=full`)
            .then((response) => {
                const {
          auditInfo,
                    gender,
                    birthdate: birthDateTime,
                    birthdateEstimated,
                    dead: deceased,
                    causeOfDeath,
                    deathDate: deathDateTime,
                    deathDateEstimated,
                    voided: deleted
        } = response.person
                const { display: createdBy } = auditInfo.creator
                const dateCreated = auditInfo.dateCreated
                const birthdate = moment(birthDateTime).format('YYYY-MM-DD HH:mm:ss')
                const finalBirthdate = moment(birthdate).format('YYYY-MM-DDTHH:mm:ss.000Z')
                const deathDate = deathDateTime ?
                    moment(deathDateTime).format('YYYY-MM-DD HH:mm:ss') :
                    moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                const finalDeathdate = moment(deathDate).format('YYYY-MM-DDTHH:mm:ss.000Z')
                const nameOfCauseOfDeath = causeOfDeath && causeOfDeath.uuid
                this.setState({
                    gender,
                    birthdate,
                    birthdateEstimated,
                    deceased,
                    finalBirthdate,
                    deathDate,
                    finalDeathdate,
                    nameOfCauseOfDeath,
                    createdBy,
                    dateCreated,
                    deleted,
                    deathDateTime
                })
            })
            .catch(error => (error));

        apiCall(null, 'get', '/concept')
            .then((response) => {
                this.setState({
                    causeOfDeath: response.results
                })
            })
            .catch(error => (error));
    }

    handleChange(event) {
        const { name, value } = event.target;
        event.preventDefault();
        if (name === 'nameOfCauseOfDeath') {
            this.setState({ nameOfCauseOfDeath: value });
        }
        this.setState({
            [name]: value
        });
    }

    handleTimeChange(name) {
        return dateTime => {
            if (name === "deathDate") {
                this.setState({ deathDateTime: dateTime })
            }
            this.setState({
                [name]: dateTime
            });
        }
    }

    onDeceased(event) {
        this.setState({
            deceased: !this.state.deceased,
            deathDateError: '',
            causeOfDeathError: '',
            deathDateTime: '',
            nameOfCauseOfDeath: ''
        })
    }

    setGender(event) {
        this.setState({ gender: event.target.value })
    }

    setbirthdateEstimate(event) {
        this.setState({ birthdateEstimated: !this.state.birthdateEstimated })
    }

    setDeathDateEstimate(event) {
        this.setState({ deathDateEstimated: !this.state.deathDateEstimated })
    }

    handleSave(event) {
        event.preventDefault();
        const dateToday = new Date()
        const dateTodayUtc = Date.UTC(dateToday.getFullYear(),
            dateToday.getMonth() + 1,
            dateToday.getDate())
        this.setState({
            birthdateError: '',
            deathDateError: '',
            causeOfDeathError: ''
        })
        let errorState = false
        const {
      gender,
            birthdate,
            birthdateEstimated,
            nameOfCauseOfDeath,
            deceased,
            deathDate,
            deathDateEstimated
    } = this.state;
        if (this.state.birthdate > moment(new Date()).format('YYYY-MM-DD HH:mm:ss')) {
            this.setState({ birthdateError: 'Birthdate cannot be in the future' })
            errorState = true
        }
        if (this.state.deceased && !this.state.deathDateTime) {
            this.setState({ deathDateError: 'Select date of death' })
            errorState = true
        }
        if (this.state.birthdate > this.state.deathDate) {
            this.setState({ deathDateError: 'Deathdate cannot be before birthdate' })
            errorState = true
        }
        if (this.state.deathDate > moment(new Date()).format('YYYY-MM-DD HH:mm:ss')) {
            this.setState({ deathDateError: 'Deathdate cannot be in the future' })
            errorState = true
        }
        if (!errorState) {
            apiCall({
                'birthdate': birthdate,
                'birthdateEstimated': birthdateEstimated,
                'causeOfDeath': nameOfCauseOfDeath,
                'dead': deceased,
                'deathDate': deathDate,
                'deathdateEstimated': deathDateEstimated,
                'gender': gender

            }, 'post', `/person/${this.state.uuid}`,

            ).then((response) => {
                if (response.error) {
                    this.setState({ causeOfDeathError: "Invalid cause of death" })
                } else {
                    toastr.success('Demographics Updated')
                }
            })
            .catch(error => (error));
        }
    }

    render() {
        return (
            <div>
                <form className='form-horizontal' onSubmit={this.handleSave}>
                    <div className='form-group'>
                        <label className='control-label col-sm-2'>Gender:</label>
                        <div className='col-sm-5'>
                            <label className='radio-inline'>
                                <input type='radio' id='inlineRadio1'
                                    value='option1' name='male'
                                    type='radio'
                                    value='M'
                                    checked={this.state.gender === 'M'}
                                    onChange={this.setGender}
                                /> Male
                            </label>
                            <label className='radio-inline'>
                                <input type='radio' id='inlineRadio2'
                                    value='option2'
                                    name='female'
                                    type='radio'
                                    value='F'
                                    checked={this.state.gender === 'F'}
                                    onChange={this.setGender}
                                /> Female
                            </label>
                        </div>
                    </div>

                    <div className='form-group'>
                        <div className={this.state.birthdateError ?
                            'has-error' : ''}>
                            <label className='control-label col-sm-2'>Birth Date:</label>
                            <div className='col-sm-5 '>
                                <DateTimeField
                                    className='form-control'
                                    name='birthdate'
                                    inputProps={{ disabled: true }}
                                    format={this.state.format}
                                    viewMode={this.state.mode}
                                    inputFormat={this.state.inputFormat}
                                    dateTime={this.state.birthdate}
                                    onChange={this.handleTimeChange('birthdate')}
                                />
                            </div>
                        </div>
                        <label className='control-label col-sm-2'> Estimated: </label>
                        <div>
                            <input
                                name='estimates'
                                type='checkbox'
                                defaultChecked={this.state.birthdateEstimated}
                                onChange={this.setbirthdateEstimate}
                            />
                        </div>
                    </div>
                    {
                        this.state.birthdateError &&
                        <div className='form-group has-error'>
                            <div className='err-msg'>
                                {this.state.birthdateError}
                            </div>
                        </div>
                    }

                    <div className='form-group'>
                        <label className='control-label col-sm-2'> Deceased: </label>
                        <div className='col-sm-2'>
                            <input
                                name='deceased'
                                type='checkbox'
                                checked={this.state.deceased}
                                onChange={this.onDeceased}
                            />
                        </div>
                    </div>

                    {this.state.deceased &&
                        <div>
                            <div className='form-group'>
                                <div className={this.state.deathDateError ?
                                    'has-error' : ''}>
                                    <label className='control-label col-sm-2'> Death Date: </label>
                                    <div className='col-sm-5'>
                                        <DateTimeField
                                            className='form-control'
                                            name='deathDate'
                                            defaultText={this.state.deathDateTime ?
                                                this.state.deathDate :
                                                'Select date of death'
                                            }
                                            inputProps={{ disabled: true }}
                                            format={this.state.format}
                                            viewMode={this.state.mode}
                                            inputFormat={this.state.inputFormat}
                                            dateTime={this.state.deathDate}
                                            onChange={this.handleTimeChange('deathDate')}
                                        />
                                    </div>
                                </div>
                                <label className='control-label col-sm-2'> Estimated: </label>
                                <div>
                                    <input
                                        name='estimated'
                                        type='checkbox'
                                        value={this.state.deathDateEstimated}
                                    />
                                </div>
                            </div>
                            {
                                this.state.deathDateError &&
                                <div className='form-group has-error err-msg'>
                                    <div className='err-msg'>
                                        {this.state.deathDateError}
                                    </div>
                                </div>
                            }
                            <div className='form-group'>
                                <div className={this.state.causeOfDeathError ?
                                    'has-error' : ''
                                }>
                                    <label className='control-label col-sm-2 no-wrap'>
                                        Cause of death:
                      </label>
                                    <div className='col-sm-5'>
                                        <select className='form-control'
                                            onChange={this.handleChange}
                                            name='nameOfCauseOfDeath'
                                            value={this.state.nameOfCauseOfDeath}
                                        >
                                            {
                                                this.state.causeOfDeath.map((cause) => (
                                                    <option value={cause.uuid}>
                                                        {cause.display}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        this.state.causeOfDeathError &&
                        <div className='form-group has-error'>
                            <div className='err-msg'>
                                {this.state.causeOfDeathError}
                            </div>
                        </div>
                    }

                    <div className='form-group'>
                        <label className='control-label col-sm-2'> Created By: </label>
                        <div className='col-sm-5'>
                            <input
                                className='form-control'
                                disabled={true}
                                name='created-by'
                                type='text'
                                value={this.state.createdBy + ' ' +
                                    this.state.dateCreated}
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='control-label col-sm-1'> </label>
                        <div className='control-label col-sm-2'>
                            <button
                                type='submit'
                                onClick={this.handleSave}
                                className='btn btn-success form-control'
                            >Save </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}
