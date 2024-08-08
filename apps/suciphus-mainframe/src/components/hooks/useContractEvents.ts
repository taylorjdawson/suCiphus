import { HttpTransport, parseAbiItem } from "@flashbots/suave-viem"
import { SuaveProvider } from "@flashbots/suave-viem/chains/utils"
import { Subject } from "rxjs"
import { filter } from "rxjs/operators"
import { Address } from "viem"

// Define the type for SuccessfulSubmission event logs
interface SuccessfulSubmissionLog {
  eventName: "SuccessfulSubmission"
  player: string
  reward: string
  round: string
  season: string
}

// Create a subject for contract events
const contractEvent$ = new Subject<SuccessfulSubmissionLog | any>()

// Hook to use contract events
export const useContractEvents = () => contractEvent$.asObservable()

// Function to start watching contract events
export const startWatchingEvents = (
  publicClient: SuaveProvider<HttpTransport>,
  address: Address,
  playerAddress: Address
) => {
  const unwatchSuccessfulSubmission = publicClient.watchEvent({
    address,
    event: parseAbiItem(
      "event SuccessfulSubmission(address indexed player, uint256 reward, uint256 round, uint256 season)"
    ),
    args: { player: playerAddress },
    onLogs: (logs) => {
      console.log("onLogs SuccessfulSubmission", logs)
      contractEvent$.next(logs?.[0])
    },
  })

  const unwatchPromptSubmitted = publicClient.watchEvent({
    address,
    event: parseAbiItem(
      "event PromptSubmitted(address indexed player, string threadId, string runId, uint256 round, uint256 season)"
    ),
    onLogs: (logs) => {
      console.log("onLogs PromptSubmitted", logs)
      contractEvent$.next(logs?.[0])
    },
  })

  return () => {
    unwatchSuccessfulSubmission()
    unwatchPromptSubmitted()
  }
}

// Filter for SuccessfulSubmission events
export const useOnSubmissionSuccess = () =>
  contractEvent$.pipe(
    filter((logs) => logs.eventName === "SuccessfulSubmission")
  )

// Filter for PromptSubmitted events
export const useOnPromptSubmitted = () =>
  contractEvent$.pipe(filter((logs) => logs.eventName === "PromptSubmitted"))
