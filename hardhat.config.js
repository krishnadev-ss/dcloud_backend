require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    ganache: {
        url: "http://127.0.0.1:7545",
        accounts: ["0x18165d960f3b359d97eaf307f6112d41406398371e74bb9689315c2c7f5b3539"]
    }
  }
};
