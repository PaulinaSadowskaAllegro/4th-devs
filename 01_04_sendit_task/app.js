
const main = async () => {
  console.log("Starting sendIt agent...");

  const declaration = await readFile(
    join(__dirname, "workspace/reference/deklaracja.md"),
    "utf-8"
  );

  verify(declaration);
};

main().catch((err) => {
  log.error("Startup error", err.message);
  process.exit(1);
});


