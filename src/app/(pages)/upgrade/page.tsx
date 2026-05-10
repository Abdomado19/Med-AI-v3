import { authOptions } from "@/auth";
import Upgrade from "@/components/Upgrade/Upgrade";
import { getServerSession } from "next-auth";


async function UpgradePage() {
  const session = await getServerSession(authOptions);
   



  return (
    <Upgrade/>
  )
}

export default UpgradePage