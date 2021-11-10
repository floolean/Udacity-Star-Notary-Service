import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,
	accounts: [],
	accountIndex: -1,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

			document.getElementById("contract").innerHTML = deployedNetwork.address;

      // get accounts
      this.accounts = await web3.eth.requestAccounts();
      this.account = this.accounts[0];
			let _self = this;
			var accountInterval = setInterval(async function() {
				_self.accounts = await web3.eth.requestAccounts();
				if (_self.accounts.length && _self.accounts[0] !== _self.account) {
					_self.account = _self.accounts[0];
					_self.displayAccounts();
				}
			}, 500);
			_self.displayAccounts();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    const starName = await createStar(name, id).send({from: this.account});
		console.log(starName);
    App.setStatus("Star Name: '" + name + "' owner is " + this.account + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
		const { lookUptokenIdToStarInfo } = this.meta.methods;
		const id = document.getElementById("lookid").value;
		const starName = await lookUptokenIdToStarInfo(id).call();

    App.setStatus( starName.length ? "Star Name is: " + starName : 'No star found with id ' + id +'.');
  },

	displayAccounts: async function (){
		let html = '';
		for(let i = 0; i < this.accounts.length; ++i){
			let balance = await App.web3.eth.getBalance(this.accounts[i]); //Will give value in.
			balance = App.web3.utils.fromWei(balance);
			html += '<button class="'+ (this.accountIndex == i ? 'selected' : '') +'" onclick="App.selectAccount(' + i + ')">'+this.accounts[i]+' ('+ balance +')</button></br>';
		}
		const accounts = document.getElementById("accounts");
    accounts.innerHTML = html;
		
	}

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"),);
  }

  App.start();
});