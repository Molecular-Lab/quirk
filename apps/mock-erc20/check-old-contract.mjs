import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://eth-sepolia.g.alchemy.com/v2/demo'),
})

const OLD_ADDRESS = '0xb6d61c277a6fe2a4054c7fab6bc28dff6d19602e'

try {
  const owner = await publicClient.readContract({
    address: OLD_ADDRESS,
    abi: [{
      name: 'owner',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'address' }],
    }],
    functionName: 'owner',
  })
  
  console.log('Old Contract:', OLD_ADDRESS)
  console.log('Old Contract Owner:', owner)
  console.log('')
  console.log('Expected minter:', '0x41649a1F8B2499e2F7884184D062639CEF9d0601')
  console.log('Match:', owner.toLowerCase() === '0x41649a1F8B2499e2F7884184D062639CEF9d0601'.toLowerCase() ? '✅ YES' : '❌ NO - Different owner!')
} catch (error) {
  console.log('Old Contract:', OLD_ADDRESS)
  console.log('❌ Error reading contract:', error.message)
  console.log('This contract might not exist or have a different ABI')
}
