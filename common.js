const testMode = false;
const netType = 2;

let web3;
let web3Modal;
let provider;
let TronProvider;
let selectedAccount;
let selectedTronAccount;

let bsc_bridgeContractAddress = testMode ? "0x3c212EDFE57AaB6a749703B859455F67D00A782a" : "0x775004b011B33aAc8D181F5081a2c8f6C49A6f80";
let trc_bridgeContractAddress = testMode ? "TA4nhZCQWBuuPRmrYZxFEENnMZmFqzsEFm" : "TQKE95przRqPijTRb59nKwhRCwyENkFzCt";


let bsc_xbxContractAddress = testMode ? "0xc3588db74bf736Ee0FeB050fd64F24Baa78Da72C" : "0xB80E66ac87610F5079596833e3C533De285101FF";
let trc_xbxContractAddress = testMode ? "TKJQ5FE3ntjPFveJ8wWa4MQNtF2MjRQqZP" : "TZAyGouBq3DYLe5VPHyjSDyCxQmXRCdCD3";
