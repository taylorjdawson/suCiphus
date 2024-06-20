// import { getContract, PublicClient, WalletClient } from "@flashbots/suave-viem"
import { Address, getContract, PublicClient, WalletClient } from "viem"

import { suaveLocal } from "./chains/suave-local"
import { getPublicClient } from "./suave"
import { suciphus } from "./suciphus-abi"

// const getSuciphusContract = () => {
//   const publicClient = getPublicClient()
//   return getContract({
//     address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
//     abi: wagmiAbi,
//     client: {
//       public: publicClient,
//       wallet: walletClient,
//     },
//   })
// }

export const submitPrompt = async (
  prompt: string,
  account: Address,
  {
    value,
    walletClient,
    publicClient,
  }: { walletClient: WalletClient; publicClient: PublicClient; value: bigint }
) => {
  const contract = getContract({
    ...suciphus,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  })

  const hash = await contract.write.submitPrompt([prompt], {
    value,
    account,
    chain: suaveLocal,
    gasLimit: 10000000000n,
    gasPrice: 21000n,
  })
  console.log({ hash })
  // const { request } = await publicClient.simulateContract({
  //   ...suciphus,
  //   functionName: "submitPrompt",
  //   args: [prompt],
  //   account,
  //   value,
  // })
  // const hash = await walletClient.writeContract(request)

  return hash
}
