import { zfd } from "zod-form-data";
import { z } from "zod";

export const SuggestBookInput = zfd.formData({
  bookId: zfd.text(),
  intent: zfd.text(z.enum(["add", "remove"])),
});
