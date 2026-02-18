// ============================================================
// Oracle Database Connection Pool (Kết nối bền vững)
// ============================================================
const oracledb = require("oracledb");
require("dotenv").config();

// Cấu hình Oracle Client (Thin mode - không cần Oracle Client)
// oracledb.initOracleClient(); // Bỏ comment nếu dùng Thick mode

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
  poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
  poolIncrement: parseInt(process.env.DB_POOL_INCREMENT) || 2,
  poolAlias: "pethotel_pool",
  poolTimeout: 60,
  queueTimeout: 60000,
};

/**
 * Khởi tạo Connection Pool
 * Connection Pool giúp tái sử dụng kết nối, tránh overhead tạo mới mỗi request
 */
async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("✅ Oracle Connection Pool đã được khởi tạo thành công");
    console.log(`   Pool: min=${dbConfig.poolMin}, max=${dbConfig.poolMax}`);
  } catch (err) {
    console.error("❌ Lỗi khởi tạo Connection Pool:", err.message);
    throw err;
  }
}

/**
 * Lấy connection từ Pool
 */
async function getConnection() {
  return await oracledb.getConnection("pethotel_pool");
}

/**
 * Đóng Connection Pool khi shutdown server
 */
async function close() {
  try {
    await oracledb.getPool("pethotel_pool").close(10);
    console.log("🔒 Connection Pool đã được đóng");
  } catch (err) {
    console.error("❌ Lỗi đóng Connection Pool:", err.message);
  }
}

/**
 * Helper: Thực thi query và trả kết quả dạng object array
 * autoCommit mặc định = true cho các query đơn giản
 */
async function execute(sql, binds = {}, opts = {}) {
  let connection;
  try {
    connection = await getConnection();
    const options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    };
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error("❌ Lỗi thực thi SQL:", err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("❌ Lỗi đóng connection:", err.message);
      }
    }
  }
}

/**
 * Helper: Thực thi nhiều câu lệnh trong 1 transaction
 * Dùng cho các nghiệp vụ cần đảm bảo tính toàn vẹn (ACID)
 */
async function executeTransaction(callback) {
  let connection;
  try {
    connection = await getConnection();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("❌ Lỗi rollback:", rollbackErr.message);
      }
    }
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("❌ Lỗi đóng connection:", err.message);
      }
    }
  }
}

module.exports = {
  initialize,
  close,
  getConnection,
  execute,
  executeTransaction,
  oracledb,
};
