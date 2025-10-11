export function getHttpErrorMessage(err, fallback = "Ocurrió un error", opts = {}) {
  const {
    joinWith = " · ",
    maxIssues = 1,
    fieldLabels = {}, // e.g. { password: "Contraseña", email: "Correo" }
  } = opts || {};

  const data = err?.response?.data;

  // 1) String plano
  if (typeof data === "string") return data;

  // 2) Zod como array en la raíz
  if (Array.isArray(data) && data.length) {
    const msgs = data
      .map((i) => formatZodIssue(i, fieldLabels))
      .filter(Boolean);
    return msgs.length ? limitAndJoin(msgs, joinWith, maxIssues) : fallback;
  }

  // 3) Convenciones comunes
  if (isString(data?.error)) return data.error;
  if (isString(data?.message)) return data.message;

  // 4) Zod en { error: { issues } } o { issues } o { errors }
  const issues = data?.error?.issues || data?.issues || data?.errors;
  if (Array.isArray(issues) && issues.length) {
    const msgs = issues
      .map((i) => formatZodIssue(i, fieldLabels))
      .filter(Boolean);
    return msgs.length ? limitAndJoin(msgs, joinWith, maxIssues) : fallback;
  }

  // 5) Mensaje serializable
  if (data?.message) return String(data.message);

  // 6) Mensaje del propio error
  if (isString(err?.message)) return err.message;

  // 7) Último recurso
  try {
    return data ? JSON.stringify(data) : fallback;
  } catch {
    return fallback;
  }
}

/* ==================== Helpers ==================== */

function isString(x) {
  return typeof x === "string" && x.trim().length > 0;
}

function limitAndJoin(arr, sep, max) {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  const sliced = arr.slice(0, Math.max(1, max));
  const msg = sliced.join(sep);
  if (arr.length > sliced.length) {
    return `${msg}${sep}+${arr.length - sliced.length} más`;
  }
  return msg;
}

/**
 * Formatea un "issue" de Zod a un mensaje entendible en español.
 * Soporta varios códigos comunes (too_small, too_big, invalid_type, etc).
 */
function formatZodIssue(issue, fieldLabels = {}) {
  if (!issue || typeof issue !== "object") return "";

  // path puede ser array (["password"]) o string ("password")
  const rawPath = Array.isArray(issue.path) ? issue.path.join(".") : (issue.path || "");
  const field = fieldLabels[rawPath] || rawPath; // renombrar si hay label

 
  if (isString(issue.message)) {
    // Si quieres anteponer el campo cuando exista:
    if (field) return `${capitalize(field)}: ${issue.message}`;
    return issue.message;
  }

  // Traducciones por código
  const code = String(issue.code || "").toLowerCase();

  switch (code) {
    case "too_small": {
      const min = issue.minimum;
      // string/array/object (Zod usa "inclusive" y "type")
      // Para lo más común (password string):
      if (min != null) {
        const base = `es demasiado corto (mínimo ${min} caracteres)`;
        return field ? `${capitalize(field)} ${base}.` : `El campo ${base}.`;
      }
      return field ? `${capitalize(field)} es demasiado pequeño.` : `El valor es demasiado pequeño.`;
    }

    case "too_big": {
      const max = issue.maximum;
      if (max != null) {
        const base = `es demasiado largo (máximo ${max} caracteres)`;
        return field ? `${capitalize(field)} ${base}.` : `El valor ${base}.`;
      }
      return field ? `${capitalize(field)} es demasiado grande.` : `El valor es demasiado grande.`;
    }

    case "invalid_type": {
      // expected/received disponibles a veces
      const expected = issue.expected ? ` (esperado: ${issue.expected})` : "";
      return field
        ? `${capitalize(field)} tiene un tipo inválido${expected}.`
        : `Tipo inválido${expected}.`;
    }

    case "invalid_string": {
      // issue.validation: "email", "url", "regex", etc.
      const v = String(issue.validation || "").toLowerCase();
      if (v === "email") {
        return field ? `${capitalize(field)} no es un correo válido.` : `Correo inválido.`;
      }
      if (v === "url") {
        return field ? `${capitalize(field)} no es una URL válida.` : `URL inválida.`;
      }
      return field ? `${capitalize(field)} no es válido.` : `Dato inválido.`;
    }

    case "unrecognized_keys": {
      // Zod a veces trae keys no esperadas
      const keys = Array.isArray(issue.keys) ? issue.keys.join(", ") : "";
      return keys ? `Se enviaron campos no permitidos: ${keys}.` : `Se enviaron campos no permitidos.`;
    }

    case "invalid_enum_value": {
      // a veces trae options: [...]
      const options = Array.isArray(issue.options) ? issue.options.join(", ") : "";
      return field
        ? `${capitalize(field)} tiene un valor inválido${options ? ` (opciones: ${options})` : ""}.`
        : `Valor inválido${options ? ` (opciones: ${options})` : ""}.`;
    }

    case "custom":
    default: {
      // Último recurso: stringify issue breve
      try {
        return field ? `${capitalize(field)} inválido.` : `Dato inválido.`;
      } catch {
        return `Dato inválido.`;
      }
    }
  }
}

function capitalize(s = "") {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
