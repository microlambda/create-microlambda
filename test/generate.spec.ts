import { generateProject } from "../src/generate";
import inquirer from "inquirer";
import { join, resolve } from "path";
import { promises as fs, existsSync, rmSync } from "fs";
import { execSync } from "child_process";

jest.setTimeout(60 * 1000);

describe("The generate project method", () => {
  it("should generate a microlambda project that lint, build and test", async () => {
    const cwd = process.cwd();
    const mockDirectory = resolve(join(__dirname, "mocks"));
    if (existsSync(mockDirectory)) {
      rmSync(mockDirectory, { recursive: true, force: true });
    }

    let call = 0;
    jest.spyOn(inquirer, "prompt").mockImplementation(async () => {
      if (call) {
        return { packageManager: "npm" };
      }
      call++;
      return {
        type: "node",
        name: "test-app",
      };
    });
    await fs.mkdir(mockDirectory);
    process.chdir(mockDirectory);
    const create$ = generateProject();
    await create$;
    // fixture
    rmSync(
      join(mockDirectory, "test-app", "node_modules", "@typescript-eslint"),
      { recursive: true, force: true },
    );
    execSync("npm run lint", { cwd: join(mockDirectory, "test-app") });
    execSync("npm run build", { cwd: join(mockDirectory, "test-app") });
    execSync("npm run test", { cwd: join(mockDirectory, "test-app") });
    process.chdir(cwd);
    if (existsSync(mockDirectory)) {
      rmSync(mockDirectory, { recursive: true, force: true });
    }
  });
});
