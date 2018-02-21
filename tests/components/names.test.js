import React from 'react';
import { expect } from 'chai';
import Enzyme from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Names from '../../app/js/components/names.jsx';
Enzyme.configure({ adapter: new Adapter() });

describe('Names Component', () => {
  it('renders the div tags', () => {
    const wrapper = shallow(<Names />);
    expect(wrapper.find('div')).to.have.length(10);
  });
   it('renders the form', () => {
    const wrapper = shallow(<Names />);
    expect(wrapper.find('form')).to.have.length(1);
  });
   it('renders the label tags', () => {
    const wrapper = shallow(<Names />);
    expect(wrapper.find('label')).to.have.length(4);
  });

  it('Should render buttons', () => {
    const wrapper = shallow(<Names />);
    expect(wrapper.find("button")).to.exist;
  });

  it('Should render input tags', () => {
    const wrapper = shallow(<Names />);
    expect(wrapper.find("input")).to.have.lengthOf.at.least(2);
  });

});
