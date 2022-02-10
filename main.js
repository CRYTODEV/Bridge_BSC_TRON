const Web3Modal = window.Web3Modal.default;
const walletConnectProvider = window.WalletConnectProvider.default;

const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

var fiveMinutes = 300;
var gameStatus;
var xbxContractAddress;
var bridgeContractAddress;
var otherChainContractAddress;
var otherChainBridgeContractAddress;

var xbxContract;
var bridgeContract;
var xbxContractForApprove;

var timer = 0;
var timeLeft = 0;
var lastBuyerData = [0,0,0,0,0,0];
var clock;
var myBalance = 0;

var pubChainId = 0;
var showWinnerModalCount = 0;
var initInterval;

var tronInterval;

var strConnectWallet = "<i class=\"fas fa-wallet pr-1\"></i>Connect Wallet";
var strDisconnectWallet = "<i class=\"fas fa-sign-out-alt\"></i>Disconnect Wallet";

var xbxBalance = 0;
var otherXbxBalance = 0;

var fromAmount = 0;
var toAmount = 0;

var wrongNetworkCount = 0;
var wrongMainBinanceNetworkCount = 0;
var wrongTestBinanceNetworkCount = 0;
var wrongMainEtherNetworkCount = 0;
var wrongTestEtherNetworkCount = 0;
var swapButtonClickCount = 0;
var approveButtonClickCount = 0;

const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const minSwapAmount = 100;
var transactionFee = 0;

var tronFee = 1;
var binanceFee = 0.005;
var tronPrice = 0;
var bnbPrice = 0;

var tmp_xbxBalance = 0;
var tmp_otherXbxBalance = 0;





var minimumBNBAmount = 0;
var minimumPrizeAmount = 0;

var web3BaseUrl_other;
var web3_other;

var web3BaseUrl_main;
var web3_main;

var tronLinkStatus = false;
var validAddress = false;  





window.addEventListener('load', async () => {

	init();

   // var innerWidth = window.innerWidth;
   // var innerHeight = window.innerHeight;
   //  var casinoWidth = Math.min(innerWidth, innerHeight);
   //  $("html").css("font-size", casinoWidth / 1200 * 18 + 'px');
   // $("#wait-body").css("min-height", innerHeight);
});

async function onConnect() {
  try {

      if(jQuery('.from-network-tag').html() == 'TRC20') {
         jQuery('#tronWalletModal').modal('show');

      } else {

         provider = await web3Modal.connect();

         disableConnectWalletButton();

         wrongNetworkCount = 0;
         wrongMainBinanceNetworkCount = 0;
         wrongTestBinanceNetworkCount = 0;
         wrongMainEtherNetworkCount = 0;
         wrongTestEtherNetworkCount = 0;
         swapButtonClickCount = 0;
         approveButtonClickCount = 0;

         fetchAccountData();
         initInterval = setInterval(function () {
            getDataInfo();
         }, 3000);
   	   
         disbleChangeNetwork();
      }


  } catch(e) {
    console.log("Could not get a wallet connection", e);
    onDisconnect();
    return;
  }

  if(jQuery('.from-network-tag').html() == 'ERC20') {
     // Subscribe to accounts change
     provider.on("accountsChanged", (accounts) => {
       fetchAccountData();
     });

     // Subscribe to chainId change
     provider.on("chainChanged", (chainId) => {
       fetchAccountData();
     });

     // Subscribe to networkId change
     provider.on("networkChanged", (networkId) => {
       fetchAccountData();
     });
  }
}

function disableConnectWalletButton() {
   $("#btn-connect-wallet").addClass("disabled");
   $("#btn-connect-wallet").html("<i class='fas fa-sync-alt'></i>SWAP");
   $(".connect-wallet").addClass("no-event");
   $(".connect-wallet").html("<i class='fas fa-spinner'></i> Connecting...");
}

async function connectTronWallet() {

   try {

      if(window.tronWeb == undefined) {
         Swal.fire({
           icon: 'error',
           title: 'TronLink Wallet',
           text: 'Please install TronLink Wallet'
         })
         return;
      }

      if (window.tronWeb.ready) {

            disableConnectWalletButton();
            tronLinkStatus = true;
            fetchAccountData();

            tronInterval = setInterval(function () {
               fetchAccountData();
            }, 3000);

       } else {
         Swal.fire({
           icon: 'error',
           title: 'TronLink Wallet',
           text: 'Please login to TronLink wallet first.'
         })
         return;
       }

   } catch(exception) {

   }

   disbleChangeNetwork();

}

