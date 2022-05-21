import React, { useEffect, useState } from "react";
import Toast from "./component/Toast";
import { ethers } from "ethers";
import { abi } from "./utils/abi";
import "./App.css";

export default function App() {
  const contractAddress = "0xad124C49975f28e97Ae5322eA8ddAf2943434F6C";

  const [show, setShow] = useState(false);
  const [canConnect, setCanConnect] = useState(false);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");

  const [allWaves, setAllWaves] = useState([]);

  const popUpModal = (messageToShow) => {
    setShow(true);
    setLink("#/");
    setMessage(messageToShow);
    setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );

        const waveTxn = await wavePortalContract.oyaWave("👋 Hi!");
        popUpModal(`⛏ Mining... ${waveTxn.hash}`);

        await waveTxn.wait();
        popUpModal(`✨ Mined --  ${waveTxn.hash}`);

        let count = await wavePortalContract.getTotalWaves();
        popUpModal(`Your wave is #${count.toNumber()}`);
        await getAllWaves();
      } else {
        popUpModal("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length !== 0) {
          setCanConnect(true);
          setShow(false);
        } else {
          console.log("No authorized account found");
          setMessage("No authorized account found");
          setCanConnect(false);
          setLink("#/");
          setShow(true);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (window.ethereum) {
      setShow(false);
      connectWallet();
    } else {
      setShow(true);
      setMessage("⚠️  Make sure you have metamask!");
      setLink("https://metamask.io/download/");
    }
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const account = accounts[0];
      setCurrentAccount(account);
      popUpModal(`Connected with account: ${account}`);
      setCanConnect(false);
    } catch (error) {
      setCanConnect(true);
      popUpModal("Failed to connect wallet");
    }
  };

  return (
    <div className='mainContainer'>
      <Toast link={link} message={message} show={show} />
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
          <span aria-label='wave' role='img'>
            👋
          </span>{" "}
          Wave at Me
        </button>
        {canConnect ? (
          <button className='waveButton connect' onClick={connectWallet}>
            <span aria-label='wave' role='img'>
              🔗
            </span>{" "}
            Connect Wallet
          </button>
        ) : null}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>From: {wave.address}</div>
              <div>
                <span aria-label='time' role='img'>
                  🕰
                </span>
                : {wave.timestamp.toString()}
              </div>
              <div>
                <span aria-label='message' role='img'>
                  ✉️
                </span>
                : {wave.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
