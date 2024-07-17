import {
  encodeAbiParameters,
  encodeFunctionData,
  Transport,
  type Hex,
} from "@flashbots/suave-viem"
import {
  parseTransactionSuave,
  SuaveProvider,
  SuaveWallet,
  type TransactionRequestSuave,
} from "@flashbots/suave-viem/chains/utils"
import { suciphus as suciphusDeployment, weth as wethDeployment } from "@repo/suciphus-suapp"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"
import weth9 from "@repo/suciphus-suapp/out/WETH9.sol/WETH9.json"

/* devnet: */
const KETTLE_ADDRESS = "0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F"
/* rigil:
const KETTLE_ADDRESS = "0x03493869959C866713C33669cA118E774A30A0E5"
*/

type SubmitPromptParams = {
  prompt: string
  value?: bigint
  suaveWallet: SuaveWallet<Transport>
  threadId: string
  nonce: number
}

type MintTokensParams = {
  value: bigint
  suaveWallet: SuaveWallet<Transport>
  nonce: number
}

const encodePrompt = (prompt: string, threadId: string) => {
  return encodeAbiParameters(
    [
      {
        components: [
          {
            name: "prompt",
            type: "string",
          },
          {
            name: "threadId",
            type: "string",
          },
        ],
        type: "tuple",
      },
    ], [
      {
        prompt,
        threadId,
      },
    ]
  )
}

const defaultRequest = {
  kettleAddress: KETTLE_ADDRESS,
  gas: 30n * 1000n * 1000n,
  type: "0x43",
  to: suciphusDeployment.address,
}

const suciphusRequest = ({args, confidentialInputs, functionName, nonce, value}: {functionName: string, confidentialInputs?: Hex, args?: any[], nonce?: number, value?: bigint}) => {
  return {
    ...defaultRequest,
    data: encodeFunctionData({
      abi: suciphus.abi,
      functionName,
      args,
    }),
    confidentialInputs,
    nonce,
  } as TransactionRequestSuave
}

export const submitPrompt = async (params: SubmitPromptParams) => {
  const { prompt, threadId, suaveWallet, nonce } = params

  const suaveTx = suciphusRequest({
    functionName: "submitPrompt",
    confidentialInputs: encodePrompt(prompt, threadId),
    nonce,
  })

  const tx = await suaveWallet.signTransaction(suaveTx)
  console.debug("signed tx", tx)
  console.debug("parsed signed tx", parseTransactionSuave(tx))
  return await suaveWallet.sendRawTransaction({ serializedTransaction: tx })
}

export const readMessages = async (params: SubmitPromptParams) => {
  const { threadId, suaveWallet, nonce } = params
  const tx = suciphusRequest({
    functionName: "readMessages",
    confidentialInputs: encodePrompt("", threadId),
    nonce,
  })
  return await suaveWallet.sendTransaction(tx)
}

export const mintTokens = async (params: MintTokensParams) => {
  const { value, suaveWallet, nonce } = params
  const tx: TransactionRequestSuave = {
    data: encodeFunctionData({
      abi: weth9.abi,
      functionName: "depositAndApprove",
      args: [suciphusDeployment.address],
    }),
    nonce,
    value,
    type: "0x0",
    to: wethDeployment.address,
    gas: 100n * 1000n,
  }
  const signed = await suaveWallet.signTransaction(tx)
  return await suaveWallet.sendRawTransaction({serializedTransaction: signed})
}
