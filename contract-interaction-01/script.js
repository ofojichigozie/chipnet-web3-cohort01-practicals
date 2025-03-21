// Contract address and ABI are required for creating a contract instance
const chipnetTokenContractAddress = "0x43a3948ebA4Db8b2a27f7F4309ef4c688cc9a233";
const chipnetTokenContractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

// Get references to the various HTML elements
const connectBtn = document.getElementById("connect-btn");
const walletAddressLbl = document.getElementById("wallet-address-lbl");
const ethBalanceLbl = document.getElementById("eth-balance-lbl");
const networkIdLbl = document.getElementById("network-id-lbl");

// Creating the provider and signer
let provider;
let signer;
let chipnetTokenContract;

// Function for connecting Metamask wallet
async function connectWallet(){
    // Check if an injected wallet (Metamask) is installed on browser
    // And if it is not installed, display the message and exit function
    if(!window.ethereum){
        alert("Metamask is not installed on this browser");
        return;
    }

    // Assign the actual web3 provider to the variable using Ethers.js
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // Requests a user to connect his/her Metamask wallet
    await provider.send("eth_requestAccounts", []);

    // Check if the user is using the BSC Testnet
    // If not, reload the page
    const network = await provider.getNetwork();
    const networkId = network.chainId;
    if(networkId != 97){
        alert("You must connect to BNB Smart Chain Testnet");
        return reloadPage();
    }

    // Get the signer i.e a reference to the person who whose wallet is connected
    // This is the account responsible for signing transactions
    signer = provider.getSigner();

    updateDetails();

    // Create an instance of the ChipnetToken Contract
    // This is required for interacting with the actual chipnet token contract
    chipnetTokenContract = new ethers.Contract(chipnetTokenContractAddress, chipnetTokenContractABI, provider);

    readDataFromChipnetTokenContract();

    // Attach a method that executes whenever the current wallet account is chnaged/switched
    window.ethereum.on("accountsChanged", updateDetails);

    // Attach a method that executes whenever the current network is chnaged/switched
    window.ethereum.on("chainChanged", reloadPage);
}

async function readDataFromChipnetTokenContract(){
    // Check if the contract is actually defined or instantiated
    if(!chipnetTokenContract){
        return;
    }

    // Interating with the smart contract by reading its data
    const name = await chipnetTokenContract.name();
    const symbol = await chipnetTokenContract.symbol();
    const decimals = await chipnetTokenContract.decimals();
    const totalSupply = await chipnetTokenContract.totalSupply();
    const balanceOfBen = await chipnetTokenContract.balanceOf("0xb74131B9Ce186160d7D4ad1e115F35351F8C1Bf2");

    // Converting some values to human actual balances as seens in wallet apps
    const actualTotalSupply = ethers.utils.formatEther(totalSupply.toString());
    const actualBalanceOfBen = ethers.utils.formatEther(balanceOfBen.toString());

    // Dislaying the fetched data on the console
    console.log({ name, symbol, decimals, actualTotalSupply, actualBalanceOfBen });
}

async function updateDetails(){
    // Before gettig the actual details, we need to check if the PROVIDER and SIGNER
    // variables have been initialized; if not, exit the function
    if(!provider || !signer){
        return;
    }

    // Get the actauls - address, balance and network id
    const walletAddress = await signer.getAddress();
    const ethBalance = await provider.getBalance(walletAddress);
    const network = await provider.getNetwork();

    // Display the details on the UI (HTML elements)
    walletAddressLbl.textContent = walletAddress;
    ethBalanceLbl.textContent = ethers.utils.formatEther(ethBalance) + " ETH";
    networkIdLbl.textContent = network.chainId;

    // console.log('1 ETH in wei  = ' + ethers.utils.parseEther("1"));
    // console.log('1000000000 wei in ETH = ' + ethers.utils.formatEther("1000000000"));
    // console.log("Current block number = " + (await provider.getBlockNumber()));
}

// Function to reload the page
function reloadPage(){
    window.location.reload();
}

// Attaching event handlers to UI components
connectBtn.addEventListener("click", connectWallet);