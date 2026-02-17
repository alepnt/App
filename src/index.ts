import { createApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Planit MVP API in ascolto su :${PORT}`);
});
