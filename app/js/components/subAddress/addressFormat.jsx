import React from 'react';

const AddressFormat = ({ formatString, address }) => {
  let addressString = '';
  if (formatString && formatString.constructor === Array && formatString.length > 0) {
    for (let i = 0, len = formatString.length; i < len; i++) {
      if (formatString[i].indexOf(" ") > -1) {
        const lineAddress = formatString[i].split(" ");
        let valueHolder = '';
        for (let ii = 0, len2 = lineAddress.length; ii < len2; ii++) {
          valueHolder += address[lineAddress[ii]] ? `${address[lineAddress[ii]]}, ` : '';
        }
        addressString += valueHolder.substr(0, valueHolder.lastIndexOf(','));
        addressString += '<br />';
      } else {
        addressString += address[formatString[i]] ? `${address[formatString[i]]} <br>` : '';
      }
    }
    return (<div>
      <div className="form-horizontal">
        <div className="form-group ">
          <div className="col-sm-10 control-label custom-label"
            dangerouslySetInnerHTML={{ __html: addressString }} />
          <div className="col-sm-2 control-label"></div>
        </div>
      </div>
    </div>)
  } else {
    addressString = `${address.address}<br>${address.address2}<br>${address.cityVillage}
    ${address.stateProvince} ${address.country} ${address.postalCode}`;
    addressString += address.address1 ? `${address.address1}<br>` : '';
    addressString += address.address2 ? `${address.address2}<br>` : '';
    addressString += address.cityVillage ? `${address.cityVillage}, ` : '';
    addressString += address.stateProvince ? `${address.stateProvince}, ` : '';
    addressString += address.country ? `${address.country}, ` : '';
    addressString += address.postalCode ? `${address.postalCode}` : '';
    return (<div>
      <div className="form-horizontal">
        <div className="form-group ">
          <div className="col-sm-10 control-label custom-label"
            dangerouslySetInnerHTML={{ __html: addressString }} />
          <div className="col-sm-2 control-label"></div>
        </div>
      </div>
    </div>)
  }
}

export default AddressFormat;