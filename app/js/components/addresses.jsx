/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import { parseString } from 'xml2js';
import {
  Card, Button, CardHeader, CardFooter, CardBlock,
  CardTitle, CardText, Row, Col
} from 'reactstrap';

import apiCall from '../utilities/apiHelper';
import AddressForm from './subAddress/addressForm';

export default class Address extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addresses: [],
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
    };
    this.addressFormat = null;
    this.reload = this.reload.bind(this);
    this.parseAddressFormat = this.parseAddressFormat.bind(this);
  }

  componentDidMount() {
    this.reload();
  }

  reload() {
    apiCall(null, 'get', `/person/${this.props.uuid}/address?v=full`).then((response) => {
      this.setState({ addresses: response.results });
    });
    apiCall(null, 'get', '/systemsetting/layout.address.format').then((response) => {
      this.parseAddressFormat(response)
    });
  }

  parseAddressFormat(xmlString) {
    let localAddressFormat = {};
    if (xmlString.value) {
      parseString(xmlString.value, function (err, result) {
        if (result) {
          if (result["org.openmrs.layout.address.AddressTemplate"] &&
            result["org.openmrs.layout.address.AddressTemplate"].lineByLineFormat[0] &&
            result["org.openmrs.layout.address.AddressTemplate"].lineByLineFormat[0].string) {
            localAddressFormat =
              result["org.openmrs.layout.address.AddressTemplate"].lineByLineFormat[0].string;
          }
        }
      });
    }
    this.addressFormat = localAddressFormat;
  }

  render() {
    return (
      <div>
        <Row>
          {this.state.addresses.map(source => (
            <Col key={source.uuid} sm="6">
              <Card>
                <CardHeader>
                  <div className="preffered">
                    {source.preferred ?
                        <span className="badge badge-info">Preferred</span>
                      :
                      <span className="badge badge-no-color">&nbsp;</span>
                    }
                  </div>
                </CardHeader>
                <CardBlock>
                  <CardText>
                    <AddressForm address={source} reload={this.reload}
                      addressFormat={this.addressFormat}
                      parentUuid={this.state.parentUuid} action="display" />
                  </CardText>
                </CardBlock>
              </Card>
            </Col>
          ))}
        </Row>
        <Row>
          <Col sm="12">
            <Card>
              <CardBlock>
                <CardText>
                  <Row>
                    <Col sm="6">
                      <AddressForm address={this.addNew} reload={this.reload}
                        addressFormat={this.addressFormat}
                        action="display" parentUuid={this.state.parentUuid} />
                    </Col>
                  </Row>

                </CardText>
              </CardBlock>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}
