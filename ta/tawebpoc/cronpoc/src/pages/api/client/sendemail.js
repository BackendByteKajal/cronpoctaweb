import { apiHandler } from "../../../helpers/api/api-handler";
import { clientRepo } from "../../../helpers/api/client-repo";

export default apiHandler({
  post: sendEmail,
});

async function sendEmail(req, res) {
  const param = req.query.action;
  const { _id, token } = req.body;
  const content = await clientRepo.sendEMailToAdmin(_id, token, param);
  return res.status(200).json(content);
}
