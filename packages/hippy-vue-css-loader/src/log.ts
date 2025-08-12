const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
};

let enableLog = true;

export function setLoggerDebug(enabled: boolean) {
  enableLog = enabled;
}

function logLine(color: string) {
  console.log(
    color +
      "─────────────────────────────────────────────────────────────────────────────────────────────────────────────────" +
      colors.reset,
  );
}

function logLabel(label: string, icon: string, color: string) {
  console.log(color + colors.bold + `[${label} ${icon}]` + colors.reset);
}

function printContent(msg: string | Record<string, any>) {
  if (typeof msg === "string") {
    console.log(msg);
  } else {
    for (const [key, value] of Object.entries(msg)) {
      if (value == null) continue;
      if (key.toLowerCase() === "css" && typeof value === "string") {
        console.log(`${key}:\n${value}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
  }
}

function logWithLabel(
  label: string,
  icon: string,
  color: string,
  msg: string | Record<string, any>,
) {
  if (!enableLog) return;
  logLabel(label, icon, color);
  printContent(msg);
  logLine(color);
  console.log();
}

export function info(msg: string | Record<string, any>): void {
  logWithLabel("HippyVueCssLoader INFO", "🟢", colors.cyan, msg);
}

export function warn(msg: string | Record<string, any>): void {
  logWithLabel("HippyVueCssLoader WARN", "🟡", colors.yellow, msg);
}

export function error(msg: string | Record<string, any>): void {
  logWithLabel("HippyVueCssLoader ERROR", "🔴", colors.red, msg);
}
