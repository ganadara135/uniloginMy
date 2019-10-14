
/**
 * @PrivateKeySign
 * Takes a private key and a data payload, signs the data with private key
 *
 * Returns a signed and unsigned data payload
 */
import ethUtils from 'ethereumjs-util';
import web3 from 'web3';

//const PrivateKeySign = ( _data, _account, _privateKey, _transactionHash) => {
  const PrivateKeySign = ( _data, _account, _privateKey) => {
  const header = '0x19'
  const version = '0'


  const _transactionHash = ethUtils.keccak256(header, version, _account, _data);
   const _signedTransactionHash = ethUtils.ecsign(_transactionHash, _privateKey);

    console.log(" _transactionHash : ", _transactionHash)

  // console.log(" _signedTransactionHash : ", _signedTransactionHash)
  

  //  // const hexVal_1 = ethUtils.bufferToHex(_transactionHash);
  //  const hexVal_1 = web3.utils.bytesToHex(_transactionHash);

  
  //  console.log(" hexVal_1 : ", hexVal_1);

   
    const hexVal_2 = web3.utils.toHex(_signedTransactionHash);
  

  // // //const buf = Buffer.from(_transactionHash);

  
  //  console.log(" hexVal_2 : ", hexVal_2)

  // // //console.log(" _signedTransactionHash : ", new Buffer(_signedTransactionHash))

  //return {transactionHash: hexVal_1, signedTransactionHash: hexVal_2};
  return {transactionHash: _transactionHash, signedTransactionHash: hexVal_2};
}

export default PrivateKeySign;