function disbleChangeNetwork() {
   $('.p-bridge-swap').addClass("no-event");
}

function enableChangeNetwork() {
   $('.p-bridge-swap').removeClass("no-event");
}

async function onDisconnect() {
  if(provider || TronProvider) {
      try{
         await provider.close();
         await TronProvider.close();
      } catch(e) {
         
      }
      await web3Modal.clearCachedProvider();
      provider = null;
      TronProvider = null;

   	jQuery("#myBalance").html("0.00");
      jQuery("#chainType").html("0.00");
      $("#myBalance").css("display", "none");
      $("#myAccount").css("display", "none");
      $(".btn-connect-wallet").removeAttr("disabled");
      $(".btn-connect-wallet").removeClass("disabled");
      $(".fromAmount").html("0");
      $(".toAmount").html("0");
      jQuery("#input-amount").val(0);
      $(".bottom-error").show();
      jQuery("#btn-connect-wallet").removeAttr("onclick");
      jQuery("#btn-connect-wallet").removeClass("disabled");
      jQuery("#btn-connect-wallet").attr("data-bs-toggle");
      jQuery("#btn-connect-wallet").addClass("btn-connect-wallet");
      jQuery("#btn-connect-wallet").attr("onclick", "connectWallet()");
      jQuery(".from-network-status").hide();
      xbxBalance = 0;

      jQuery(".connect-wallet").html(strConnectWallet);
      jQuery("#btn-connect-wallet").html(strConnectWallet);
      jQuery("#xbxBalance").html(0);
      jQuery("#selectMax").attr("disabled", "true");

      jQuery('#tron-destination').addClass("hidden");
      jQuery('#bsc-destination').addClass("hidden");

      selectedAccount = '';
      selectedTronAccount = '';

      jQuery(".connect-wallet").removeClass('no-event');
  }
  selectedAccount = null;
  pubChainId = 0;
  tronLinkStatus = false;
  enableChangeNetwork();
  clearInterval(tronInterval);
  clearInterval(initInterval);
}
async function fetchAccountData() {

   try {
      jQuery(".bottom-error").css("display", "none");
      var unit = "ETH";

      TronProvider = TronWeb.providers.HttpProvider;

      if(tronLinkStatus) {
         pubChainId = testMode ? 99 : 100;
         const account = await window.tronLink.request({method: 'tron_requestAccounts'});
         selectedTronAccount = await window.tronWeb.defaultAddress.base58;
      } else {
         web3 = new Web3(provider);
         const chainId = await web3.eth.getChainId();
         const chainData = evmChains.getChain(chainId);

         pubChainId = chainId;

         if(pubChainId == 56 || pubChainId == 97) {
            jQuery("#tron-destination").removeClass("hidden");
            const accounts = await web3.eth.getAccounts();
            selectedAccount = accounts[0];
            xbxContractAddress = bsc_xbxContractAddress;
            bridgeContractAddress = bsc_bridgeContractAddress;
            otherChainContractAddress =  trc_xbxContractAddress;
            otherChainBridgeContractAddress = trc_bridgeContractAddress;
            unit = "BNB";

            web3BaseUrl_main = testMode ? 'https://speedy-nodes-nyc.moralis.io/28eb04c22a0f92b22765e175/bsc/testnet' : 'https://speedy-nodes-nyc.moralis.io/28eb04c22a0f92b22765e175/bsc/mainnet';
            web3_main = new Web3(new Web3.providers.HttpProvider(web3BaseUrl_main));

            xbxContract = new web3_main.eth.Contract(rktxAbi, xbxContractAddress);

            otherXbxContract = await tronWeb.contract(rktxAbi, otherChainContractAddress);

            // my account and balance
            myBalance = await web3_main.eth.getBalance(selectedAccount);
            jQuery("#myBalance").html("<i class=\"fas fa-coins pr-1\"></i>" + parseFloat(web3.utils.fromWei(myBalance, "ether")).toFixed(3) + " " + unit);
            jQuery("#myAccount").html("<i class=\"fas fa-wallet pr-1\"></i>" + selectedAccount.substr(0, 7) + "..." + selectedAccount.substr(selectedAccount.length-4, selectedAccount.length));
         }
      }

      if(pubChainId == 99 || pubChainId == 100) {
         jQuery("#bsc-destination").removeClass("hidden");
         xbxContractAddress = trc_xbxContractAddress;
         bridgeContractAddress = trc_bridgeContractAddress;
         otherChainContractAddress =  bsc_xbxContractAddress;
         otherChainBridgeContractAddress = bsc_bridgeContractAddress;
         unit = "TRX";

         web3BaseUrl_main = testMode ? 'https://speedy-nodes-nyc.moralis.io/28eb04c22a0f92b22765e175/bsc/testnet' : 'https://speedy-nodes-nyc.moralis.io/28eb04c22a0f92b22765e175/bsc/mainnet';
         web3_main = new Web3(new Web3.providers.HttpProvider(web3BaseUrl_main));


         xbxContract = await tronWeb.contract(rktxAbi, xbxContractAddress);
         otherXbxContract = new web3_main.eth.Contract(rktxAbi, otherChainContractAddress);

         // my account and balance
         myBalance = await tronWeb.trx.getBalance(selectedTronAccount);
         jQuery("#myBalance").html("<i class=\"fas fa-coins pr-1\"></i>" + parseFloat(myBalance/1000000).toFixed(3) + " " + unit);
         jQuery("#myAccount").html("<i class=\"fas fa-wallet pr-1\"></i>" + selectedTronAccount.substr(0, 7) + "..." + selectedTronAccount.substr(selectedTronAccount.length-4, selectedTronAccount.length));
      }
      
      

      // alert(chainId);
      // alert(xbxContractAddress);

      chagneOrder(); // network order

     

      if (pubChainId != 56 && pubChainId != 97 && pubChainId != 99 && pubChainId != 100 && wrongNetworkCount < 1) {
         wrongNetworkCount++;
         // alert("Please select bsc network");
         jQuery(".connect-wallet").html(strConnectWallet);
         jQuery("#myAccount").css("display", "none");
         jQuery("#myBalance").css("display", "none");

         Swal.fire({
           icon: 'error',
           title: 'Wrong network',
           text: 'Change network to Binance Smart Chain Network'
         })
         onDisconnect();
         return false;
      } else if(pubChainId == 56 && testMode && wrongTestEtherNetworkCount < 1) {
         wrongTestEtherNetworkCount++;
         onDisconnect();

         Swal.fire({
           icon: 'error',
           title: 'Wrong network',
           text: 'Change network to Binance Test Network'
         })

         return false;

      } else if(pubChainId == 97 && !testMode && wrongMainEtherNetworkCount < 1) {
         wrongMainEtherNetworkCount++;
         onDisconnect();

         Swal.fire({
           icon: 'error',
           title: 'Wrong network',
           text: 'Change network to Binance Smart Chain Network'
         })

         return false;
      } 

      if(tronLinkStatus) { // tron network
         
         tmp_xbxBalance = await xbxContract.balanceOf(selectedTronAccount).call();
         tmp_xbxBalance = tmp_xbxBalance.toString();
         if(selectedAccount != '' && selectedAccount != undefined && validAddress) {
            tmp_otherXbxBalance = await otherXbxContract.methods.balanceOf(selectedAccount).call();
         } else {
            tmp_otherXbxBalance = 0;
         }
         
      } else { // binance network

         tmp_xbxBalance = await xbxContract.methods.balanceOf(selectedAccount).call();
         if(selectedTronAccount != '' && selectedTronAccount != undefined && validAddress) {
            tmp_otherXbxBalance = await otherXbxContract.methods.balanceOf(selectedTronAccount).call();
            tmp_otherXbxBalance =  tmp_otherXbxBalance.toString(); 
         } else {
            tmp_otherXbxBalance = 0;
         }
      }

      xbxBalance = new BigNumber(tmp_xbxBalance).div(new BigNumber(1000000000000000000));
      otherXbxBalance = new BigNumber(tmp_otherXbxBalance).div(new BigNumber(1000000000000000000));   

     

      if(xbxBalance.toNumber() > 0) {
         jQuery("#selectMax").removeAttr("disabled");
         jQuery("#input-amount").removeAttr("disabled");
      } else {
         jQuery("#selectMax").attr("disabled", "true");
         jQuery("#input-amount").attr("disabled", "true");
      }


      jQuery("#xbxBalance").html(xbxBalance.toNumber());
      jQuery("#fromAmount").html(xbxBalance.toNumber());
      jQuery("#toAmount").html(otherXbxBalance.toNumber() == 0 && validAddress ? 0 : otherXbxBalance.toNumber() != 0 && validAddress ? otherXbxBalance.toNumber() : '----' ); 

      jQuery(".connect-wallet").html(strDisconnectWallet);
      jQuery(".connect-wallet").removeClass("no-event");

      jQuery("#myAccount").css("display", "block");
      jQuery("#myBalance").css("display", "block");

      // approve xbx token
      var allowanceAmount;
      var allowance;
      if(tronLinkStatus) {
         allowance = await xbxContract.methods.allowance(selectedTronAccount, bridgeContractAddress).call();
         allowanceAmount = new BigNumber(allowance.toString());
      } else {
         allowance = await xbxContract.methods.allowance(selectedAccount, bridgeContractAddress).call();
         allowanceAmount = new BigNumber(allowance);
      }
     

      if (allowanceAmount.toNumber() <= 0) {
         if(approveButtonClickCount == 0) {
            jQuery("#btn-connect-wallet").removeClass("disabled");
            jQuery("#btn-connect-wallet").removeAttr("onclick");
            jQuery("#btn-connect-wallet").removeAttr("data-bs-toggle");
            jQuery(".btn-connect-wallet").removeClass("btn-connect-wallet");
            jQuery("#btn-connect-wallet").attr("onclick", "approve()");
            jQuery("#btn-connect-wallet").html("<i class='fas fa-check'></i>approve");
         }
      } else {
         if(swapButtonClickCount == 0) {
            jQuery("#btn-connect-wallet").removeAttr("onclick");
            jQuery("#btn-connect-wallet").removeAttr("data-bs-toggle");
            jQuery(".btn-connect-wallet").removeClass("btn-connect-wallet");
            jQuery("#btn-connect-wallet").attr("onclick", "swap()");
            jQuery("#btn-connect-wallet").html("<i class='fas fa-sync-alt'></i>SWAP");
         }
      }


      // bridge
      if(tronLinkStatus) {
         bridgeContract = await tronWeb.contract(bridgeAbi, bridgeContractAddress);
         xbxContractForApprove =  await tronWeb.contract(rktxAbi, xbxContractAddress);
      } else {
         bridgeContract = new web3.eth.Contract(bridgeAbi, bridgeContractAddress);
         xbxContractForApprove =  new web3.eth.Contract(rktxAbi, xbxContractAddress);
      }
      
      // otherBridgeContract = new web3_other.eth.Contract(bridgeAbi, otherChainBridgeContractAddress);
   } catch(exception) {

   }
}



