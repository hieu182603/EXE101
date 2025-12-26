import { Router } from "express";
import { Container } from "typedi";
import { CustomerController } from "./customer.controller";
import { validate } from "@/middlewares/validation.middleware";
import { CreateCustomerSchema, UpdateCustomerSchema } from "./dtos/customer.schema";

const router = Router();
const customerController = Container.get(CustomerController);
import multer from "multer";
import ExcelJS from "exceljs";
import { AccountService } from "@/auth/account/account.service";

// Multer config (memory) for file upload
const upload = multer({ storage: multer.memoryStorage() });

router.post("/customers", validate(CreateCustomerSchema), async (req, res, next) => {
  try {
    const result = await customerController.createCustomer(req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers", async (req, res, next) => {
  try {
    const result = await customerController.getAllCustomers();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers/search", async (req, res, next) => {
  try {
    const result = await customerController.searchCustomers(req.query.q as string);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers/:id", async (req, res, next) => {
  try {
    const result = await customerController.getCustomerById(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put("/customers/:id", validate(UpdateCustomerSchema), async (req, res, next) => {
  try {
    const result = await customerController.updateCustomer(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.delete("/customers/:id", async (req, res, next) => {
  try {
    const result = await customerController.deleteCustomer(req.params.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

router.get("/customers/export", async (req, res, next) => {
  try {
    const result = await customerController.exportCustomers();
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

// Compatibility endpoint for import (frontend expects /customers/import)
router.post("/customers/import", async (req, res, next) => {
  try {
    // Currently import is not implemented on backend.
    // Return a helpful response so frontend doesn't fail.
    res.status(501).json({
      success: false,
      message: "Import customers endpoint is not implemented on the server yet."
    });
  } catch (error: any) {
    next(error);
  }
});

// Real import implementation (accepts multipart/form-data with file field 'file')
router.post("/customers/import-real", upload.single("file"), async (req: any, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded. Please attach an Excel or CSV file under field 'file'." });
      return;
    }

    const buffer = file.buffer;
    const accountsCreated: string[] = [];
    const accountsSkipped: { username?: string; reason: string }[] = [];

    // Parse CSV separately if mime indicates csv
    const contentType = file.mimetype || "";
    let rows: Array<Record<string, string>> = [];

    if (contentType.includes("csv") || file.originalname.toLowerCase().endsWith(".csv")) {
      const text = buffer.toString("utf8");
      const lines = text.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
      if (lines.length < 2) {
        res.status(400).json({ success: false, message: "CSV file must contain a header row and at least one data row." });
        return;
      }
      const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c: string) => c.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h: string, idx: number) => {
          obj[h] = cols[idx] || "";
        });
        rows.push(obj);
      }
    } else {
      // Try parsing as Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        res.status(400).json({ success: false, message: "Excel file contains no worksheets." });
        return;
      }
      // Read header
      const headerRow = worksheet.getRow(1);
      const headers = headerRow.values as any[];
      const headerNames = headers.slice(1).map((h: any) => String(h || "").trim().toLowerCase());
      worksheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber === 1) return;
        const values = row.values as any[];
        const obj: Record<string, string> = {};
        for (let i = 1; i < values.length; i++) {
          const key = headerNames[i - 1] || `col${i}`;
          obj[key] = values[i] ? String(values[i]).trim() : "";
        }
        rows.push(obj);
      });
    }

    const accountService = Container.get(AccountService);

    for (const r of rows) {
      const username = (r["username"] || r["user"] || r["tên đăng nhập"] || "").trim();
      let password = (r["password"] || r["pass"] || r["mật khẩu"] || "").trim();
      const email = (r["email"] || r["e-mail"] || r["mail"] || "").trim();
      const phone = (r["phone"] || r["phone number"] || r["số điện thoại"] || "").trim();
      const name = (r["name"] || r["fullname"] || r["full name"] || r["tên"] || "").trim();

      if (!username || !email) {
        accountsSkipped.push({ username: username || undefined, reason: "username or email missing" });
        continue;
      }
      if (!password) {
        // generate random password
        password = Math.random().toString(36).slice(-8) + "Aa1!";
      }

      try {
        if ((accountService as any).createCustomerAccount) {
          await (accountService as any).createCustomerAccount(username, password, name || "", phone || "");
        } else {
          await accountService.createAccount(username, password, name || "", phone || "", "customer");
        }
        accountsCreated.push(username);
      } catch (error: any) {
        accountsSkipped.push({ username, reason: error?.message || "unknown error" });
      }
    }

    res.json({
      success: true,
      message: `Import completed. Created ${accountsCreated.length} accounts, skipped ${accountsSkipped.length}.`,
      data: { created: accountsCreated, skipped: accountsSkipped },
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;

