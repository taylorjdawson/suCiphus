import { Address, encodeAbiParameters } from "viem"

export const suciphus = {
  address: "0xd594760B2A36467ec7F0267382564772D7b0b73c" as Address,
  abi: [
    {
      type: "function",
      name: "API_KEY",
      inputs: [],
      outputs: [{ name: "", type: "string", internalType: "string" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "SUBMISSION_FEE",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "checkSubmission",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSubmissionFee",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "pot",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "registerAPIKeyOffchain",
      inputs: [],
      outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "resetThread",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "round",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "season",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "submitPrompt",
      inputs: [{ name: "prompt", type: "string", internalType: "string" }],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "updateAPIKeyOnchain",
      inputs: [
        {
          name: "_apiKeyRecord",
          type: "bytes16",
          internalType: "Suave.DataId",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "LogAddress",
      inputs: [
        {
          name: "label",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "value",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LogString",
      inputs: [
        {
          name: "label",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "message",
          type: "string",
          indexed: false,
          internalType: "string",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "LogUint",
      inputs: [
        {
          name: "label",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "value",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "PeekerReverted",
      inputs: [
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "bytes", internalType: "bytes" },
      ],
    },
  ] as const,
}

type FunctionArgTypes = {
  checkSubmission: []
  getSubmissionFee: []
  resetThread: []
  submitPrompt: [string]
}

export const encodeFunction = <T extends keyof FunctionArgTypes>(
  functionName: T,
  args: FunctionArgTypes[T]
) => {
  const functionSignature = suciphus.abi.find((f) => f.name === functionName)
  if (!functionSignature) {
    throw new Error(`Function ${functionName} not found`)
  }
  return encodeAbiParameters(functionSignature.inputs, args)
}
// export const encodedData = encodeAbiParameters(
//   [{ type: "string", name: "prompt" }],
//   ["wagmi", 420n, true]
// )
