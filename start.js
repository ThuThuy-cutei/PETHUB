// ============================================================
// PetHub - Script khởi động tổng
// Chạy: node start.js
// ============================================================
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const ROOT = __dirname;
const isWin = process.platform === 'win32';

// ─── Màu console ────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m',
  bgCyan: '\x1b[46m',
  bgYellow: '\x1b[43m',
  white: '\x1b[37m',
};

function log(prefix, color, msg) {
  const time = new Date().toLocaleTimeString('vi-VN');
  console.log(`${c.gray}[${time}]${c.reset} ${color}${prefix}${c.reset} ${msg}`);
}

// ─── Banner ─────────────────────────────────────────────────
function showBanner() {
  console.log(`
${c.cyan}${c.bold}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🐾  ${c.white}P e t H u b${c.cyan}  -  Pet Hotel Management System         ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   ${c.green}▸ Backend API${c.cyan}     : ${c.white}http://localhost:5000${c.cyan}                  ║
║   ${c.magenta}▸ Admin Panel${c.cyan}     : ${c.white}http://localhost:3000${c.cyan}                  ║
║   ${c.yellow}▸ Customer Site${c.cyan}   : ${c.white}http://localhost:3000/customer${c.cyan}          ║
║   ${c.green}▸ API Health${c.cyan}      : ${c.white}http://localhost:5000/api/health${c.cyan}        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${c.reset}
`);
}

// ─── Kiểm tra port ──────────────────────────────────────────
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

// ─── Spawn process ──────────────────────────────────────────
function startProcess(name, color, cwd, command, args) {
  const proc = spawn(command, args, {
    cwd,
    shell: isWin,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) log(name, color, line.trim());
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim() && !line.includes('ExperimentalWarning') && !line.includes('--trace-warnings')) {
        log(name, color, `${c.yellow}${line.trim()}`);
      }
    });
  });

  proc.on('error', (err) => {
    log(name, c.red, `Lỗi khởi động: ${err.message}`);
  });

  proc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      log(name, c.red, `Process thoát với mã ${code}`);
    }
  });

  return proc;
}

// ─── Chờ service sẵn sàng ───────────────────────────────────
function waitForService(name, port, maxWait = 60000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(async () => {
      const up = await checkPort(port);
      if (up) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > maxWait) {
        clearInterval(interval);
        resolve(false);
      }
    }, 1500);
  });
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  showBanner();

  const processes = [];

  // 1. Khởi động Backend
  log('[BACKEND]', c.green, 'Đang khởi động Express + Oracle...');
  const backend = startProcess(
    '[BACKEND] ',
    c.green,
    path.join(ROOT, 'backend'),
    isWin ? 'node' : 'node',
    ['src/server.js']
  );
  processes.push(backend);

  // Chờ backend sẵn sàng
  const backendReady = await waitForService('Backend', 5000, 30000);
  if (backendReady) {
    log('[BACKEND] ', c.green, `${c.bgGreen}${c.white} ✓ SẴN SÀNG ${c.reset} ${c.green}→ http://localhost:5000`);
  } else {
    log('[BACKEND] ', c.red, '⚠ Backend chưa phản hồi, vẫn tiếp tục...');
  }

  // 2. Khởi động Frontend
  log('[FRONTEND]', c.magenta, 'Đang khởi động Next.js...');
  const frontend = startProcess(
    '[FRONTEND]',
    c.magenta,
    path.join(ROOT, 'frontend'),
    isWin ? 'npx.cmd' : 'npx',
    ['next', 'dev']
  );
  processes.push(frontend);

  // Chờ frontend sẵn sàng
  const frontendReady = await waitForService('Frontend', 3000, 60000);
  if (frontendReady) {
    log('[FRONTEND]', c.magenta, `${c.bgCyan}${c.white} ✓ SẴN SÀNG ${c.reset} ${c.magenta}→ http://localhost:3000`);
  } else {
    log('[FRONTEND]', c.red, '⚠ Frontend chưa phản hồi, vẫn tiếp tục...');
  }

  // Status
  console.log(`
${c.cyan}${c.bold}────────────────────────────────────────────────────────────────
  🎉 PetHub đã sẵn sàng!
  
  ${c.green}▸ Backend API${c.reset}${c.bold}${c.cyan}     : ${c.white}http://localhost:5000${c.cyan}
  ${c.magenta}▸ Admin Panel${c.reset}${c.bold}${c.cyan}     : ${c.white}http://localhost:3000${c.cyan}
  ${c.yellow}▸ Customer Site${c.reset}${c.bold}${c.cyan}   : ${c.white}http://localhost:3000/customer${c.cyan}

  ${c.gray}Nhấn Ctrl+C để dừng tất cả${c.cyan}
────────────────────────────────────────────────────────────────${c.reset}
`);

  // ─── Graceful shutdown ──────────────────────────────────
  function shutdown() {
    console.log(`\n${c.yellow}${c.bold}⏹  Đang dừng PetHub...${c.reset}`);
    processes.forEach((proc) => {
      if (!proc.killed) {
        if (isWin) {
          spawn('taskkill', ['/pid', proc.pid, '/f', '/t'], { shell: true });
        } else {
          proc.kill('SIGTERM');
        }
      }
    });
    setTimeout(() => {
      console.log(`${c.green}${c.bold}✅ PetHub đã dừng hoàn toàn.${c.reset}`);
      process.exit(0);
    }, 2000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(`${c.red}Lỗi:${c.reset}`, err.message);
  process.exit(1);
});
