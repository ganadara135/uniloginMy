const EIP1077 = artifacts.require("EIP1077.sol");

module.exports = function(deployer) {
  deployer.deploy(EIP1077);
};
