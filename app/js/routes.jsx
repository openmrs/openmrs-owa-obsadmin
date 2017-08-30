/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react'
import {Route, IndexRoute} from 'react-router'
import App from './components/App'
import Patient from './components/patient'
import Search from './components/search'
import Demographics from './components/demographics'
import Name from './components/names'
import ManageVisit from './components/manageVisit'
import Encounter from './components/encounter'

export default () => {
  return (

    <Route path="/" component={App}>
      <IndexRoute component={Search} />
      <Route path="/patient/:id" component={Patient} />
      <Route path="/patient/:id/demographics" component={Demographics} />
      <Route path="/patient/:id/name" component={Name} />
      <Route path="/patient/:patentId/visit/:visitId" component={ManageVisit} />
      <Route path="/patient/:patentId/encounter/:encounterId" component={Encounter} />
      <Route path="*" component={Search} />
    </Route>
  );
}
