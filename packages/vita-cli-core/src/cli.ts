import cac from "cac";

const cli = cac("vita");

cli.option("-c, --config <file>", `[string] use specified config file`);

cli.help();

async function main() {
  try {
    cli.parse();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

main();
