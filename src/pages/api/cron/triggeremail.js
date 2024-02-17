import { apiHandler } from "../../../helpers/api/api-handler";
import { clientRepo } from "../../../helpers/api/client-repo";

export default apiHandler({
  get: triggerEmailToAdmin,
});

async function triggerEmailToAdmin(req, res) {
  console.log("cron execute.....")
 const clients = await clientRepo.triggerEmail();
  return res.status(200).json(clients);
}
