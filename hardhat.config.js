require("@nomiclabs/hardhat-waffle");


module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    // ...其他网络配置
  },
};

// set proxy

const { ProxyAgent, setGlobalDispatcher } = require("undici");

const proxyAgent = new ProxyAgent('http://192.168.48.1:1080'); // change to yours

setGlobalDispatcher(proxyAgent);
