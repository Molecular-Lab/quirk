import { createPublicClient, http, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://eth-sepolia.g.alchemy.com/v2/demo'),
})

const LATEST_USDQ = '0x1d02848c34ed2155613dd5cd26ce20a601b9a489'
const EXPECTED_OWNER = '0x41649a1F8B2499e2F7884184D062639CEF9d0601'

const abi = [
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
]

try {
  const [owner, name, symbol, decimals, totalSupply] = await Promise.all([
    publicClient.readContract({ address: LATEST_USDQ, abi, functionName: 'owner' }),
    publicClient.readContract({ address: LATEST_USDQ, abi, functionName: 'name' }),
    publicClient.readContract({ address: LATEST_USDQ, abi, functionName: 'symbol' }),
    publicClient.readContract({ address: LATEST_USDQ, abi, functionName: 'decimals' }),
    publicClient.readContract({ address: LATEST_USDQ, abi, functionName: 'totalSupply' }),
  ])

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Latest USDQ Contract Verification')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Contract:', LATEST_USDQ)
  console.log('Name:', name)
  console.log('Symbol:', symbol)
  console.log('Decimals:', decimals)
  console.log('Total Supply:', formatUnits(totalSupply, 6), 'USDC')
  console.log('')
  console.log('Owner:', owner)
  console.log('Expected Owner:', EXPECTED_OWNER)
  console.log('Owner Match:', owner.toLowerCase() === EXPECTED_OWNER.toLowerCase() ? '✅ YES' : '❌ NO')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('🎯 Next Steps:')
  console.log('1. Restart B2B API server to load new contract address')
  console.log('2. Try batch complete deposits again')
  console.log('')
  console.log('Verified on Etherscan:')
  console.log('https://sepolia.etherscan.io/address/' + LATEST_USDQ + '#code')
} catch (error) {
  console.log('❌ Error:', error.message)
}
