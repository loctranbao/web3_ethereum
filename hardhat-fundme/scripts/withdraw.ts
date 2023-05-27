import {ethers, getNamedAccounts} from "hardhat"
import { FundMe } from "../typechain-types"

async function main() {
    const deployer = (await getNamedAccounts()).deployer
    const fundMe = await ethers.getContract("FundMe", deployer) as FundMe

    console.log(`Got contract FundMe at ${fundMe.address}`)
    console.log("Withdrawing from contract...")

    let withdrawTxResponse = await fundMe.withdraw()
    await withdrawTxResponse.wait()

    console.log("Got it back!")
}

main()
    .then(()=> process.exit(0))
    .catch((error: any) => {
        console.error(error)
        process.exit(1)
    })