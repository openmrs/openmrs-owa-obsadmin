/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React, {Component} from 'react';
import {Link, IndexLink} from 'react-router';
import apiCall from '../utilities/apiHelper';

/**
 * Represents the menu bar.
 * 
 * @class Header
 * @extends {Component}
 */
export default class Header extends Component {
  constructor() {
    super();
    this.state = {
      locationTags: [],
      currentLocationTag: "",
      currentUser: "",
      currentLogOutUrl: "",
    };
    this.getUri = this.getUri.bind(this);
  }

  /**
   * Gets the OpenMrs configuration and sets the logout link
   * @memberOf Header
   */
  componentWillMount() {
    apiCall(null, 'get', '/location').then((response) => {
      this.setState({locationTags: response.results});
      this.getUri();
    });

    apiCall(null, 'get', '/session').then((response) => {
      this.setState({currentUser: response.user.display});
    });
  }

  /**
   * Gets logout Url 
   * 
   * @returns {string} - logout url
   */  
  getUri() {
    this.state.locationTags.map((location) => {
      let url = location.links[0].uri;
      let arrUrl = url.split("/");
      let customUrl = `/${arrUrl[3]}/appui/header/logout.action?successUrl=${arrUrl[3]}`;
      this.setState({currentLogOutUrl: customUrl});
      return customUrl;
        
    });
  }

  /**
   * Renders the component
   * 
   * @memberOf Header
   */
  render() {
    return (
        <header>
            <div className="logo">
                <a href="../../">
                    <img src="img/openmrs-with-title-small.png"/>
                </a>
            </div>

            <ul className="navbar-right nav-header">
                <Link to="" activeClassName="active">
                    <li className="dropdown">
                        <a className="dropdown-toggle" data-toggle="dropdown" 
                          href="#" role="button" aria-haspopup="true" aria-expanded="false">
                          <span className="glyphicon glyphicon-user"/> {' ' + this.state.currentUser}
                          <span className="caret"/>
                        </a>
                        <ul className="dropdown-menu user">
                            <li>
                                <a href="#">My Account</a>
                            </li>
                        </ul>                        
                    </li>
                </Link>

                <Link to="" activeClassName="active">
                    <li>
                        <a href={this.state.currentLogOutUrl}>Logout {' '}
                            <span className="glyphicon glyphicon-log-out"/></a>
                    </li>
                </Link>
            </ul>
        </header>
    );
  }
}
