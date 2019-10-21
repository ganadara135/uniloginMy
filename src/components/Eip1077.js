

import Web3 from 'web3';
import React, { Component } from 'react';
import EIP1077Credentials from '../libs/EIP1077Credentials';
import PrivateKeySign from '../libs/PrivateKeySign';
import EIP1077Payload from '../libs/EIP1077Payload';
import ethUtils from 'ethereumjs-util';

const ABI = [
    {
        "constant": true,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_pubKey",
            "type": "bytes32"
          },
          {
            "name": "_messageHash",
            "type": "bytes32"
          },
          {
            "name": "_signedHash",
            "type": "bytes"
          }
        ],
        "name": "verifySignature",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_pubKey",
            "type": "bytes32"
          },
          {
            "name": "_messageHash",
            "type": "bytes32"
          },
          {
            "name": "_signedHash",
            "type": "bytes"
          }
        ],
        "name": "verifySignatureNoPrefix",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_pubKey",
            "type": "bytes32"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "Read",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "Write",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "Ping",
        "type": "event"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_operationType",
            "type": "uint256"
          },
          {
            "name": "_gas",
            "type": "uint256"
          },
          {
            "name": "_messageHash",
            "type": "bytes32"
          },
          {
            "name": "_signedHash",
            "type": "bytes"
          }
        ],
        "name": "EIP1077Request",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_pubKey",
            "type": "bytes32"
          }
        ],
        "name": "createIdentity",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "getIdentityForAccount",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
];

//const web3 = new Web3(new Web3.providers.HttpProvider("https://localhost:8545"));
const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
// const CONTRACT_ADDRESS = "0x6adD67320A0D86F65B2f8e0bD24F2576f49fC5A4";       // 기존에 배포한 컨트랙트 주소 rinkeby 에 살아 있음
//const CONTRACT_ADDRESS = "0xA40F3cE44deF9f3F53AF117Fe5305B3519bDE08b";
const CONTRACT_ADDRESS = "0xf250AF8Df702ab76eBf67C0CB4028DE5a2ACf4fE";

class Eip1077 extends Component {

    state = {
        account: null,
        publicKey: null,
        privateKey: null,
        data: "",
        contract: null,
        id: "",
        transactionInfo : {},
        action: 0,
      }

    constructor(props) {
      super(props)
      this.createId = this.createId.bind(this);
      this.sendAction = this.sendAction.bind(this);
      
    }

    createId(e){
        var { account, publicKey, privateKey} = EIP1077Credentials(this.state.id);
        const Contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS,{ from:account });
        this.setState({account: account, publicKey: publicKey, privateKey: privateKey, contract: Contract});
    }

    sendAction(action, e) {

        this.setState({transactionInfo: {}, action: 0});  
        // actions: 1=read,2=write,3=ping
        var payload = EIP1077Payload(this.state.account, CONTRACT_ADDRESS, action);

        console.log("payload : ", payload)
        //console.log("web3.utils.hexToBytes(payload) : ", web3.utils.hexToBytes(payload))
        //console.log("payload.slice(2) : ", payload.slice(2))
        
        var transactionHash = this.toByteArray(payload).slice(1);
        var bufferedHash = new Buffer(transactionHash);

        // Gets transaction and signed transaction hashes
        var hashes = PrivateKeySign(payload, this.state.account, this.state.privateKey, bufferedHash);
        
        // Objet to send to Server/Contract
        const jsonObject = {
            _to: CONTRACT_ADDRESS,
            _from: this.state.account,
            _operationType: action,
            _gas: 0,
            _messageHash: hashes.transactionHash,              
            //_messageHash: payload.slice(2),
            //_messageHash: bufferedHash,
            //_signedHash: hashes.signedTransactionHash.slice(2),           
            _signedHash: hashes.signedTransactionHash,
            _payload: payload,
        }
        // console.log("jsonObject : ", jsonObject);
        // console.log("hashes.transactionHash : ", ...hashes.transactionHash)
        // console.log("hashes.signedTransactionHash : ", hashes.signedTransactionHash)


        // console.log("sendAction()")
        // console.log("this.state.contract : ",this.state.contract)
        // console.log("this.state.contract.methods : ",this.state.contract.methods)
    //    function EIP1077Request(address _account, uint _operationType, uint _gas, bytes32 _messageHash, bytes _signedHash) external returns (bool) {
        // Send info to Contract
        if (this.state.contract.methods){
            if (this.state.contract.methods.EIP1077Request !== undefined){
            this.state.contract.methods.EIP1077Request(
                this.state.account, 
                action, 
                0,
                hashes.transactionHash, 
                //payload.slice(2),
                //bufferedHash,
                hashes.signedTransactionHash)
            .call()
            .then( response => console.log(response));
            }   else {
                alert("EIP1077Request method not available in contract");
            }
        } else {
            alert("Create Account First");
        }

        this.setState({transactionInfo: jsonObject, action: action});         
    }

    stringToArray(bufferString) {
        let uint8Array = new TextEncoder("utf-8").encode(bufferString);
        return uint8Array;
    }

    toHexString(byteArray) {
        return Array.prototype.map.call(byteArray, function(byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
      }

    toByteArray(hexString) {
        var result = [];
        while (hexString.length >= 2) {
          result.push(parseInt(hexString.substring(0, 2), 16));
          hexString = hexString.substring(2, hexString.length);
        }
        return result;
      }

    handleOnchangeId = (e) => {
        this.setState({id: e.target.value});
    }

    signUpToContract = () => {

        console.log("this.state.contract : ",this.state.contract)
        console.log("this.state.contract.methods : ",this.state.contract.methods)

       if (this.state.contract && this.state.contract.methods){
           if (this.state.contract.methods.signTo !== undefined){
           this.state.contract.methods.signTo(this.state.account, this.state.publicKey)
           .call()
           .then( response => console.log(response));
            } else {
                alert("Account: " + this.state.account + " with public key: " + this.toHexString(this.state.publicKey) + " wants to sign up. But 'Sign up' method not available in server or solidity contract");
        }
       } else {
           alert("Create Account First");
       }
    }



    render(){
    return(
    <div className="container">
    <h1>Send a signed transaction to Contract</h1>

    <div className="row">
    <p>1. Create a new login ID:</p>
    <input className="login-field" type="text" value={this.state.id} onChange={this.handleOnchangeId}/>
    <button className="login-btn" onClick={this.createId}>Generate Credentials</button>
    </div>

    <div className="row">
    <h3>Your New Account Info:</h3>
    <p>Id : {this.state.id}</p>
    <p>Address : {this.state.account}</p>
    <p>Public Key : {this.state.publicKey}</p>
    <p>Private Key: {this.state.privateKey}</p>
    </div>

    <p>2. Sign up to Dapp:</p>
    <p style={{fontSize:"10px"}}>Sends your new account and public key to the factory contract:</p>
    <button onClick={this.signUpToContract}>Sign up</button>

 
    <p>3. Send Actions:</p>
    <div>
    <p>What action would you like to send along?</p>
    <input type="button" onClick={(e) => {this.sendAction(11111)}} value="READ()"/>
    <input type="button" onClick={(e) => {this.sendAction(22222)}} value="WRITE()"/>
    <input type="button" onClick={(e) => {this.sendAction(32222)}} value="PING()"/>
    </div>
    <div>
       <textarea value={JSON.stringify(this.state.transactionInfo, undefined, 4)} style={{width:"700px", height:"500px"}}/>
    </div>
  

    </div>
    )}
}

  export default Eip1077;
