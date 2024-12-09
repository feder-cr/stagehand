import { EvalFunction } from "../../types/evals";
import { initStagehand } from "../utils";
import { z } from "zod";

export const combination_sauce: EvalFunction = async ({
  modelName,
  logger,
}) => {
  const { stagehand, initResponse } = await initStagehand({
    modelName,
    logger,
  });

  const { debugUrl, sessionUrl } = initResponse;

  try {
    await stagehand.page.goto("https://www.saucedemo.com/");

    const { usernames, password } = await stagehand.extract({
      instruction: "extract the accepted usernames and the password for login",
      schema: z.object({
        usernames: z.array(z.string()).describe("the accepted usernames"),
        password: z.string().describe("the password for login"),
      }),
    });

    await stagehand.act({
      action: `enter username 'standard_user'`,
    });

    await stagehand.act({
      action: `enter password '${password}'`,
    });

    await stagehand.act({
      action: "click on 'login'",
    });

    const observations = await stagehand.observe({
      instruction: "find all the 'add to cart' buttons",
    });

    console.log("observations", observations);
    console.log("observations length", observations.length);

    const url = await stagehand.page.url();

    await stagehand.close();

    const usernamesCheck = usernames.length === 6;
    const urlCheck = url === "https://www.saucedemo.com/inventory.html";
    const observationsCheck = observations.length === 6;

    return {
      _success: usernamesCheck && urlCheck && observationsCheck,
      debugUrl,
      sessionUrl,
      logs: logger.getLogs(),
    };
  } catch (error) {
    console.error("Error or timeout occurred:", error);

    await stagehand.close();

    return {
      _success: false,
      error: JSON.parse(JSON.stringify(error, null, 2)),
      debugUrl,
      sessionUrl,
      logs: logger.getLogs(),
    };
  }
};