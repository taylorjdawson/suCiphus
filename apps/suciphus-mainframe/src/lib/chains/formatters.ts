import { suaveRigil } from "@flashbots/suave-viem/chains"
import {
  ConfidentialComputeRecord,
  RpcTransactionReceiptSuave,
  RpcTransactionRequestSuave,
  RpcTransactionSuave,
  SuaveBlockOverrides,
  SuaveTxType,
  TransactionReceiptSuave,
  TransactionRequestSuave,
  TransactionSuave,
} from "@flashbots/suave-viem/chains/utils"
import {
  ChainFormatters,
  defineBlock,
  defineTransaction,
  defineTransactionReceipt,
  defineTransactionRequest,
  formatTransaction,
  formatTransactionReceipt,
  formatTransactionRequest,
  Hash,
  Hex,
  hexToBigInt,
  RpcTransaction,
  toHex,
  Transaction,
  TransactionRequestBase,
  zeroAddress,
} from "viem"

export const formattersSuave = {
  block: /*#__PURE__*/ defineBlock({
    exclude: ["difficulty", "gasLimit", "miner", "mixHash", "nonce", "uncles"],
    format(
      args: SuaveBlockOverrides & {
        transactions:
          | Hash[]
          | (RpcTransactionSuave<SuaveTxType> | RpcTransaction)[]
      }
    ): SuaveBlockOverrides & {
      transactions: Hash[] | TransactionSuave[]
    } {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === "string") return transaction
        else if (transaction.type === "0x50") {
          return {
            ...formatTransaction({
              ...transaction,
              type: "0x0",
            } as RpcTransaction),
            gasPrice: hexToBigInt(transaction.gasPrice as Hex),
            confidentialComputeResult: transaction.confidentialComputeResult,
            type: transaction.type,
            typeHex: transaction.typeHex,
          }
        }
        return formatTransaction(transaction as RpcTransaction)
      }) as Hash[] | TransactionSuave[]
      return {
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(
      args: RpcTransactionSuave<SuaveTxType>
    ): TransactionSuave | Transaction {
      if (args.type === "0x50") {
        return {
          // format original eth params as legacy tx
          ...formatTransaction({ ...args, type: "0x0" } as RpcTransaction),
          chainId: parseInt(args.chainId, 16),
          accessList: args.accessList,
          // ... then replace and add fields as needed
          gasPrice: hexToBigInt(args.gasPrice as Hex),
          requestRecord: {
            // format confidential compute request as legacy tx
            ...{
              ...formatTransaction({
                ...args.requestRecord,
                type: "0x0",
                blockHash: "0x0", // dummy fields to force type coercion
                blockNumber: "0x0",
                transactionIndex: "0x0",
                from: zeroAddress,
              } as RpcTransaction),
              blockHash: null,
              blockNumber: null,
              transactionIndex: null,
            },
            // ... then replace and add fields as needed
            kettleAddress: args.requestRecord.kettleAddress,
            confidentialInputsHash: args.requestRecord.confidentialInputsHash,
            chainId:
              args.requestRecord.chainId &&
              parseInt(args.requestRecord.chainId, 16),
            type: args.requestRecord.type,
            typeHex: args.requestRecord.typeHex,
          } as ConfidentialComputeRecord,
          confidentialComputeResult: args.confidentialComputeResult,
          type: args.type,
          typeHex: args.typeHex,
        } as TransactionSuave
      } else {
        // Handle as regular Ethereum transaction
        return formatTransaction(args as RpcTransaction) as Transaction
      }
    },
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(args: RpcTransactionReceiptSuave): TransactionReceiptSuave {
      // Ensure blockHash is not null and add 'removed' field to logs
      const formattedArgs = {
        ...args,
        blockHash: args.blockHash || "0x0", // Provide a default non-null value
        logs: args.logs.map((log) => ({
          ...log,
          removed: log.removed ?? false, // Ensure 'removed' field exists
          blockHash: log.blockHash || "0x0", // Ensure non-null blockHash for each log
          blockNumber: log.blockNumber || "0x0", // Ensure non-null blockNumber for each log
          logIndex: log.logIndex || "0x0", // Ensure non-null logIndex for each log
          transactionIndex: log.transactionIndex || "0x0", // Ensure non-null transactionIndex for each log
          transactionHash: log.transactionHash || "0x0", // Ensure non-null transactionHash for each log
        })),
      }
      return {
        ...formatTransactionReceipt(formattedArgs),
      } as TransactionReceiptSuave
    },
  }),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: TransactionRequestSuave): RpcTransactionRequestSuave {
      if (
        args.confidentialInputs &&
        !["0x", "0x0"].includes(args.confidentialInputs)
      ) {
        if (!args.gasPrice) {
          throw new Error("gasPrice is required for confidential transactions")
        }
        const { kettleAddress, confidentialInputs } = args
        return {
          ...formatTransactionRequest({
            ...args,
            from: zeroAddress,
          } as TransactionRequestBase),
          kettleAddress,
          confidentialInputs,
          type: args.type || "0x43",
          gasPrice: toHex(args.gasPrice),
          chainId: toHex(args.chainId || suaveRigil.id),
        } as RpcTransactionRequestSuave
      } else {
        // handle as regular ethereum transaction
        return formatTransactionRequest(args as any) as any
      }
    },
  }),
} as const satisfies ChainFormatters
