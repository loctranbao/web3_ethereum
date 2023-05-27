//this step is for deploy FundMe contract
// const { network } = require("hardhat")
// const { networkConfig, developmentChains} = require("../helper-hardhat-config")
import {network} from "hardhat"
import {networkConfig, developmentChains} from "../helper-hardhat-config"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId 
    let numBlockConfirm : number

    log("-----------------------------------")
    log("deploying FundMe and waiting for confirmation......")

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        numBlockConfirm = 1
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId!]["ethUsdPriceFeed"]
        numBlockConfirm = 6
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: numBlockConfirm,
    })

    log(`FundMe deployed at ${fundMe.address}`)

}


module.exports.tags = ["all", "fundme"]
