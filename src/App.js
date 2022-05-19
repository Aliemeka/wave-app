import * as React from "react";
// import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const wave = () => {};

  return (
    <div className='mainContainer'>
      <div className='dataContainer'>
        <div className='header'>
          <span aria-label='wave' role='img'>
            👋
          </span>{" "}
          Sup!
        </div>

        <div className='bio'>
          I am Emeka and I worked on IOT gadgets and Saas applications so that's
          pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className='waveButton' onClick={wave}>
          Wave at Me
        </button>
      </div>
    </div>
  );
}
