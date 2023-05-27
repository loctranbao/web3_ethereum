import {ethers, getNamedAccounts} from "hardhat"
import { FundMe } from "../typechain-types"

async function main() {
    const deployer = (await getNamedAccounts()).deployer
    const fundMe = await ethers.getContract("FundMe", deployer) as FundMe

    console.log(`Got contract FundMe at ${fundMe.address}`)
    console.log("Deposit 0.05 ether to it...")

    let fundTxResponse = await fundMe.fund({value : ethers.utils.parseEther('0.05')})
    await fundTxResponse.wait()

    console.log("deposit success!")
}

main()
    .then(()=> process.exit(0))
    .catch((error: any) => {
        console.error(error)
        process.exit(1)
    })