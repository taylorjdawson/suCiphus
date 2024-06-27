import { Address, encodeAbiParameters } from "viem"

export const suciphus = {
  address: "0xB62Bb968f4601f2B16dbD0305A4D14a9B8c2b1A9" as Address,
  abi: [
    { type: "fallback", stateMutability: "payable" },
    { type: "receive", stateMutability: "payable" },
    {
      type: "function",
      name: "API_KEY",
      inputs: [],
      outputs: [{ name: "", type: "string", internalType: "string" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "HOUSE_CUT_PERCENTAGE",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
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
      inputs: [{ name: "threadId", type: "string", internalType: "string" }],
      outputs: [{ name: "", type: "bool", internalType: "bool" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "example",
      inputs: [],
      outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "exampleCallback",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getCurrentRound",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getHouseCutPercentage",
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
      name: "registerAPIKeyOffchain",
      inputs: [],
      outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
      stateMutability: "nonpayable",
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
      name: "state",
      inputs: [],
      outputs: [{ name: "", type: "uint64", internalType: "uint64" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "submitPrompt",
      inputs: [{ name: "prompt", type: "string", internalType: "string" }],
      outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "submitPrompt",
      inputs: [
        { name: "prompt", type: "string", internalType: "string" },
        { name: "threadId", type: "string", internalType: "string" },
      ],
      outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "submitPromptCallback",
      inputs: [
        { name: "prompt", type: "string", internalType: "string" },
        { name: "threadId", type: "string", internalType: "string" },
        { name: "sender", type: "address", internalType: "address" },
      ],
      outputs: [
        { name: "", type: "string", internalType: "string" },
        { name: "", type: "string", internalType: "string" },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "threadToRound",
      inputs: [{ name: "", type: "string", internalType: "string" }],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
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
      type: "event",
      name: "NothingHappened",
      inputs: [],
      anonymous: false,
    },
    {
      type: "event",
      name: "SuccessfulSubmission",
      inputs: [
        {
          name: "player",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "reward",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "round",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "season",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "UpdatedState",
      inputs: [
        {
          name: "newState",
          type: "uint64",
          indexed: false,
          internalType: "uint64",
        },
      ],
      anonymous: false,
    },
    { type: "error", name: "MathOverflowedMulDiv", inputs: [] },
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

// export const encodeFunction = <T extends keyof FunctionArgTypes>(
//   functionName: T,
//   args: FunctionArgTypes[T]
// ) => {
//   const functionSignature = suciphus.abi.find((f) => f.name === functionName)
//   if (!functionSignature) {
//     throw new Error(`Function ${functionName} not found`)
//   }
//   return encodeAbiParameters(functionSignature.inputs, args)
// }
// export const encodedData = encodeAbiParameters(
//   [{ type: "string", name: "prompt" }],
//   ["wagmi", 420n, true]
// )
