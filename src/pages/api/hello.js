import { apiHandler } from "../../helpers/api/api-handler";


export default apiHandler({
  get: hello,
});

async function hello(req, res) {
  const param = req.query.action;
 
  return res.status(200).json("content");
}
