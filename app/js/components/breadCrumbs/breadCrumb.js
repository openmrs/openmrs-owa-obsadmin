import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import breadCrumb from './breadCrumb.css';
import { Link, browserHistory, withRouter } from 'react-router';

class BreadCrumbComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { location, router } = this.props
    return (
      <div>
        {location.pathname === '/'
          ?
          <Breadcrumb>
            <BreadcrumbItem active> <a id="home"
              href="https://modules-refapp.openmrs.org/openmrs/index.htm">
              <FontAwesome className='fa fa-home' name='home' /></a>
              < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
              Patient Search</BreadcrumbItem>
          </Breadcrumb>
          : (location.pathname.includes('/patient/') && location.pathname.includes('/visit/')) ?
            <Breadcrumb>
              <BreadcrumbItem id="visited" onClick={router.goBack}> <a id="home"
                href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                <FontAwesome className='fa fa-home' name='home' /></a>
                < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                Patient Search</BreadcrumbItem>
              <BreadcrumbItem id="visited" onClick={router.goBack}>
                <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                Patient Data</BreadcrumbItem>
              <BreadcrumbItem active>
                <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                Manage Visit</BreadcrumbItem>
            </Breadcrumb>
            : location.pathname.includes('/patient/') &&
              location.pathname.includes('/encounter/') && location.pathname.includes('obs') ?
              <Breadcrumb>
                <BreadcrumbItem onClick={router.goBack}>
                  <a id="home" href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                    <FontAwesome className='fa fa-home' name='home' /></a>
                  < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                  Patient Search</BreadcrumbItem>
                <BreadcrumbItem onClick={router.goBack}>
                  <FontAwesome name='chevron-right' className='fa fa-chevron-right' />Patient Data</BreadcrumbItem>
                <BreadcrumbItem onClick={router.goBack}>
                  <FontAwesome name='chevron-right' className='fa fa-chevron-right' />Manage Encounter</BreadcrumbItem>
                <BreadcrumbItem active> <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                  Manage Observation</BreadcrumbItem>
              </Breadcrumb>
              : (location.pathname.includes('/patient/') && location.pathname.includes('encounter')) ?
                <Breadcrumb>
                  <BreadcrumbItem onClick={router.goBack}>
                    <a id="home" href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                      <FontAwesome className='fa fa-home' name='home' /></a>
                    < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                    Patient Search</BreadcrumbItem>
                  <BreadcrumbItem onClick={router.goBack}>
                    <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                    Patient Data</BreadcrumbItem>
                  <BreadcrumbItem active>
                    <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                    Manage Encounter</BreadcrumbItem>
                </Breadcrumb>
                :
                <Breadcrumb>
                  <BreadcrumbItem onClick={router.goBack}>
                    <a id="home" href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                      <FontAwesome className='fa fa-home' name='home' /></a>
                    < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                    Patient Search</BreadcrumbItem>
                  <BreadcrumbItem active >
                    < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                    Patient Data</BreadcrumbItem>
                </Breadcrumb>
        }
      </div>
    );
  }
}

export default withRouter(BreadCrumbComponent);
