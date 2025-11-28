import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://eth-sepolia.g.alchemy.com/v2/demo'),
})

const USDQ_ADDRESS = '0x390518374c84c3abca46e9da0f9f0e6c5aee10e0'

const owner = await publicClient.readContract({
  address: USDQ_ADDRESS,
  abi: [{
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  }],
  functionName: 'owner',
})

console.log('New USDQ Contract:', USDQ_ADDRESS)
console.log('Contract Owner:', owner)
console.log('')
console.log('Minter trying to use:', '0x41649a1F8B2499e2F7884184D062639CEF9d0601')
console.log('Match:', owner.toLowerCase() === '0x41649a1F8B2499e2F7884184D062639CEF9d0601'.toLowerCase() ? '✅ YES' : '❌ NO')
