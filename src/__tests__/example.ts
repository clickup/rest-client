/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { array, number, object, string } from "superstruct";
import { RestClient } from "..";

// Initialized once somewhere. See RestOptions for lots of other options.
const client = new RestClient()
  .withOptions({
    timeoutMs: 1000,
    logger: (_event) => {
      /* myLogger.log(event); */
    },
  })
  .withBase("https://reqres.in");

async function main() {
  // Sends an individual request using Superstruct as a validation backend.
  const res = await client
    .get("/api/users", { page: 2 })
    .setDebug()
    .json(
      object({
        total: number(),
        data: array(
          object({
            id: number(),
            email: string(),
          })
        ),
      })
    );
  console.log("Masked and validated response: ", res);
  console.log("Here is a TS strongly-typed field:", res.data[0].email);
}

main().catch((e) => console.error(e));
