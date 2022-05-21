import React from "react";

import "./Toast.css";

const Toast = ({ message, show, link }) => {
  return show ? (
    <a href={link} target='_blank' rel='noopener noreferrer' className='toast'>
      {message}
    </a>
  ) : null;
};

export default Toast;
