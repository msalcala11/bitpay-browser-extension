/* eslint-disable jsx-a11y/no-autofocus */
import './phone.scss';
import React, { useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { resizeToFitPage } from '../../../services/frame';
import { trackComponent } from '../../../services/analytics';
import ActionButton from '../../components/action-button/action-button';

const Phone: React.FC<RouteComponentProps & {
  phone?: string;
  setPhone: Dispatch<SetStateAction<string>>;
}> = ({ phone, setPhone }) => {
  console.log(phone, setPhone);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizeToFitPage(ref, 170);
  }, [ref]);
  return (
    <div className="settings account">
      <div ref={ref}>
        <div className="account__zero-state">
          <div className="account__title">Enable Contactless?</div>
          <div className="account__body" style={{ marginBottom: 0 }}>
            Add a phone number to connect this card to Apple Pay or Google Pay.
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div className="settings-group">
            <div className="settings-group__label">Phone Number</div>
            <div className="settings-group__input">
              <input type="tel" defaultValue={phone} placeholder="Phone Number" autoFocus required />
            </div>
            <div className="settings-group__caption">Only a United States phone number can be used</div>
          </div>
        </div>
        <div className="action-button__footer--fixed">
          <Link to={{ pathname: `/payment/` }}>
            <ActionButton>Enable Contactless</ActionButton>
          </Link>
          <Link to={{ pathname: `/payment/` }}>
            <div className="secondary-button">Skip</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default trackComponent(Phone, { page: 'phone' });
