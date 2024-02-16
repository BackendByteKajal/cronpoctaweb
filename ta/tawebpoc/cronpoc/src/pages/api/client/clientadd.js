import { apiHandler } from "../../../helpers/api/api-handler";
import {  clientRepo } from "../../../helpers/api/client-repo";
export default apiHandler({
  post: addClient,
});
async function addClient(req, res) {
  const param = req.query.action;
  const data = req.body;
  const clientData = await clientRepo.createClientData(data, param);
  res.status(200).json(clientData);
}
