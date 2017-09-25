/* This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import PropTypes from 'react-proptypes';

const Observations = (props) => {
  const { encounterData } = props.stateData;

  return (
    <div className="observation">
      <header className="encounter-header">
        Observations
      </header>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Question Concept</th>
            <th>Value</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {
            encounterData.obs && encounterData.obs.length > 0 &&
            encounterData.obs.map((ob) => {
              if (ob.groupMembers !== null) {
                return (
                  (ob.groupMembers.map(observation => (
                    <tr key={observation.uuid}>
                      <a>
                        <td
                          onClick={() => { props.handleObservationClick(observation.uuid); }}
                        >{observation.concept.display}
                        </td>
                      </a>
                      <td>{observation.value.display}</td>
                      <td>{new Date(observation.obsDatetime).toString()}</td>
                    </tr>
                  )))
                );
              }
              return (
                <tr>
                  <a>
                    <td
                      onClick={() => { props.handleObservationClick(ob.uuid); }}
                    >{ob.concept.display}
                    </td>
                  </a>
                  <td>{ob.value}</td>
                  <td>{new Date(ob.obsDatetime).toString()}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
};

Observations.propTypes = {
  stateData: PropTypes.object.isRequired,
  handleObservationClick: PropTypes.func,
};

export default Observations;
