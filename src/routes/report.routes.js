import { Router } from "express";

import {
  sellerReport
} from "../controllers/report.controller.js";

const router = Router();

/*
  Reporte general del vendedor.
  Se consulta con: /api/reports/seller?email=correo
*/
router.get("/seller", sellerReport);

export default router;