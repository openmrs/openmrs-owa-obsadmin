/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React, { Component } from 'react';
import { Link, IndexLink } from 'react-router';
import apiCall from '../utilities/apiHelper';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locationTags: [],
      currentLocationTag: "",
      currentLocation: "",
      currentUser: "",
      currentLogOutUrl: "",
      contextPath: "",
      columns: 0,
      selected: "",
    };
    this.getUri = this.getUri.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.locationsDropDown = this.locationsDropDown.bind(this);
  }

  componentWillMount() {
    apiCall(null, 'get', '/location?tag=Login%20Location')
      .then((response) => {
        this.setState({ locationTags: response.results },
          () => {
            const columns = Math.floor(this.state.locationTags.length / 3);
            this.setState({
              columns
            });
          }
        );
        this.getUri();
      });

    apiCall(null, 'get', 'appui/session?v=full')
      .then((response) => {
        const { user, sessionLocation } = response;
        this.setState({
          currentUser: user && user.display,
          currentLocationTag: sessionLocation && sessionLocation.uuid,
          currentLocation: sessionLocation && sessionLocation.display,
          selected: sessionLocation && sessionLocation.display,
        });
      });

    const host = location.href.split('/')[3];
    const locationorigin = location.origin;
    const contextPath = locationorigin + '/' + host;
    this.setState({ contextPath })
  }

  getUri() {
    this.state.locationTags.map((location) => {
      let url = location.links[0].uri;
      let arrUrl = url.split("/");
      let customUrl = `/${arrUrl[3]}/appui/header/logout.action?successUrl=${arrUrl[3]}`;
      this.setState({ currentLogOutUrl: customUrl });
      return customUrl;
    });
  }

  handleLocationChange(event) {
    event.preventDefault();
    this.setState({
      currentLocationTag: event.target.id,
      currentLocation: event.target.name,
      selected: event.target.name,
    }, () => {
      apiCall({ 'location': this.state.currentLocationTag }, 'post', 'appui/session')
        .then((response) => {
          (response.error) ? toastr.error(response.error) : ''
        })
        .catch(error => error)
    });
  }

  locationsDropDown() {
    const columnsData = (locationTags, numberOfColumns) => locationTags
      .reduce((columns, location) => {
        const lastColumn = columns[columns.length - 1];
        if (lastColumn.length < numberOfColumns) {
          return [...columns.slice(0, -1), [...lastColumn, location]]
        }
        return [...columns, [location]]
      }, [[]]);
    return columnsData;
  }

  render() {
    const locations = this.locationsDropDown();
    return (
      <header >
        <div className="logo">
          <a href="../../">
            <img src="img/openmrs-with-title-small.png" />
          </a>
        </div>

        <ul className="navbar-right nav-header">
          <Link to="" activeClassName="active">
            <li className="dropdown">
              <a
                id="user-drop"
                className="dropdown-toggle"
                data-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fa fa-user" /> {' ' + this.state.currentUser}
                <span className="caret" />
              </a>
              <ul className="dropdown-menu user">
                <a
                  className="account"
                  href={this.state.contextPath + "/adminui/myaccount/myAccount.page"}
                >My Account
                </a>
              </ul>
            </li>
          </Link>

          <li className="dropdown">
            <a
              id="locations-drop"
              className="dropdown-toggle"
              data-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fa fa-map-marker" />
              {(this.state.currentLocationTag !== "")
                ? this.state.currentLocation
                : ''}
              <span className="caret" />
            </a>

            <ul className="dropdown-menu locations">
              {locations(this.state.locationTags, this.state.columns)
                .map((locationColumn, index) => (
                  <ul className="row flex-column" key={index}>
                    {locationColumn.map((location, index) => (
                      <li
                        key={index}
                        id="location"
                        className={
                          (this.state.selected === location.display)
                            ? 'selected' : ''}
                      >
                        <a
                          className="col col-3"
                          id={location.uuid}
                          name={location.display}
                          onClick={this.handleLocationChange}
                        >{location.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                ))}
            </ul>
          </li>

          <Link to="" activeClassName="active">
            <li className="logout">
              <a href={this.state.currentLogOutUrl}>Logout {' '}
                <i className="fa fa-sign-out" /></a>
            </li>
          </Link>
        </ul>
      </header>
    );
  }
}
