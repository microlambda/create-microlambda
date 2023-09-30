import chalk from "chalk";
import inquirer from "inquirer";
import { command, Options } from "execa";
import ora from "ora";
import { join, resolve } from "path";
import { replaceInFile } from "replace-in-file";

export const generateProject = async (): Promise<void> => {

  console.info(chalk.bold("λ | Microlambda"));
  console.info(chalk.bold("\nCreate a new project 🧙\n"));

  const answers = await inquirer.prompt([
    {
      message: "How do you want to call it ?",
      default: "my-awesome-app",
      name: "name",
      type: "input",
      validate: (input: string) => {
        if (
          !input.match(/^[a-z0-9-~][a-z0-9-._~]*$/)
        ) {
          return "Please provide a valid npm package scope";
        }
        return true;
      },
    },
  ]);
  process.stdout.write("\n");

  const cloning = ora();
  const dest = resolve(join(process.cwd(), answers.name));
  const execaOptions: Options = {
    cwd: dest,
    stdio: process.env.DEBUG_CREATE_MICROLAMBDA ? "inherit" : "ignore",
    shell: true,
  };
  try {
    cloning.start(chalk.bold(`Creating project in ${dest} ✨`));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const degit = require("tiged");
    const cloner = degit(`microlambda/starter-project#main`);
    await cloner.clone(dest);
    await command("git init", execaOptions);
    await replaceInFile({
      files: join(dest, '**'),
      from: /my-app/g,
      to: answers.name,
    });
    cloning.succeed(chalk.bold("Project initialized ✨"));
  } catch (e) {
    cloning.fail(chalk.red.bold("Failed to create project"));
    console.error(e);
    process.exit(1);
  }

  const installing = ora();
  installing.start(chalk.bold("Installing dependencies 📦"));
  try {
    await command(`yarn install`, execaOptions);
    installing.succeed(chalk.bold("Dependencies installed 📦"));
  } catch (e) {
    installing.fail(
      chalk.red.bold("Failed to install dependencies, you must do it yourself"),
    );
    console.error(e);
    process.exit(1);
  }
  process.stdout.write("\n");
  console.info(
    `cd ./${answers.name} ${chalk.grey("# you'll find your project here")}`,
  );
  console.info(`yarn start ${chalk.grey("# start project in dev mode")}`);
  console.info(`yarn deploy -e <env> ${chalk.grey("# deploy project on AWS")}`);
  process.stdout.write("\n");
  console.info(chalk.bold("We are all set 🚀 Happy coding !"));
};