function init(){

   // tron price
   // fetch('https://api.pancakeswap.info/api/v2/tokens/0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b')
   //    .then(response => response.json())
   //    .then(data => {
   //       var price = data.data.price;
   //       price = parseFloat(price);
   //       tronPrice = price.toFixed(7);
   //       console.log(tronPrice)
   //    }
   // );

   // // bnb price
   // fetch('https://api.pancakeswap.info/api/v2/tokens/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c')
   //    .then(response => response.json())
   //    .then(data => {
   //       var price = data.data.price;
   //       price = parseFloat(price);
   //       bnbPrice = price.toFixed(7);
   //       console.log(bnbPrice)
   //    }
   // );


	const providerOptions = {
	    walletconnect: {
	      package: walletConnectProvider,
	      options: {
	        // Mikko's test key - don't copy as your mileage may vary
	        infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
	      }
	    },

	    fortmatic: {
	      package: Fortmatic,
	      options: {
	        // Mikko's TESTNET api key
	        key: "pk_test_391E26A3B43A3350"
	      }
	    }
  	};

  	web3Modal = new Web3Modal({
	    cacheProvider: false, // optional
	    providerOptions, // required
	    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.

  	});

}

async function getDataInfo(){
	if (provider){
      fetchAccountData();
	}
}

