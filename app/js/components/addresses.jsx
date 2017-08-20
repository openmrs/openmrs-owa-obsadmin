/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import { Card, Button, CardHeader, CardFooter, CardBlock,
  CardTitle, CardText, Row, Col } from 'reactstrap';

import apiCall from '../utilities/apiHelper';
import AddressForm from './addressForm';


/**
 * Represents the adderesses component which loads different addresses
 * 
 * @class Address
 * @extends {React.Component}
 */
export default class Address extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addresses:[],
      actionNew: false,
      parentUuid: props.uuid,
    }
    this.addNew = {
      editValues: [],
      address1: '',
      address2: '',
      cityVillage: '',
      stateProvince: '',
      country: '',
      postalCode: '',
      voided: false,
      preferred: false,
      uuid: '1990',
      activeCard: '1990',
      secondryAction: 'new'
    }
    this.reload = this.reload.bind(this);  
  }
/**
 * Calls reload function to fetch addresses for the patient
 * 
 * 
 * @memberOf Address
 */
  componentDidMount(){
    this.reload();    
  }

/**
 * Fetches addresses and set the state
 * 
 * 
 * @memberOf Address
 */
  reload(){
    apiCall(null, 'get', `/person/${this.props.uuid}?v=full`).then((response) => {
      this.setState({addresses: response.addresses});
    }); 
  }

/**
 * Renders the component
 * 
 * @returns the react element to be rendered.
 * 
 * @memberOf Address
 */
  render() {
    return (
      <div>
        <Row>
          {this.state.addresses.map(source => (
          <Col key={source.uuid} sm="6">
            <Card>
              <CardHeader>{source.display}</CardHeader>
              <CardBlock>
                <CardText>
                  <AddressForm address={source} reload={this.reload} 
                  parentUuid={this.state.parentUuid} action="display"/>
                </CardText>
              </CardBlock>
              <CardFooter>Created by: {this.state.creator}</CardFooter>
            </Card>
          </Col>
          ))}
          <Col sm="6">
            <Card>
              <CardHeader>Add new address</CardHeader>
                <CardBlock>
                  <CardText>
                    <AddressForm address={this.addNew} reload={this.reload}
                    action="display" parentUuid={this.state.parentUuid}/>
                  </CardText>
                </CardBlock>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}