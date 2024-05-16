import { PublicClient, WalletClient } from "@flashbots/suave-viem"
import { Address } from "viem"

import { suciphus } from "./suciphus-abi"

export const submitPrompt = async (
  prompt: string,
  account: Address,
  {
    value,
    walletClient,
    publicClient,
  }: { walletClient: WalletClient; publicClient: PublicClient; value: bigint }
) => {
  const { request } = await publicClient.simulateContract({
    ...suciphus,
    functionName: "submitPrompt",
    args: [prompt],
    account,
    value,
  })
  const hash = await walletClient.writeContract(request)

  return hash
}