jQuery(document).ready(function(){

  	jQuery(".connect-wallet").on("click", function(){
	  	if (provider || TronProvider){
	  		console.log("---Disconnect---")
	  		onDisconnect();
	  		jQuery(".connect-wallet").html(strConnectWallet);
         jQuery("#btn-connect-wallet").html(strConnectWallet);
         jQuery("#input-amount").val(0);
         jQuery("#xbxBalance").html(0);
         jQuery("#selectMax").attr("disabled", "true");
         xbxBalance = 0;
	  	}else{
	  		onConnect();
	  	}

	});
   
});


function connectWallet() {
   if (provider || TronProvider){
      console.log("----Disconnect---")
      onDisconnect();
      jQuery(".connect-wallet").html(strConnectWallet);
      jQuery("#btn-connect-wallet").html(strConnectWallet);
      jQuery("#input-amount").val(0);
      jQuery("#xbxBalance").html(0);
      jQuery(".from-network-status").show();
   }else{
      onConnect();
   }

}


function validInput() {

   var tronAddress = $("#tron-destination-address").val();
   var bscAddress = $("#bsc-destination-address").val();

   if(tronLinkStatus) {
      if(bscAddress.startsWith("0x") && bscAddress.length == 42) {
         selectedAccount = bscAddress;
         validAddress = true;
      } else {
         selectedAccount = "";
         validAddress = false;
      }
   } else {
      if(tronAddress.startsWith("T") && tronAddress.length == 34) {
         selectedTronAccount = tronAddress;
         validAddress = true;
      } else {
         selectedTronAccount = "";
         validAddress = false;
      }
   }

   if(!validAddress) {
      jQuery("#toAmount").html("----");
   }


   if(xbxBalance.toNumber() < 0 || jQuery("#input-amount").val() > xbxBalance.toNumber()) {
      return false;
   } else if(jQuery("#input-amount").val() == '') {
         jQuery("#btn-connect-wallet").addClass("disabled");
   } else {
      if(jQuery("#input-amount").val() > 0 && validAddress) {
         jQuery("#btn-connect-wallet").removeClass("disabled");
         jQuery("#btn-connect-wallet").removeAttr("onclick");
         jQuery("#btn-connect-wallet").removeAttr("data-bs-toggle");
         jQuery(".btn-connect-wallet").removeClass("btn-connect-wallet");
         jQuery("#btn-connect-wallet").attr("onclick", "swap()");
      } else {
         jQuery("#btn-connect-wallet").addClass("disabled");
         jQuery("#btn-connect-wallet").removeAttr("onclick");
         jQuery("#btn-connect-wallet").attr("data-bs-toggle");
         jQuery("#btn-connect-wallet").addClass("btn-connect-wallet");
         jQuery("#btn-connect-wallet").attr("onclick", "connectWallet()");
      }
   }


}

