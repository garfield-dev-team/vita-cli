import Service from "./Service";

async function main() {
  const service = new Service();
  await service.loadPlugins();
  // service.run();
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
