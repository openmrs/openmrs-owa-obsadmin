import React from 'react';
import { expect } from 'chai';
import Enzyme from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { VisitsAndEncounters } from '../../app/js/components/visitsAndEncounters.jsx';
Enzyme.configure({ adapter: new Adapter() });

describe('<VisitsAndEncounters />', () => {
  it('renders VisitsAndEncounters component', () => {
    const wrapper = shallow(<VisitsAndEncounters />);
    expect(wrapper.find('div')).to.have.length(1);
  });

  it('Should render a nav', () => {
    const wrapper = shallow(<VisitsAndEncounters />);
    expect(wrapper.find("Nav")).to.have.length(1);
  });
  it('Should render a table', () => {
    const wrapper = shallow(<VisitsAndEncounters />);
    expect(wrapper.find("Table")).to.have.length(2);
  });
  it('Should render the NavLink tag', () => {
    const wrapper = shallow(<VisitsAndEncounters />);
    expect(wrapper.find("NavLink")).to.have.lengthOf.at.least(2);
  });
  it('Should render a nav item tag', () => {
    const wrapper = shallow(<VisitsAndEncounters />);
    expect(wrapper.find("NavItem")).to.have.length(2);
  });

  it('Should render atleast four th tags', () => {
    const wrapper = shallow(<VisitsAndEncounters />);
    expect(wrapper.find("th")).to.have.lengthOf.at.least(4);
  });

});
