import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import {HardhatUserConfig} from 'hardhat/types'

 // 0x9A4E9C177ccA1eeDea0E1b86c7B93a67ed60CB53
const PRIVATE_KEY = 'efbf3fcbcbeb0a7c8afb86898131a7eb741911af26265f78a96225687143b249' 
const config: HardhatUserConfig = {
    defaultNetwork: 'gw_testnet_v1',
    networks: {
        gw_testnet_v1: {
            url: 'https://v1.testnet.godwoken.io/rpc',
            accounts: [`0x${PRIVATE_KEY}`]
        }
    },
    solidity: {
        compilers: [{version: '0.8.15', settings: {}}],
    }
}

export default config
