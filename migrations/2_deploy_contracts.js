const StarNotary = artifacts.require("StarNotary");


function development(deployer) {
	deployer.deploy(StarNotary);
};

function rinkeby(deployer, network, accounts) {
	deployer.deploy(StarNotary,{from: accounts[0]});
};

module.exports = process.env['MNEMONIC'] ? rinkeby : development;
