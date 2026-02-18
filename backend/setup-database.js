// ============================================================
// PetHub - Tự động kết nối Oracle và tạo CSDL
// Script: setup-database.js
// Chạy: node setup-database.js
// ============================================================
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================================
// CẤU HÌNH
// ============================================================
const DB_CONFIG = {
  user: process.env.DB_USER || 'pethotel',
  password: process.env.DB_PASSWORD || 'pethotel123',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1',
};

// ADMIN config dùng để tạo user mới nếu cần
const ADMIN_CONFIG = {
  user: process.env.DB_ADMIN_USER || 'system',
  password: process.env.DB_ADMIN_PASSWORD || 'oracle',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1',
};

const SQL_DIR = path.join(__dirname, '..', 'database');
const SQL_FILES = [
  '01_create_tables.sql',
  '02_triggers.sql',
  '03_stored_procedures.sql',
  '04_sample_data.sql',
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function log(emoji, msg) {
  console.log(`${emoji} ${msg}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

/**
 * Tách file SQL thành các câu lệnh riêng lẻ
 * Xử lý:
 * - PL/SQL blocks (BEGIN...END; /) 
 * - CREATE OR REPLACE (TRIGGER/PROCEDURE... END; /)
 * - Câu lệnh SQL thông thường kết thúc bằng ;
 * - Bỏ qua comment, dòng trống, COMMIT
 */
function parseSqlStatements(sqlContent) {
  const statements = [];
  const lines = sqlContent.split('\n');
  let current = '';
  let inPlSqlBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Bỏ qua comment đơn và dòng trống
    if (trimmed === '' || trimmed.startsWith('--')) continue;
    // Bỏ qua COMMIT riêng lẻ (ta tự commit)
    if (trimmed.toUpperCase() === 'COMMIT;') continue;

    // Phát hiện bắt đầu PL/SQL block
    if (!inPlSqlBlock) {
      const upper = trimmed.toUpperCase();
      if (
        upper.startsWith('CREATE OR REPLACE TRIGGER') ||
        upper.startsWith('CREATE OR REPLACE PROCEDURE') ||
        upper.startsWith('CREATE OR REPLACE FUNCTION') ||
        upper.startsWith('CREATE OR REPLACE PACKAGE') ||
        (upper === 'BEGIN' && current.trim() === '') ||
        (upper.startsWith('BEGIN') && current.trim() === '') ||
        (upper.startsWith('DECLARE') && current.trim() === '')
      ) {
        inPlSqlBlock = true;
      }
    }

    if (inPlSqlBlock) {
      current += line + '\n';
      // PL/SQL block ends with / on its own line
      if (trimmed === '/') {
        // Remove trailing / and add statement
        const stmt = current.replace(/\n\/\s*$/, '').trim();
        if (stmt) statements.push(stmt);
        current = '';
        inPlSqlBlock = false;
      }
    } else {
      current += line + '\n';
      // Regular SQL ends with ;
      if (trimmed.endsWith(';')) {
        const stmt = current.trim().replace(/;$/, '').trim();
        if (stmt && stmt.toUpperCase() !== 'COMMIT') {
          statements.push(stmt);
        }
        current = '';
      }
    }
  }

  // Remaining
  if (current.trim()) {
    const stmt = current.trim().replace(/;$/, '').replace(/\n\/\s*$/, '').trim();
    if (stmt && stmt.toUpperCase() !== 'COMMIT') {
      statements.push(stmt);
    }
  }

  return statements;
}

// ============================================================
// BƯỚC 1: THỬ TẠO USER (nếu chưa tồn tại)
// ============================================================
async function ensureUserExists() {
  logSection('BƯỚC 1: Kiểm tra / Tạo user Oracle');

  let adminConn;
  try {
    log('🔌', `Kết nối admin (${ADMIN_CONFIG.user})...`);
    adminConn = await oracledb.getConnection(ADMIN_CONFIG);
    log('✅', 'Kết nối admin thành công');

    const username = DB_CONFIG.user.toUpperCase();

    // Kiểm tra user tồn tại
    const result = await adminConn.execute(
      `SELECT COUNT(*) AS CNT FROM all_users WHERE username = :u`,
      { u: username }
    );

    if (result.rows[0][0] === 0) {
      log('📝', `Tạo user "${DB_CONFIG.user}"...`);
      
      try {
        await adminConn.execute(`CREATE USER ${DB_CONFIG.user} IDENTIFIED BY ${DB_CONFIG.password}`);
      } catch (e) {
        // CDB yêu cầu prefix c##
        if (e.message.includes('ORA-65096')) {
          log('⚠️', 'Oracle CDB detected - thử với prefix C##...');
          await adminConn.execute(
            `ALTER SESSION SET "_ORACLE_SCRIPT" = TRUE`
          );
          await adminConn.execute(
            `CREATE USER ${DB_CONFIG.user} IDENTIFIED BY ${DB_CONFIG.password}`
          );
        } else {
          throw e;
        }
      }

      // Cấp quyền
      await adminConn.execute(`GRANT CONNECT, RESOURCE TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT CREATE SESSION TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT CREATE TABLE TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT CREATE SEQUENCE TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT CREATE TRIGGER TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT CREATE PROCEDURE TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT CREATE VIEW TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT UNLIMITED TABLESPACE TO ${DB_CONFIG.user}`);
      await adminConn.execute(`GRANT CREATE ANY INDEX TO ${DB_CONFIG.user}`);

      log('✅', `User "${DB_CONFIG.user}" đã được tạo và cấp quyền`);
    } else {
      log('✅', `User "${DB_CONFIG.user}" đã tồn tại`);
    }
  } catch (err) {
    if (err.message.includes('ORA-12541') || err.message.includes('ORA-12514') || err.message.includes('ORA-12543')) {
      log('❌', 'Không thể kết nối Oracle. Hãy chắc chắn Oracle đang chạy!');
      log('💡', 'Kiểm tra: lsnrctl status');
      throw err;
    }
    log('⚠️', `Không thể kết nối admin: ${err.message}`);
    log('💡', 'Sẽ thử kết nối trực tiếp với user đã cấu hình...');
  } finally {
    if (adminConn) await adminConn.close();
  }
}

// ============================================================
// BƯỚC 2: KẾT NỐI VỚI USER PETHUB
// ============================================================
async function connectAsUser() {
  logSection('BƯỚC 2: Kết nối Oracle với user PetHub');
  
  log('🔌', `Kết nối: ${DB_CONFIG.user}@${DB_CONFIG.connectString}`);
  
  const connection = await oracledb.getConnection(DB_CONFIG);
  
  // Kiểm tra kết nối
  const result = await connection.execute(`SELECT SYSDATE, SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS SCHEMA FROM DUAL`);
  const serverDate = result.rows[0][0];
  const schema = result.rows[0][1];
  
  log('✅', `Kết nối thành công!`);
  log('📅', `Server time: ${serverDate}`);
  log('👤', `Schema: ${schema}`);
  
  return connection;
}

// ============================================================
// BƯỚC 3: THỰC THI SQL FILES
// ============================================================
async function executeSqlFiles(connection) {
  logSection('BƯỚC 3: Tạo cơ sở dữ liệu');

  let totalSuccess = 0;
  let totalFail = 0;

  for (const file of SQL_FILES) {
    const filePath = path.join(SQL_DIR, file);
    
    if (!fs.existsSync(filePath)) {
      log('⚠️', `File không tồn tại: ${file}`);
      continue;
    }

    console.log(`\n--- Thực thi: ${file} ---`);
    
    const sqlContent = fs.readFileSync(filePath, 'utf-8');
    const statements = parseSqlStatements(sqlContent);
    
    log('📄', `Tìm thấy ${statements.length} câu lệnh`);

    let fileSuccess = 0;
    let fileFail = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 80).replace(/\n/g, ' ').trim();

      try {
        await connection.execute(stmt);
        fileSuccess++;
        // Chỉ log những câu lệnh quan trọng
        if (stmt.toUpperCase().startsWith('CREATE TABLE') ||
            stmt.toUpperCase().startsWith('CREATE OR REPLACE TRIGGER') ||
            stmt.toUpperCase().startsWith('CREATE OR REPLACE PROCEDURE') ||
            stmt.toUpperCase().startsWith('CREATE SEQUENCE')) {
          log('  ✅', preview);
        }
      } catch (err) {
        fileFail++;
        // Bỏ qua lỗi "already exists" khi DROP
        if (err.message.includes('ORA-00942') || err.message.includes('ORA-02289')) {
          // Table/sequence doesn't exist - OK for DROP
        } else {
          log('  ❌', `${preview}...`);
          log('     ', `Lỗi: ${err.message.split('\n')[0]}`);
        }
      }
    }

    // Commit sau mỗi file
    await connection.execute('COMMIT');
    totalSuccess += fileSuccess;
    totalFail += fileFail;
    log('📊', `${file}: ${fileSuccess} thành công, ${fileFail} lỗi`);
  }

  return { totalSuccess, totalFail };
}

// ============================================================
// BƯỚC 4: XÁC MINH CSDL
// ============================================================
async function verifyDatabase(connection) {
  logSection('BƯỚC 4: Xác minh cơ sở dữ liệu');

  // Kiểm tra bảng
  const tables = await connection.execute(
    `SELECT table_name FROM user_tables ORDER BY table_name`,
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  log('📋', `Tổng số bảng: ${tables.rows.length}`);
  const expectedTables = [
    'NHAN_VIEN', 'KHACH_HANG', 'THU_CUNG', 'LOAI_PHONG', 'PHONG',
    'DICH_VU', 'DAT_PHONG', 'HOA_DON', 'CHI_TIET_DICH_VU',
    'TAI_KHOAN', 'CAP_NHAT_THU_CUNG'
  ];
  
  for (const t of expectedTables) {
    const found = tables.rows.some(r => r.TABLE_NAME === t);
    log(found ? '  ✅' : '  ❌', t);
  }

  // Kiểm tra dữ liệu mẫu
  console.log('');
  const countQueries = [
    { name: 'Nhân viên', table: 'NHAN_VIEN' },
    { name: 'Khách hàng', table: 'KHACH_HANG' },
    { name: 'Thú cưng', table: 'THU_CUNG' },
    { name: 'Loại phòng', table: 'LOAI_PHONG' },
    { name: 'Phòng', table: 'PHONG' },
    { name: 'Dịch vụ', table: 'DICH_VU' },
    { name: 'Đặt phòng', table: 'DAT_PHONG' },
    { name: 'Hóa đơn', table: 'HOA_DON' },
    { name: 'Chi tiết DV', table: 'CHI_TIET_DICH_VU' },
    { name: 'Tài khoản', table: 'TAI_KHOAN' },
    { name: 'Cập nhật TC', table: 'CAP_NHAT_THU_CUNG' },
  ];

  log('📊', 'Dữ liệu mẫu:');
  for (const q of countQueries) {
    try {
      const result = await connection.execute(`SELECT COUNT(*) AS CNT FROM ${q.table}`);
      log('  📦', `${q.name}: ${result.rows[0][0]} bản ghi`);
    } catch {
      log('  ❌', `${q.name}: Lỗi`);
    }
  }

  // Kiểm tra triggers
  const triggers = await connection.execute(
    `SELECT trigger_name, status FROM user_triggers ORDER BY trigger_name`
  );
  console.log('');
  log('⚡', `Triggers: ${triggers.rows.length}`);
  for (const t of triggers.rows) {
    log(t[1] === 'ENABLED' ? '  ✅' : '  ⚠️', `${t[0]} (${t[1]})`);
  }

  // Kiểm tra procedures
  const procs = await connection.execute(
    `SELECT object_name, status FROM user_objects WHERE object_type = 'PROCEDURE' ORDER BY object_name`
  );
  console.log('');
  log('🔧', `Procedures: ${procs.rows.length}`);
  for (const p of procs.rows) {
    log(p[1] === 'VALID' ? '  ✅' : '  ⚠️', `${p[0]} (${p[1]})`);
  }

  // Kiểm tra sequences
  const seqs = await connection.execute(
    `SELECT sequence_name FROM user_sequences ORDER BY sequence_name`
  );
  console.log('');
  log('🔢', `Sequences: ${seqs.rows.length}`);

  return {
    tables: tables.rows.length,
    triggers: triggers.rows.length,
    procedures: procs.rows.length,
    sequences: seqs.rows.length
  };
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   🐾 PetHub - Tự động tạo CSDL Oracle               ║');
  console.log('║   Pet Hotel Management System                        ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  
  console.log(`\n📋 Cấu hình kết nối:`);
  console.log(`   User:    ${DB_CONFIG.user}`);
  console.log(`   Server:  ${DB_CONFIG.connectString}`);
  console.log(`   SQL Dir: ${SQL_DIR}`);

  let connection;

  try {
    // Bước 1: Tạo user nếu cần
    await ensureUserExists();

    // Bước 2: Kết nối
    connection = await connectAsUser();

    // Bước 3: Thực thi SQL
    const { totalSuccess, totalFail } = await executeSqlFiles(connection);

    // Bước 4: Xác minh
    const stats = await verifyDatabase(connection);

    // Tổng kết
    logSection('🎉 HOÀN THÀNH');
    console.log(`
   📊 Tổng kết:
   ├─ SQL thực thi: ${totalSuccess} thành công, ${totalFail} lỗi
   ├─ Bảng: ${stats.tables}
   ├─ Triggers: ${stats.triggers}
   ├─ Procedures: ${stats.procedures}
   └─ Sequences: ${stats.sequences}

   🔌 Connection String: ${DB_CONFIG.connectString}
   👤 User: ${DB_CONFIG.user}
   🔑 Password: ${DB_CONFIG.password}

   💡 Bạn có thể chạy backend: cd backend && npm run dev
    `);

  } catch (err) {
    console.error('\n❌ LỖI NGHIÊM TRỌNG:', err.message);
    
    if (err.message.includes('ORA-12541')) {
      console.log('\n💡 HƯỚNG DẪN:');
      console.log('   1. Kiểm tra Oracle Database đã được khởi động');
      console.log('   2. Chạy: lsnrctl start');
      console.log('   3. Kiểm tra service: lsnrctl status');
      console.log('   4. Kiểm tra connect string trong .env');
    } else if (err.message.includes('ORA-12514')) {
      console.log('\n💡 HƯỚNG DẪN:');
      console.log('   Service name không đúng. Kiểm tra:');
      console.log('   1. lsnrctl status để xem service name');
      console.log('   2. Cập nhật DB_CONNECT_STRING trong backend/.env');
      console.log('   VD: localhost:1521/XEPDB1 hoặc localhost:1521/ORCL');
    } else if (err.message.includes('ORA-01017')) {
      console.log('\n💡 HƯỚNG DẪN:');
      console.log('   Sai username/password. Kiểm tra:');
      console.log('   1. DB_USER và DB_PASSWORD trong backend/.env');
      console.log('   2. DB_ADMIN_USER và DB_ADMIN_PASSWORD trong backend/.env');
    } else if (err.message.includes('NJS-')) {
      console.log('\n💡 HƯỚNG DẪN:');
      console.log('   Lỗi Oracle client. Hãy chạy:');
      console.log('   npm install oracledb');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        log('🔒', 'Đã đóng kết nối');
      } catch {}
    }
  }
}

main();
