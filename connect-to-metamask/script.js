// Get references to the various HTML elements
const connectBtn = document.getElementById("connect-btn");
const walletAddressLbl = document.getElementById("wallet-address-lbl");
const ethBalanceLbl = document.getElementById("eth-balance-lbl");
const networkIdLbl = document.getElementById("network-id-lbl");

// Creating the provider and signer
let provider;
let signer;

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

    // Get the signer i.e a reference to the person who whose wallet is connected
    // This is the account responsible for signing transactions
    signer = provider.getSigner();

    updateDetails();

    // Attach a method that executes whenever the current wallet account is chnaged/switched
    window.ethereum.on("accountsChanged", updateDetails);

    // Attach a method that executes whenever the current network is chnaged/switched
    window.ethereum.on("chainChanged", reloadPage);
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
    ethBalanceLbl.textContent = ethers.utils.formatEther(ethBalance) + "ETH";
    networkIdLbl.textContent = network.chainId;
}

// Function to reload the page
function reloadPage(){
    window.location.reload();
}

// Attaching event handlers to UI components
connectBtn.addEventListener("click", connectWallet);