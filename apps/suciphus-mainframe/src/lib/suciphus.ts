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
  prompt?: string
  value?: bigint
  suaveWallet: SuaveWallet<Transport>
  threadId: string
  nonce?: number
}

type MintTokensParams = {
  value: bigint
  suaveWallet: SuaveWallet<Transport>
  nonce?: number
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
  gas: 3n * 1000n * 1000n,
  type: "0x43",
  to: suciphusDeployment.address,
}

const suciphusConfRequest = ({args, confidentialInputs, functionName, nonce}: {functionName: string, confidentialInputs?: Hex, args?: any[], nonce?: number}) => {
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

  if (!prompt) {
    throw new Error("non-empty prompt is required")
  }
  const tx = suciphusConfRequest({
    functionName: "submitPrompt",
    confidentialInputs: encodePrompt(prompt, threadId),
    nonce,
  })

  return await suaveWallet.sendTransaction(tx)
}

export const readMessages = async (params: SubmitPromptParams) => {
  const { threadId, suaveWallet, nonce } = params
  const tx = suciphusConfRequest({
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
    gas: 150n * 1000n,
  }
  return await suaveWallet.sendTransaction(tx)
}

export const checkSubmission = async (params: SubmitPromptParams) => {
  const { threadId, suaveWallet, nonce } = params
  return await suaveWallet.sendTransaction({
    ...suciphusConfRequest({
      functionName: "checkSubmission",
      confidentialInputs: encodePrompt("", threadId),
      nonce,
    }),
  })
}