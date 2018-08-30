var FoodNationToken = artifacts.require("FoodNationToken");
var PreSale = artifacts.require("PreSale");

var SalesGnosisDailyLimitWallet = artifacts.require("SalesGnosisDailyLimitWallet");

const decimals = 18;

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

const units = {
    million: function (val) { return val * 1e6; },
    billion: function (val) { return val * 1e9; }
};

module.exports = function (deployer) {
    deployedToken = FoodNationToken;
    console.log("FoodNation Token address: " + deployedToken.address);

    // Pre Sale constructor variables
    const constantRate = 10; // 0,10 USD;

    const presale_openingTime = Math.floor(new Date(2018, 8, 21, 0, 0, 0, 0) / 1000);
    const presale_closingTime = Math.floor(new Date(2018, 11, 20, 23, 59, 59, 59) / 1000);

    deployedSalesWallet = SalesGnosisDailyLimitWallet;
    console.log("Sales wallet address: " + deployedSalesWallet.address);

    var goal = units.million(1) * Math.pow(10, decimals);

    var cap = units.million(50) * Math.pow(10, decimals);

    const minimumContribution = web3.toWei(0.5, 'ether');

    console.log("Creating Pre Sale...");
    deployer.deploy(
        PreSale,
        constantRate,
        deployedSalesWallet.address,
        deployedToken.address,
        presale_openingTime,
        presale_closingTime,
        goal,
        cap,
        minimumContribution
    )
        .then(async () => {
            deployedCrowdsale = await PreSale.deployed();
            deployedSalesWallet = await SalesGnosisDailyLimitWallet.deployed();

            var milestoneStartTime = [];
            milestoneStartTime.push(Math.floor(new Date(2018, 8, 21, 0, 0, 0, 0) / 1000));
            milestoneStartTime.push(Math.floor(new Date(2018, 9, 21, 0, 0, 0, 0) / 1000));
            milestoneStartTime.push(Math.floor(new Date(2018, 10, 21, 0, 0, 0, 0) / 1000));

            var milestoneCap = [];
            milestoneCap.push(units.million(10) * (Math.pow(10, decimals)));
            milestoneCap.push(units.million(15) * (Math.pow(10, decimals)));
            milestoneCap.push(units.million(25) * (Math.pow(10, decimals)));

            var milestoneRate = [];
            milestoneRate.push(1);
            milestoneRate.push(2);
            milestoneRate.push(4);

            await deployedCrowdsale.setMilestonesList(milestoneStartTime, milestoneCap, milestoneRate);
            console.log("Milestones set");

            await deployedCrowdsale.updatePrice(30000);
            console.log("USD price set");

            var FNToken = await FoodNationToken.deployed();
            if (FNToken.owner != deployedCrowdsale.address) {
                await FNToken.transferOwnership(deployedCrowdsale.address);
            }
            console.log("Ownership transferred");

            return true;
        });


}
