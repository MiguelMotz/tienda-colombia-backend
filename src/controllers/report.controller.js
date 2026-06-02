import {
  getSellerReport
} from "../services/report.service.js";

export async function sellerReport(req, res, next) {
  try {
    const { email } = req.query;

    const report = await getSellerReport(email);

    res.json({
      ok: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
}