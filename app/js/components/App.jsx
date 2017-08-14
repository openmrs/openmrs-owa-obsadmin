/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React, { PropTypes } from 'react';
import Header from '../common/header';

/**
 * Main application component.
 */
const App = (props) => {
  return(
    <div>
      <div id="tabbed-cohort" >
        <Header />
      </div>
      {props.children}
    </div>
  );
}

export default App;
