export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Si es un error de Zod, devolver issues estructurados
    const issues = Array.isArray(error?.issues)
      ? error.issues
      : Array.isArray(error?.errors)
      ? error.errors
      : null;

    if (issues) {
      const safeIssues = issues.map((i) => ({
        code: i.code,
        path: i.path,
        message: i.message,
        minimum: i.minimum,
        maximum: i.maximum,
        validation: i.validation,
        keys: i.keys,
        options: i.options,
        expected: i.expected,
        received: i.received,
      }));
      return res.status(400).json({ error: { type: "validation", issues: safeIssues } });
    }

    return res.status(400).json({ error: String(error?.message || "Datos inválidos") });
  }
};
