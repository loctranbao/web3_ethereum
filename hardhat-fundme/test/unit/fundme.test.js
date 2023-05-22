/// unit test Fundme on local node
const {network, deployments, ethers} = require('hardhat');
const {expect, assert} = require("chai");


describe("Fundme", async () => {

    let deployer;
    let fundMe;
    let mockV3Aggregator;
    let sendValue = ethers.utils.parseEther("1") // 50 USD
    beforeEach(async () => {
        // get the account used to deploy the contract
        // this is gonna be account from hardhat network
        deployer = (await getNamedAccounts()).deployer

        // from my understanding this is execute deployment as fixture for test
        await deployments.fixture(["all"])


        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)

    })

    describe("constructor", async () => {
        it("set the aggregator correctly", async () => {
            let priceFeed = await fundMe.getPriceFeed()
            assert.equal(mockV3Aggregator.address, priceFeed)
        })
    })

    describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
            // how can I call the fund method on FundMe contract ???
            await expect(fundMe.fund()).to.be
                .revertedWith("You need to spend more ETH!")
        })

        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({value : sendValue});
            let response = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue)
        })

        it("add funder to funder array", async () => {
            await fundMe.fund({value : sendValue})
            let response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        })
    })

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({value : sendValue})
        })

        it("fail when withdrawer is not the owner", async () => {
            const accounts = await ethers.getSigners();
            console.log(accounts[1])
            const otherFundMe = fundMe.connect(accounts[1])
            await expect(otherFundMe.withdraw()).to.be.revertedWith("FundMe__NotOwner")
        })

    })

})