// MockV3Aggregator constructor need 2 two parameter
// uint8 _decimals,
// int256 _initialAnswer

const DECIMALS = "8"
const INITIAL_ANSWER = "200000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    log("-----------------------------------")
    log("deploying MockV3Aggregator")

    const priceFeed = await deploy("MockV3Aggregator", {
        contract: "MockV3Aggregator",
        from: deployer,
        args: [DECIMALS, INITIAL_ANSWER],
        log: true,
    })

    log("Mocks Deployed!")
    log("------------------------------------------------")
    log(
        "You are deploying to a local network, you'll need a local network running to interact"
    )
    log(
        "Please run `npx hardhat console` to interact with the deployed smart contracts!"
    )
    log("------------------------------------------------")
}

module.exports.tags = ["all", "mocks"]