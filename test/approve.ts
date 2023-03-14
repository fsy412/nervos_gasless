import { UserOperationStruct } from '../typechain-types/core/GaslessEntryPoint'
import { ethers } from 'hardhat'
import { ERC20Token } from '../typechain-types/contracts/ERC20.sol'
import { hexConcat } from 'ethers/lib/utils'
import { expect } from "chai";

describe('#approve', function () {
    const ENTRYPOINT_CONTRACT_ADDRESS = '0x791ec459f57362256f313F5512bDB9F6d7Cae308'
    const PAYMASTER_SUCCESS_CONTRACT_ADDRESS = '0xdE3ceF77F68f3a137721bBEFec2d7edea6903A09'
    const ERC20_CONTRACT_ADDRESS = '0xC84ab95759a4659D4C55F79489be8f55898b51b7'
    const VAULT_ADDRESS = "0xf62045B84AB3f5401bC342C14dF625d913Ce5923"

    // let gaslessAlwaysSuccessPaymaster: GaslessAlwaysSuccessPaymaster
    let erc20: ERC20Token
    let callData: string

    before(async function () {
        const ERC20 = await ethers.getContractFactory('ERC20Token')
        erc20 = await ERC20.attach(ERC20_CONTRACT_ADDRESS)
        const testTx = await erc20.populateTransaction.approve(VAULT_ADDRESS, ethers.utils.parseEther('200000'))
        callData = testTx.data ?? ''
        console.log('callData', callData)
    })
    it('Approve', async () => {
        // define UserOp
        const userOp: UserOperationStruct = {
            callContract: erc20.address,
            callData: callData,
            callGasLimit: 1000000,
            verificationGasLimit: 1000000,
            maxFeePerGas: 1,
            maxPriorityFeePerGas: 1,
            paymasterAndData: hexConcat([PAYMASTER_SUCCESS_CONTRACT_ADDRESS])
        }

        // 1. construct and send gasless transaction via native sendTransaction
        const abiCoder = new ethers.utils.AbiCoder();
        let payload = abiCoder.encode(["tuple(address callContract, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData) UserOperation"], [userOp]);
        // first 4 bytes of keccak hash of handleOp((address,bytes,uint256,uint256,uint256,uint256,bytes))
        const fnSelector = "fb4350d8";
        // gasless payload = ENTRYPOINT_HANDLE_OP_SELECTOR + abiEncode(UserOperation)
        payload = "0x" + fnSelector + payload.slice(2);
        const signers = await ethers.getSigners()
        const signer = signers[0]
        console.log('from', signer.address)
        const gaslessTx = {
            from: signer.address,
            to: ENTRYPOINT_CONTRACT_ADDRESS,
            data: payload,
            gasPrice: 0,
            gasLimit: 4000000,
            value: 0,
        }
        const tx = await signer.sendTransaction(gaslessTx);
        const receipt = await tx.wait();
        console.log(`tx: https://v1.testnet.gwscan.com/tx/${receipt.transactionHash}`)
        let allowance = await erc20.allowance(signer.address, VAULT_ADDRESS)
        console.log('allowance', ethers.utils.formatEther(allowance.toString()))

        expect(ethers.utils.parseEther('200000')).to.be.equal(allowance)
    })
})