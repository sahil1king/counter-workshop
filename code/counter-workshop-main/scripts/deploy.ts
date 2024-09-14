import { Account, CallData, Contract, RpcProvider, stark } from "starknet";
import * as dotenv from "dotenv";
import { getCompiledCode } from "./utils";
dotenv.config();

async function main() {
  const provider = new RpcProvider({
    nodeUrl:"https://starknet-sepolia.infura.io/v3/1b3f043f725840598c00c997a5685a1f",
  });

  // initialize existing predeployed account 0
  console.log("ACCOUNT_ADDRESS=",0x05536D755e388281F082c3a174451261346e120ED3A26e0D061268636710d643);
  console.log("ACCOUNT_PRIVATE_KEY=",0x02a869b4a59d14a3af5c1d32d544f323599b2f7226664f9acf0abb42ef58abb2);
  const privateKey0 ="0x02a869b4a59d14a3af5c1d32d544f323599b2f7226664f9acf0abb42ef58abb2" ?? "";
  const accountAddress0: string = "0x05536D755e388281F082c3a174451261346e120ED3A26e0D061268636710d643" ?? "";
  const account0 = new Account(provider, accountAddress0, privateKey0);
  console.log("Account connected.\n");

  // Declare & deploy contract
  let sierraCode, casmCode;

  try {
    ({ sierraCode, casmCode } = await getCompiledCode("workshop_Counter"));
  } catch (error: any) {
    console.log("Failed to read contract files");
    process.exit(1);
  }

  const myCallData = new CallData(sierraCode.abi);
  const constructor = myCallData.compile("constructor", {
    counter: 100,
    kill_switch:
      "0x05f7151ea24624e12dde7e1307f9048073196644aa54d74a9c579a257214b542",
    initial_owner:"0x05536D755e388281F082c3a174451261346e120ED3A26e0D061268636710d643",
  });
  const deployResponse = await account0.declareAndDeploy({
    contract: sierraCode,
    casm: casmCode,
    constructorCalldata: constructor,
    salt: stark.randomAddress(),
  });

  // Connect the new contract instance :
  const myTestContract = new Contract(
    sierraCode.abi,
    deployResponse.deploy.contract_address,
    provider
  );
  console.log(
    `✅ Contract has been deploy with the address: ${myTestContract.address}`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
