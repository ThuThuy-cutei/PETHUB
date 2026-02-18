import { useState, useEffect } from "react";
import {
  getAllBookings,
  getAllPetUpdates,
  createPetUpdate,
  getActiveStaff,
  formatCurrency,
  getStatusLabel,
  getStatusColor,
  getPetTypeLabel,
} from "@/services/api";
import {
  FiCamera,
  FiPlus,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiClock,
  FiUser,
  FiImage,
  FiActivity,
  FiX,
} from "react-icons/fi";
import { MdPets } from "react-icons/md";
import toast from "react-hot-toast";

export default function PetUpdates() {
  const [bookings, setBookings] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("NHAN_PHONG");

  // Form state
  const [formData, setFormData] = useState({
    maDatPhong: "",
    maNv: "",
    ngay: new Date().toISOString().split("T")[0],
    tinhTrang: "Tot",
    ghiChu: "",
    hoatDong: "",
    hinhAnh: [],
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allBookings, allUpdates, allStaff] = await Promise.all([
        getAllBookings(),
        getAllPetUpdates(),
        getActiveStaff(),
      ]);
      setBookings(allBookings);
      setUpdates(allUpdates);
      setStaff(allStaff);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  const activeBookings = bookings.filter((b) =>
    filterStatus === "ALL" ? true : b.TRANG_THAI === filterStatus,
  );

  function getBookingUpdates(maDatPhong) {
    return updates
      .filter((u) => u.MA_DAT_PHONG === maDatPhong)
      .sort((a, b) => b.NGAY.localeCompare(a.NGAY));
  }

  function openForm(booking) {
    setSelectedBooking(booking);
    setFormData({
      maDatPhong: booking.MA_DAT_PHONG,
      maTc: booking.MA_TC,
      maNv: staff.length > 0 ? staff[0].MA_NV : "",
      ngay: new Date().toISOString().split("T")[0],
      tinhTrang: "Tot",
      ghiChu: "",
      hoatDong: "",
      hinhAnh: [],
    });
    setImageFiles([]);
    setShowForm(true);
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
  }

  function removeImage(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !formData.maDatPhong ||
      !formData.maNv ||
      !formData.tinhTrang ||
      !formData.ghiChu
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("maDatPhong", formData.maDatPhong);
      fd.append("maTc", formData.maTc);
      fd.append("maNv", Number(formData.maNv));
      fd.append("ngay", formData.ngay);
      fd.append("tinhTrang", formData.tinhTrang);
      fd.append("ghiChu", formData.ghiChu);
      fd.append("hoatDong", formData.hoatDong);
      imageFiles.forEach((file) => fd.append("images", file));

      const res = await fetch("http://localhost:5000/api/cap-nhat-thu-cung", {
        method: "POST",
        body: fd,
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Đã cập nhật tình trạng thú cưng!");
        setShowForm(false);
        await loadData();
      } else {
        toast.error(result.message || "Lỗi khi cập nhật");
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật");
    }
  }

  function getTinhTrangColor(status) {
    const map = {
      Tot: "bg-green-100 text-green-700",
      "Binh thuong": "bg-blue-100 text-blue-700",
      "Can theo doi": "bg-yellow-100 text-yellow-700",
      Benh: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  }

  function getTinhTrangIcon(status) {
    const map = {
      Tot: "😊",
      "Binh thuong": "😐",
      "Can theo doi": "⚠️",
      Benh: "🏥",
    };
    return map[status] || "📋";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiCamera className="text-amber-500" /> Cập nhật thú cưng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cập nhật ảnh và tình trạng sức khỏe thú cưng hàng ngày
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          >
            <option value="NHAN_PHONG">Đang nhận phòng</option>
            <option value="DA_DAT">Đã đặt</option>
            <option value="ALL">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MdPets className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter((b) => b.TRANG_THAI === "NHAN_PHONG").length}
              </p>
              <p className="text-xs text-gray-500">Đang ở</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FiCamera className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {updates.length}
              </p>
              <p className="text-xs text-gray-500">Tổng cập nhật</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <FiImage className="text-amber-500 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {updates.reduce((sum, u) => sum + (u.HINH_ANH?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Tổng ảnh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking list with updates */}
      <div className="space-y-4">
        {activeBookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <MdPets className="text-5xl mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Không có thú cưng nào đang ở</p>
          </div>
        )}

        {activeBookings.map((booking) => {
          const bookingUpdates = getBookingUpdates(booking.MA_DAT_PHONG);
          const isExpanded = expandedBooking === booking.MA_DAT_PHONG;

          return (
            <div
              key={booking.MA_DAT_PHONG}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Booking header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedBooking(isExpanded ? null : booking.MA_DAT_PHONG)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">
                      {getPetTypeLabel(booking.LOAI_THU_CUNG).split(" ")[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {booking.TEN_TC}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {booking.TEN_PHONG} • {booking.LOAI_PHONG} • Chủ:{" "}
                        {booking.TEN_CHU}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {booking.NGAY_NHAN} → {booking.NGAY_TRA}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={getStatusColor(booking.TRANG_THAI)}>
                      {getStatusLabel(booking.TRANG_THAI)}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {bookingUpdates.length} cập nhật
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openForm(booking);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition-colors"
                      title="Thêm cập nhật"
                    >
                      <FiPlus />
                    </button>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>
              </div>

              {/* Updates timeline */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-5">
                  {bookingUpdates.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <FiCamera className="text-4xl mx-auto mb-2" />
                      <p>Chưa có cập nhật nào</p>
                      <button
                        onClick={() => openForm(booking)}
                        className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        + Thêm cập nhật đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookingUpdates.map((update, idx) => (
                        <div
                          key={update.MA_CAP_NHAT}
                          className="relative pl-8 pb-4"
                        >
                          {/* Timeline line */}
                          {idx < bookingUpdates.length - 1 && (
                            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200" />
                          )}
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-1 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-sm">
                            {getTinhTrangIcon(update.TINH_TRANG)}
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800 flex items-center gap-1">
                                  <FiCalendar
                                    className="text-gray-400"
                                    size={14}
                                  />
                                  {update.NGAY}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTinhTrangColor(update.TINH_TRANG)}`}
                                >
                                  {update.TINH_TRANG}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <FiUser size={12} /> {update.TEN_NV}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {update.GHI_CHU}
                            </p>
                            {update.HOAT_DONG && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                <FiActivity size={12} />
                                <span>{update.HOAT_DONG}</span>
                              </div>
                            )}
                            {/* Images */}
                            {update.HINH_ANH && update.HINH_ANH.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {update.HINH_ANH.map((img, i) => (
                                  <img
                                    key={i}
                                    src={
                                      img.startsWith("http")
                                        ? img
                                        : `http://localhost:5000${img}`
                                    }
                                    alt={`pet-${i}`}
                                    className="w-20 h-20 object-cover rounded-lg border border-amber-200 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() =>
                                      window.open(
                                        img.startsWith("http")
                                          ? img
                                          : `http://localhost:5000${img}`,
                                        "_blank",
                                      )
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Update Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Cập nhật tình trạng
                </h2>
                {selectedBooking && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedBooking.TEN_TC} - {selectedBooking.TEN_PHONG}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Staff */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhân viên
                </label>
                <select
                  value={formData.maNv}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, maNv: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                  {staff.map((s) => (
                    <option key={s.MA_NV} value={s.MA_NV}>
                      {s.HO_TEN} - {s.CHUC_VU}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày
                </label>
                <input
                  type="date"
                  value={formData.ngay}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ngay: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Health status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tình trạng sức khỏe
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Tot", "Binh thuong", "Can theo doi", "Benh"].map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tinhTrang: status,
                          }))
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          formData.tinhTrang === status
                            ? "border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {getTinhTrangIcon(status)} {status}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú / Nhận xét
                </label>
                <textarea
                  value={formData.ghiChu}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ghiChu: e.target.value }))
                  }
                  rows={3}
                  placeholder="Mô tả tình trạng thú cưng hôm nay..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hoạt động trong ngày
                </label>
                <input
                  type="text"
                  value={formData.hoatDong}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hoatDong: e.target.value,
                    }))
                  }
                  placeholder="VD: Ăn sáng, đi dạo, tắm spa..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh (tối đa 5 ảnh)
                </label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-lg px-4 py-3 cursor-pointer transition-colors">
                  <FiCamera className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Chọn ảnh từ máy tính
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {imageFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {imageFiles.map((file, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${i}`}
                          className="w-16 h-16 object-cover rounded-lg border border-amber-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
