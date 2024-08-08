import {
  createPublicClient,
  decodeEventLog,
  encodeAbiParameters,
  encodeFunctionData,
  fromHex,
  getAddress,
  http,
  HttpTransport,
  parseAbiItem,
  Transport,
  type Hex,
} from "@flashbots/suave-viem"
import {
  SuaveProvider,
  SuaveWallet,
  type TransactionRequestSuave,
} from "@flashbots/suave-viem/chains/utils"
import { suciphus, weth } from "@repo/suciphus-suapp"

import { suaveLocal } from "./suave"

const KETTLE_ADDRESS_TOLIMAN = "0xF579DE142D98F8379C54105ac944fe133B7A17FE"
const KETTLE_ADDRESS_LOCAL = "0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F"

const KETTLE_ADDRESS =
  process.env.NODE_ENV === "production"
    ? KETTLE_ADDRESS_TOLIMAN
    : KETTLE_ADDRESS_LOCAL

type SubmitPromptParams = {
  prompt?: string
  runId?: string
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

const encodePrompt = (prompt: string, threadId: string, runId: string) => {
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
          {
            name: "runId",
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
        runId,
      },
    ]
  )
}

const defaultRequest = {
  kettleAddress: KETTLE_ADDRESS,
  gas: 30n * 1000n * 1000n,
  type: "0x43",
  to: suciphus.address,
}

const suciphusConfRequest = ({
  args,
  confidentialInputs,
  functionName,
  nonce,
}: {
  functionName: string
  confidentialInputs?: Hex
  args?: any[]
  nonce?: number
}) => {
  console.log({ defaultRequest })
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
    confidentialInputs: encodePrompt(prompt, threadId, ""),
    nonce,
  })

  return await suaveWallet.sendTransaction(tx)
}

export const readMessages = async (params: SubmitPromptParams) => {
  const { threadId, suaveWallet, nonce } = params
  const tx = suciphusConfRequest({
    functionName: "readMessages",
    confidentialInputs: encodePrompt("", threadId, ""),
    nonce,
  })
  return await suaveWallet.sendTransaction(tx)
}

export const mintTokens = async (params: MintTokensParams) => {
  const { value, suaveWallet, nonce } = params

  const tx: TransactionRequestSuave = {
    data: encodeFunctionData({
      abi: weth.abi,
      functionName: "depositAndApprove",
      args: [suciphus.address],
    }),
    nonce,
    value,
    // type: "0x0",
    to: weth.address,
    gas: 150n * 1000n,
    // kettleAddress: KETTLE_ADDRESS,
  }
  console.log({ tx })
  console.log("suaveWallet.chain", await suaveWallet.getChainId())
  return await suaveWallet.sendTransaction(tx)
}

export const checkSubmission = async (params: SubmitPromptParams) => {
  const { threadId, runId, suaveWallet, nonce } = params
  return await suaveWallet.sendTransaction({
    ...suciphusConfRequest({
      functionName: "checkSubmission",
      confidentialInputs: encodePrompt("", threadId, runId || ""),
      nonce,
    }),
  })
}

const transferEventAbi = parseAbiItem(
  `event Transfer(address indexed src, address indexed dst, uint wad)`
)
const withdrawalEventAbi = parseAbiItem(
  `event Withdrawal(address indexed src, uint wad)`
)
const depositEventAbi = parseAbiItem(
  `event Deposit(address indexed dst, uint wad)`
)

const getTransferLogs = async (client: SuaveProvider<HttpTransport>) => {
  return client.getContractEvents({
    address: weth.address,
    abi: weth.abi,
    eventName: "Transfer",
    fromBlock: 0n,
    toBlock: "latest",
  })
}

export const getCurrentPotValue = async (
  client: SuaveProvider<HttpTransport>
): Promise<bigint> => {
  const potValue = (await client.readContract({
    address: weth.address,
    abi: weth.abi,
    functionName: "balanceOf",
    args: [suciphus.address],
  })) as bigint
  return potValue
}

export const getPotValue = async (
  client: SuaveProvider<HttpTransport>
): Promise<bigint> => {
  const potValue = (await client.readContract({
    address: suciphus.address,
    abi: suciphus.abi,
    functionName: "getPotValue",
  })) as bigint
  return potValue
}

export const getPlayerTransferLogs = async (
  client: SuaveProvider<HttpTransport>,
  playerAddress: string
) => {
  const logs = await getTransferLogs(client)

  const creditsSpent = logs.filter(
    // @ts-ignore
    (log) => log.args.src === playerAddress && log.args.dst === suciphus.address
  )
  const earnedCredits = logs.filter(
    // @ts-ignore
    (log) => log.args.src === suciphus.address && log.args.dst === playerAddress
  )

  return { creditsSpent, earnedCredits }
}

export const getDepositLogs = async (
  playerAddress: string,
  contractAddress: string,
  client: SuaveProvider<HttpTransport>
) => {
  const logs = await client.getContractEvents({
    address: weth.address,
    abi: weth.abi,
    eventName: "Deposit",
    args: {
      dst: playerAddress,
    },
    fromBlock: 0n,
    toBlock: "latest",
  })

  return logs
}

export const getWithdrawalLogs = async (
  playerAddress: string,
  contractAddress: string,
  client: SuaveProvider<HttpTransport>
) => {
  const logs = await client.getContractEvents({
    address: weth.address,
    abi: weth.abi,
    eventName: "Withdrawal",
    args: {
      from: playerAddress,
    },
    fromBlock: 0n,
    toBlock: "latest",
  })

  return logs
}
