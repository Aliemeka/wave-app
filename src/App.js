import React, { useEffect, useState } from "react";
import Toast from "./component/Toast";
import { ethers } from "ethers";
import { abi } from "./utils/abi";
import "./App.css";

export default function App() {
  const contractAddress = "0x3a1FB37f392Ea0b2d2274FE870f85ec8399277A1";

  const [show, setShow] = useState(false);
  const [canConnect, setCanConnect] = useState(false);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMining, setIsMining] = useState(false);

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

        const waveTxn = await wavePortalContract.oyaWave("👋 Hi!", {
          gasLimit: 300000,
        });
        setIsMining(true);
        popUpModal(`⛏ Mining... ${waveTxn.hash}`);

        await waveTxn.wait();
        popUpModal(`✨ Mined --  ${waveTxn.hash}`);
        setIsMining(false);

        let count = await wavePortalContract.getTotalWaves();
        popUpModal(`Your wave is #${count.toNumber()}`);
        // await getAllWaves();
      } else {
        popUpModal("Ethereum object doesn't exist!");
      }
    } catch {
      setIsMining(false);
      popUpModal("Sorry! You cannot wave right now 😭");
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

        // Display the waves
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });
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
          setCanConnect(false);
          setCurrentAccount(accounts[0]);
          setShow(false);
        } else {
          console.log("No authorized account found");
          setMessage("You need to connect your wallet");
          setCanConnect(true);
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

  useEffect(() => {
    if (currentAccount) {
      getAllWaves();
    }
  }, [currentAccount]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length) {
        const account = accounts[0];
        setCurrentAccount(account);
        popUpModal(`Connected with account: ${account}`);
        setCanConnect(false);
      } else {
        popUpModal("Can't connect to wallet");
      }
    } catch (error) {
      setCanConnect(true);
      popUpModal("Failed to connect wallet");
    }
  };

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      popUpModal(
        `${timestamp} waved ${message} at ${new Date(timestamp * 1000)}`
      );
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, abi, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

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

        <button
          className='waveButton'
          onClick={wave}
          disabled={canConnect || isMining}
        >
          {isMining ? "⛏ Mining" : "👋 Wave at Me"}
        </button>
        {canConnect && !currentAccount ? (
          <button className='waveButton connect' onClick={connectWallet}>
            <span aria-label='wave' role='img'>
              🔗
            </span>{" "}
            Connect Wallet
          </button>
        ) : null}
        {allWaves.length ? (
          <>
            <h3 className='header3'>Waves so far</h3>
            {allWaves.map((wave, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "OldLace",
                    marginTop: "16px",
                    padding: "8px",
                    borderRadius: "2px",
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
          </>
        ) : null}
      </div>
    </div>
  );
}
