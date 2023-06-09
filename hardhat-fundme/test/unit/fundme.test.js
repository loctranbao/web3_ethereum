/// unit test Fundme on local node
const {network, deployments, ethers} = require('hardhat');
const {expect, assert} = require("chai");
const {developmentChains} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) 
    ? describe.skip
    :
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
            const otherFundMe = fundMe.connect(accounts[1])
            await expect(otherFundMe.withdraw()).to.be.revertedWithCustomError(otherFundMe, "FundMe__NotOwner")
        })

        it("transfer fund successful in case of multiple funder", async () => {
            const accounts = await ethers.getSigners();
            for (let i = 1; i < accounts.length; ++i) {
                let otherFundMe = fundMe.connect(accounts[i])
                await otherFundMe.fund({value : sendValue})
            }

            const owner = await fundMe.getOwner()

            /// provider is a abstraction to ethereum network
            /// we use them to query balance of any address
            const startingOwnerBalance = await  fundMe.provider.getBalance(owner)
            const startingFund = await fundMe.provider.getBalance(fundMe.address)

            /// need to wait for confirmation before process
            /// in transaction receipt we can access to information about gas used, gas fee
            let transactionResponse = await fundMe.withdraw()
            let transactionReceipt = await transactionResponse.wait()

            const endingOwnerBalance = await  fundMe.provider.getBalance(owner)
            const transactionFee = transactionReceipt.gasUsed.mul(transactionReceipt.effectiveGasPrice)

            assert.equal(endingOwnerBalance.toString(), 
            startingOwnerBalance.add(startingFund).sub(transactionFee).toString())

        })

        it("transfer fund successful in case of multiple funder cheaper", async () => {
            const accounts = await ethers.getSigners();
            for (let i = 1; i < accounts.length; ++i) {
                let otherFundMe = fundMe.connect(accounts[i])
                await otherFundMe.fund({value : sendValue})
            }

            const owner = await fundMe.getOwner()

            /// provider is a abstraction to ethereum network
            /// we use them to query balance of any address
            const startingOwnerBalance = await  fundMe.provider.getBalance(owner)
            const startingFund = await fundMe.provider.getBalance(fundMe.address)

            /// need to wait for confirmation before process
            /// in transaction receipt we can access to information about gas used, gas fee            
            let transactionResponse = await fundMe.cheaperWithdraw()
            let transactionReceipt = await transactionResponse.wait()

            const endingOwnerBalance = await  fundMe.provider.getBalance(owner)
            const transactionFee = transactionReceipt.gasUsed.mul(transactionReceipt.effectiveGasPrice)

            assert.equal(endingOwnerBalance.toString(), 
            startingOwnerBalance.add(startingFund).sub(transactionFee).toString())

        })        

    })

})