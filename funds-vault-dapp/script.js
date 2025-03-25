const fundsVaultCA = "0x9bb5782fB47cdcDF3110017b7654C3D4f3CA3906";
const fundsVaultABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const walletBalanceSpan = document.getElementById("wallet-balance-span");
const depositInput = document.getElementById("deposit-input");
const depositBtn = document.getElementById("deposit-btn");
const depositBalanceSpan = document.getElementById("deposit-balance-span");
const withdrawInput = document.getElementById("withdraw-input");
const withdrawBtn = document.getElementById("withdraw-btn");

let provider;
let signer;
let fundsVaultContract;

async function connectWallet(){
    if(!window.ethereum){
        alert("Metamask is not installed on this browser");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const network = await provider.getNetwork();
    if(network.chainId !== 97){
        alert("You must connect to BSC Testnet to continue");
        return;
    }

    signer = await provider.getSigner();

    connectBtn.style.display = "none";
    disconnectBtn.style.display = "block";

    fundsVaultContract = new ethers.Contract(fundsVaultCA, fundsVaultABI, signer);
    if(!fundsVaultContract){
        alert("Funds Vault contract was not found");
        return;
    }

    await getUpdatedBalances();
}

function disconnectWallet(){
    window.location.reload();
}

async function deposit(){
    const ethAmount = depositInput.value;
    if(ethAmount <= 0){
        alert("You must enter a value bigger than zero (0)");
        return;
    }

    if(!fundsVaultContract){
        alert("Please connect wallet before deposit");
        return;
    }

    const weiAmount = ethers.utils.parseEther(ethAmount);
    const transaction = await fundsVaultContract.deposit({ value: weiAmount });
    const result = await transaction.wait();

    console.log(result);

    await getUpdatedBalances();
}

function withdraw(){

}

async function getUpdatedBalances(){
    if(!provider || !signer){
        return;
    }

    const walletAddress = await signer.getAddress();
    const weiBalance = await provider.getBalance(walletAddress);
    const ethBalance = ethers.utils.formatEther(weiBalance);
    walletBalanceSpan.textContent = ethBalance.toString() + " ETH";

    const weiCurrentDeposit = await fundsVaultContract.getBalance(walletAddress);
    const ethCurrentDeposit = ethers.utils.formatEther(weiCurrentDeposit);
    depositBalanceSpan.textContent = ethCurrentDeposit + " ETH";
}

// Adding events to UI elements
connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);
depositBtn.addEventListener("click", deposit);