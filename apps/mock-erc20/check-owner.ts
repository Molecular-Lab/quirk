import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0xb775f014fdf2a080db021f4640456b75d9e51ee81fe9712084abc13663f9c399'
const account = privateKeyToAccount(privateKey as `0x${string}`)

console.log('Private key:', privateKey)
console.log('Derived address:', account.address)
