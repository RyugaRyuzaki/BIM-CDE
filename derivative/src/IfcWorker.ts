import {parentPort, workerData} from "worker_threads";

parentPort?.addEventListener("message", async (e: any) => {
  console.log(e.data);
});
