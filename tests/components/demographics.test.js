import React from 'react';
import { expect } from 'chai';
import Enzyme from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Demographics from '../../app/js/components/demographics.jsx';
Enzyme.configure({ adapter: new Adapter() });

describe('Demographics component', () => {
  it('renders the div tag', () => {
    const wrapper = shallow(<Demographics />);
    expect(wrapper.find('div')).to.have.length(13);
  });
  it('Should render a DateTimeField', () => {
    const wrapper = shallow(<Demographics />);
    expect(wrapper.find("DateTimeField")).to.have.length(1);
  });
  it('Should render the label tag', () => {
    const wrapper = shallow(<Demographics />);
    expect(wrapper.find("label")).to.have.lengthOf.at.least(2);
  });
    it('Should render the form', () => {
    const wrapper = shallow(<Demographics />);
    expect(wrapper.find("form")).to.have.lengthOf.at.least(1);
  });
  it('Should render an input tag', () => {
    const wrapper = shallow(<Demographics />);
    expect(wrapper.find("input")).to.have.length(5);
  });
});