async function swap() {
   var value = jQuery("#input-amount").val();

   if(value < minSwapAmount) {
      Swal.fire({
        icon: 'error',
        title: 'Swap Amount',
        text: 'Please input over ' + minSwapAmount + 'XBX'
      })
      return;
   }
   var amount = new BigNumber(value).multipliedBy(new BigNumber(1000000000000000000));
   swapButtonClickCount++;
   jQuery("#btn-connect-wallet").addClass("disabled");
   jQuery("#btn-connect-wallet").html("processing...");
   jQuery("#input-amount").attr("disabled", "true");
   try {

      var tmpTransactionFee = 0;

      // fee by price

      // if(pubChainId == 99 || pubChainId == 100) {
      //    tmpTransactionFee = new BigNumber(tronFee / tronPrice).multipliedBy(new BigNumber(1000000000000000000))  ;
      // }

      // if(pubChainId == 56 || pubChainId == 97) {
      //    tmpTransactionFee = new BigNumber(binanceFee / parseInt(bnbPrice)).multipliedBy(new BigNumber(1000000000000000000)) ;
      // }

      // fee by manuall

      if(pubChainId == 99 || pubChainId == 100) {
         tmpTransactionFee = new BigNumber(tronFee).multipliedBy(new BigNumber(1000000000000000000))  ;
      }

      if(pubChainId == 56 || pubChainId == 97) {
         tmpTransactionFee = new BigNumber(binanceFee).multipliedBy(new BigNumber(1000000000000000000)) ;
      }

      transactionFee = tmpTransactionFee.toNumber();

      var result;

      if(tronLinkStatus)
         result = await bridgeContract.transferRKTX(netType, selectedAccount, value.concat('000000000000000000')).send(
         {
            from: selectedTronAccount,
            feeLimit:100000000,
            callValue:tronWeb.toSun(parseInt(tronFee)),
            tokenId:0,
            shouldPollResponse:false
         });
      else
         result = await bridgeContract.methods.transferRKTX(netType, selectedTronAccount, amount).send({from: selectedAccount, value: transactionFee});

      swapButtonClickCount = 0;

      if( tronLinkStatus && result) {
         jQuery("#btn-connect-wallet").removeClass("disabled");
         jQuery("#btn-connect-wallet").html("<i class='fas fa-sync-alt'></i>SWAP");
         jQuery("#input-amount").removeAttr("disabled");
         Swal.fire({
           icon: 'success',
           title: 'Success',
           text: 'Completed Swapping Received Amount: ' + value
         })
      }

      
      if( !tronLinkStatus && result.status) {
         jQuery("#btn-connect-wallet").removeClass("disabled");
         jQuery("#btn-connect-wallet").html("<i class='fas fa-sync-alt'></i>SWAP");
         jQuery("#input-amount").removeAttr("disabled");
         Swal.fire({
           icon: 'success',
           title: 'Success',
           text: 'Completed Swapping Received Amount: ' + value
         })
      } else if(!tronLinkStatus && !result.status) {
         jQuery("#btn-connect-wallet").removeClass("disabled");
         jQuery("#btn-connect-wallet").html("<i class='fas fa-sync-alt'></i>SWAP");
         jQuery("#input-amount").removeAttr("disabled");
         Swal.fire({
           icon: 'error',
           title: 'Transaction Fail',
           text: 'Transaction has been rejected'
         })
      }

      fetchAccountData();
   
   } catch(Exception) {

      // alert(Exception.message);

      swapButtonClickCount = 0;
      jQuery("#btn-connect-wallet").removeClass("disabled");
      jQuery("#btn-connect-wallet").html("<i class='fas fa-sync-alt'></i>SWAP");
      jQuery("#input-amount").removeAttr("disabled");
   }


}


 function onlyNumberKey(evt) {      
     // Only ASCII character in that range allowed
     var ASCIICode = (evt.which) ? evt.which : evt.keyCode
     if (ASCIICode > 31 && (ASCIICode < 46 || ASCIICode > 57))
         return false;
     return true;
 }


