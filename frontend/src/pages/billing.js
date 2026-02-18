import { useState, useEffect } from 'react';
import {
  getAllBills, getBookingServices, payBill,
  formatCurrency, getStatusLabel, getStatusColor
} from '@/services/api';
import toast from 'react-hot-toast';
import { FiFileText, FiSearch, FiEye, FiX, FiCheckCircle } from 'react-icons/fi';

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [billServices, setBillServices] = useState([]);

  useEffect(() => {
    loadBills();
  }, []);

  async function loadBills() {
    try {
      const data = await getAllBills();
      setBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function viewBillDetail(bill) {
    try {
      const services = await getBookingServices(bill.MA_DAT_PHONG);
      setBillServices(services);
      setSelectedBill(bill);
    } catch (err) {
      toast.error('Lỗi tải chi tiết');
    }
  }

  async function handlePayBill(id) {
    try {
      await payBill(id);
      toast.success('Thanh toán thành công!');
      setSelectedBill(null);
      loadBills();
    } catch (err) {
      toast.error(err.message || 'Lỗi thanh toán');
    }
  }

  const filteredBills = bills.filter(b => {
    const matchSearch = !search ||
      b.TEN_CHU?.toLowerCase().includes(search.toLowerCase()) ||
      b.TEN_TC?.toLowerCase().includes(search.toLowerCase()) ||
      b.TEN_PHONG?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || b.TRANG_THAI === filterStatus;
    return matchSearch && matchStatus;
  });

  const tongDoanhThu = bills.reduce((sum, b) => sum + (b.TRANG_THAI === 'DA_THANH_TOAN' ? b.TONG_TIEN : 0), 0);
  const tongChuaThu = bills.reduce((sum, b) => sum + (b.TRANG_THAI === 'CHUA_THANH_TOAN' ? b.TONG_TIEN : 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hóa Đơn</h1>
        <p className="text-gray-500 mt-1">Quản lý hóa đơn và thanh toán</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-600">Tổng hóa đơn</p>
          <p className="text-2xl font-bold text-blue-800">{bills.length}</p>
        </div>
        <div className="card bg-green-50 border-green-100">
          <p className="text-sm text-green-600">Đã thu</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(tongDoanhThu)}</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-100">
          <p className="text-sm text-yellow-600">Chưa thu</p>
          <p className="text-2xl font-bold text-yellow-800">{formatCurrency(tongChuaThu)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên chủ, thú cưng, phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !filterStatus ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('CHUA_THANH_TOAN')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterStatus === 'CHUA_THANH_TOAN' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Chưa thanh toán
          </button>
          <button
            onClick={() => setFilterStatus('DA_THANH_TOAN')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterStatus === 'DA_THANH_TOAN' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Đã thanh toán
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Mã HĐ</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Khách hàng</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Thú cưng</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Phòng</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Tiền phòng</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Tiền DV</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Giảm giá</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Tổng tiền</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Trạng thái</th>
              <th className="text-left py-3 px-3 text-gray-600 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill.MA_HD} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 font-mono text-gray-500">#{bill.MA_HD}</td>
                <td className="py-3 px-3 font-medium">{bill.TEN_CHU}</td>
                <td className="py-3 px-3">{bill.TEN_TC}</td>
                <td className="py-3 px-3">{bill.TEN_PHONG}</td>
                <td className="py-3 px-3">{formatCurrency(bill.TIEN_PHONG)}</td>
                <td className="py-3 px-3">{formatCurrency(bill.TIEN_DICH_VU)}</td>
                <td className="py-3 px-3">{bill.GIAM_GIA}%</td>
                <td className="py-3 px-3 font-bold text-primary-600">{formatCurrency(bill.TONG_TIEN)}</td>
                <td className="py-3 px-3">
                  <span className={getStatusColor(bill.TRANG_THAI)}>
                    {getStatusLabel(bill.TRANG_THAI)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => viewBillDetail(bill)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      <FiEye className="inline mr-1" /> Chi tiết
                    </button>
                    {bill.TRANG_THAI === 'CHUA_THANH_TOAN' && (
                      <button
                        onClick={() => handlePayBill(bill.MA_HD)}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        <FiCheckCircle className="inline mr-1" /> Thanh toán
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBills.length === 0 && (
          <p className="text-center py-8 text-gray-400">Không có hóa đơn nào</p>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                <FiFileText className="inline mr-2" />
                Hóa đơn #{selectedBill.MA_HD}
              </h2>
              <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Khách hàng</p>
                  <p className="font-medium">{selectedBill.TEN_CHU}</p>
                </div>
                <div>
                  <p className="text-gray-500">Thú cưng</p>
                  <p className="font-medium">{selectedBill.TEN_TC}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phòng</p>
                  <p className="font-medium">{selectedBill.TEN_PHONG}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ngày lưu trú</p>
                  <p className="font-medium">{selectedBill.NGAY_NHAN} → {selectedBill.NGAY_TRA}</p>
                </div>
              </div>

              {/* Service Details */}
              {billServices.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Dịch vụ đã sử dụng</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b">
                          <th className="text-left py-2 px-3">Dịch vụ</th>
                          <th className="text-center py-2 px-3">SL</th>
                          <th className="text-right py-2 px-3">Đơn giá</th>
                          <th className="text-right py-2 px-3">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billServices.map((sv) => (
                          <tr key={sv.MA_CT_DV} className="border-b border-gray-200">
                            <td className="py-2 px-3">{sv.TEN_DV}</td>
                            <td className="py-2 px-3 text-center">{sv.SO_LUONG}</td>
                            <td className="py-2 px-3 text-right">{formatCurrency(sv.DON_GIA)}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatCurrency(sv.THANH_TIEN)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-r from-primary-50 to-amber-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiền phòng</span>
                  <span className="font-medium">{formatCurrency(selectedBill.TIEN_PHONG)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiền dịch vụ</span>
                  <span className="font-medium">{formatCurrency(selectedBill.TIEN_DICH_VU)}</span>
                </div>
                {selectedBill.GIAM_GIA > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Giảm giá ({selectedBill.GIAM_GIA}%)</span>
                    <span>-{formatCurrency((selectedBill.TIEN_PHONG + selectedBill.TIEN_DICH_VU) * selectedBill.GIAM_GIA / 100)}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">{formatCurrency(selectedBill.TONG_TIEN)}</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between">
                <span className={`${getStatusColor(selectedBill.TRANG_THAI)} text-sm`}>
                  {getStatusLabel(selectedBill.TRANG_THAI)}
                </span>
                {selectedBill.NGAY_THANH_TOAN && (
                  <span className="text-sm text-gray-500">
                    Thanh toán ngày: {selectedBill.NGAY_THANH_TOAN}
                  </span>
                )}
              </div>

              {selectedBill.TRANG_THAI === 'CHUA_THANH_TOAN' && (
                <button
                  onClick={() => handlePayBill(selectedBill.MA_HD)}
                  className="btn-success w-full flex items-center justify-center gap-2"
                >
                  <FiCheckCircle /> Xác nhận thanh toán
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
