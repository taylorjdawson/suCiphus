import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  Hex,
  Transport,
} from "@flashbots/suave-viem"
import {
  parseTransactionSuave,
  SuaveTxRequestTypes,
  SuaveWallet,
  type TransactionRequestSuave,
} from "@flashbots/suave-viem/chains/utils"
import { suciphus as suciphusDeployment } from "@repo/suciphus-suapp"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"

import { suaveLocal } from "./chains/suave-local"

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

export const submitPrompt = async (params: SubmitPromptParams) => {
  const { prompt, value, threadId, suaveWallet, nonce } = params

  const confidentialInputs = encodeAbiParameters(
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
    ],
    [
      {
        prompt,
        threadId,
      },
    ]
  )

  const suaveTx: TransactionRequestSuave = {
    confidentialInputs,
    kettleAddress: KETTLE_ADDRESS,
    to: suciphusDeployment.address,
    gas: 500000n,
    type: "0x43",
    data: encodeFunctionData({
      abi: suciphus.abi,
      functionName: "submitPrompt",
    }),
    nonce,
  }

  const tx = await suaveWallet.signTransaction(suaveTx)
  console.log(tx)
  console.log("parsed signed tx", parseTransactionSuave(tx))
  return await suaveWallet.sendRawTransaction({ serializedTransaction: tx })
}