function selectMax() {
   jQuery("#input-amount").val(xbxBalance);
   validInput();
}


async function changeNetwork() {

   // if(pubChainId == 0) {
   //    Swal.fire({
   //      icon: 'error',
   //      title: 'Connect Wallet',
   //      text: 'Please connect to your wallet'
   //    })
   //    return;
   // }

   if(jQuery(".from-network-tag").html() == "BEP20") {
      jQuery(".from-network-image").removeAttr("src");
      jQuery(".from-network-image").attr("src", "images/trx-icon.svg");
      jQuery(".from-network-tag").html("TRC20");
      jQuery(".from-network-title").html("Tron Network");

      jQuery(".end-network-image").removeAttr("src");
      jQuery(".end-network-image").attr("src", "images/bsc-icon.svg");
      jQuery(".end-network-tag").html("BEP20");
      jQuery(".end-network-title").html("Binance Smart Chain Network");
   } else if(jQuery(".from-network-tag").html() == "TRC20") {
      jQuery(".from-network-image").removeAttr("src");
      jQuery(".from-network-image").attr("src", "images/bsc-icon.svg");
      jQuery(".from-network-tag").html("BEP20");
      jQuery(".from-network-title").html("Binance Smart Chain Network");

      jQuery(".end-network-image").removeAttr("src");
      jQuery(".end-network-image").attr("src", "images/trx-icon.svg");
      jQuery(".end-network-tag").html("TRC20");
      jQuery(".end-network-title").html("Tron Network");
   }



   // if(pubChainId == 1 || pubChainId == 3) {
   //    if(testMode) chainId = 97;
   //    else chainId = 56;
   //    var result = await ethereum.request({
   //       method: 'wallet_switchEthereumChain',
   //       params: [{ chainId: "0x" + parseInt(chainId).toString(16) }],
   //    });
   // } 
   
   // chagneOrder();
}

