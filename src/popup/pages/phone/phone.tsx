import './phone.scss';
import React, { useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { resizeToFitPage } from '../../../services/frame';
import { trackComponent } from '../../../services/analytics';

const Phone: React.FC<RouteComponentProps & {
  phone?: string;
  setPhone: Dispatch<SetStateAction<string>>;
}> = ({ phone, setPhone }) => {
  console.log(phone, setPhone);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizeToFitPage(ref, 49);
  }, [ref]);
  return (
    <div className="settings account">
      <div ref={ref}>
        <div className="account__zero-state">
          <div className="account__title">Enable Contactless?</div>
          <div className="account__body">Add a phone number to connect this card to Apple Pay or Google Pay.</div>
        </div>
      </div>
    </div>
  );
};

export default trackComponent(Phone, { page: 'phone' });
