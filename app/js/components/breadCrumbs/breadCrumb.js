import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import breadCrumb from './breadCrumb.css';
import { Link, browserHistory, withRouter } from 'react-router';

class BreadCrumbComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleRoute=this.handleRoute.bind(this)
  }
  handleRoute(e){
    if(e.currentTarget.dataset.id === "search"){
      let current_url=this.props.location.pathname;
      let url = current_url.substring(0,current_url.indexOf('patient'));
      this.props.router.push(url);
    };
    if(e.currentTarget.dataset.id == "patient_visit"){
      let current_url=this.props.location.pathname;
      let url = current_url.substring(0,current_url.indexOf('visit'));
      this.props.router.push(url);
    };
    if(e.currentTarget.dataset.id == "patient-encounter"){
      let current_url=this.props.location.pathname;
      let url = current_url.substring(0,current_url.indexOf('encounter'));
      this.props.router.push(url);
    };
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
               Search</BreadcrumbItem>
          </Breadcrumb>
          : (location.pathname.includes('/patient/') && location.pathname.includes('/visit/')) ?
            <Breadcrumb>
              <BreadcrumbItem data-id="search" onClick={this.handleRoute}> <a id="home"
                href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                <FontAwesome className='fa fa-home' name='home' /></a>
                < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                 Search</BreadcrumbItem>
              <BreadcrumbItem data-id="patient_visit" onClick={this.handleRoute}>
                <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                Patient Data</BreadcrumbItem>
              <BreadcrumbItem active>
                <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                Manage Visit</BreadcrumbItem>
            </Breadcrumb>
            : location.pathname.includes('/patient/') &&
              location.pathname.includes('/encounter/') && location.pathname.includes('obs') ?
              <Breadcrumb>
                  <BreadcrumbItem data-id="search" onClick={this.handleRoute}>
                    <a id="home" href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                      <FontAwesome className='fa fa-home' name='home' /></a>
                    < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                    Search</BreadcrumbItem>
                  <BreadcrumbItem data-id="patient-encounter" onClick={this.handleRoute}>
                    <FontAwesome name='chevron-right' className='fa fa-chevron-right' />Patient Data
                    </BreadcrumbItem>
                  <BreadcrumbItem onClick={router.goBack}>
                    <FontAwesome name='chevron-right' className='fa fa-chevron-right' />Manage Encounter</BreadcrumbItem>
                  <BreadcrumbItem active> <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                    Manage Observation</BreadcrumbItem>
              </Breadcrumb>
              : (location.pathname.includes('/patient/') && location.pathname.includes('encounter')) ?
                <Breadcrumb>
                    <BreadcrumbItem data-id="search" onClick={this.handleRoute}>
                      <a data-id="search" href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                        <FontAwesome className='fa fa-home' name='home' /></a>
                      < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                      Search</BreadcrumbItem>
                    <BreadcrumbItem data-id="patient-encounter" onClick={this.handleRoute}>
                      <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                      Patient Data</BreadcrumbItem>
                    <BreadcrumbItem active>
                      <FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                      Manage Encounter</BreadcrumbItem>
                </Breadcrumb>
                :
                <Breadcrumb>
                    <BreadcrumbItem data-id="search" onClick={this.handleRoute}>
                      <a id="home" href="https://modules-refapp.openmrs.org/openmrs/index.htm">
                        <FontAwesome className='fa fa-home' name='home' /></a>
                      < FontAwesome name='chevron-right' className='fa fa-chevron-right' />
                      Search</BreadcrumbItem>
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