async function switchNetwork(coin) {


   if(pubChainId == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Connect Wallet',
        text: 'Please connect to your wallet'
      })
      return;
   }


   if(coin == 'eth'){
      $("#ethereum-network div:first").addClass("text-selected");
      $("#bsc-network div:first").removeClass("text-selected");
      $("#eth_status").show();
      $("#bsc_status").hide();
      if(testMode) chainId = 3;
      else chainId = 1;
      var result = await ethereum.request({
         method: 'wallet_switchEthereumChain',
         params: [{ chainId: "0x" + parseInt(chainId).toString(16) }],
      });
   }

   if(coin == 'bnb'){
      $("#ethereum-network div:first").removeClass("text-selected");
      $("#bsc-network div:first").addClass("text-selected");
      $("#eth_status").hide();
      $("#bsc_status").show();
      if(testMode) chainId = 97;
      else chainId = 56;
      var result = await ethereum.request({
         method: 'wallet_switchEthereumChain',
         params: [{ chainId: "0x" + parseInt(chainId).toString(16) }],
      });
   }
   
}

function chagneOrder() {


   if(pubChainId == "1" || pubChainId == "3") {
      jQuery(".from-network-image").removeAttr("src");
      jQuery(".from-network-image").attr("src", "images/bsc-icon.svg");
      jQuery(".from-network-tag").html("ERC20");
      jQuery(".from-network-status").show();
      jQuery(".from-network-status").html("Connected");
      jQuery(".from-network-title").html("Binance Smart Chain Network");

      jQuery(".end-network-image").removeAttr("src");
      jQuery(".end-network-image").attr("src", "images/trx-icon.svg");
      jQuery(".end-network-tag").html("TRO20");
      jQuery(".end-network-title").html("Tron Network");
   }

   if(pubChainId == "99" || pubChainId == "100") {
      jQuery(".from-network-image").removeAttr("src");
      jQuery(".from-network-image").attr("src", "images/trx-icon.svg");
      jQuery(".from-network-tag").html("TRC20");
      jQuery(".from-network-status").show();
      jQuery(".from-network-status").html("Connected");
      jQuery(".from-network-title").html("Tron Network");

      jQuery(".end-network-image").removeAttr("src");
      jQuery(".end-network-image").attr("src", "images/bsc-icon.svg");
      jQuery(".end-network-tag").html("ERC20");
      jQuery(".end-network-title").html("Binance Smart Chain Network");
   }

}


function showNetwork(network) {
   if(network == 'from'){
      $("#ethereum-network div:first").addClass("text-selected");
      $("#bsc-network div:first").removeClass("text-selected");
      $("#eth_status").show();
      $("#bsc_status").hide();
   }
   if(network == 'to'){
      $("#ethereum-network div:first").removeClass("text-selected");
      $("#bsc-network div:first").addClass("text-selected");
      $("#eth_status").hide();
      $("#bsc_status").show();
   }
}

async function approve() {
   approveButtonClickCount++;
   jQuery("#btn-connect-wallet").addClass("disabled");
   jQuery("#btn-connect-wallet").html("processing...");
   jQuery("#input-amount").attr("disabled", "true");
   try{

      var approve;

      if(tronLinkStatus)
         approve = await xbxContractForApprove.methods.approve(bridgeContractAddress, maxUint256).send({from: selectedAccount});

      else tronLinkStatus
         approve = await xbxContractForApprove.methods.approve(bridgeContractAddress, maxUint256).send({from: selectedTronAccount});

      if(approve.status) {
         approveButtonClickCount = 0;
         jQuery("#btn-connect-wallet").removeAttr("onclick");
         jQuery("#btn-connect-wallet").removeAttr("data-bs-toggle");
         jQuery(".btn-connect-wallet").removeClass("btn-connect-wallet");
         jQuery("#btn-connect-wallet").attr("onclick", "swap()");
      } 
   } catch(Exception) {
      approveButtonClickCount = 0;
      jQuery("#btn-connect-wallet").removeClass("disabled");
      jQuery("#btn-connect-wallet").removeAttr("onclick");
      jQuery("#btn-connect-wallet").removeAttr("data-bs-toggle");
      jQuery(".btn-connect-wallet").removeClass("btn-connect-wallet");
      jQuery("#btn-connect-wallet").attr("onclick", "approve()");
      jQuery("#btn-connect-wallet").html("<i class='fas fa-check'></i>approve");
   }
   
}