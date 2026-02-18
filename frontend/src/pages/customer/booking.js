import { useState, useEffect } from "react";
import {
  getAllCustomers,
  getAllPets,
  getAvailableRooms,
  getRoomTypes,
  getActiveStaff,
  createBooking,
  findOrCreateCustomer,
  createPet,
  getAllServices,
  formatCurrency,
  getPetTypeLabel,
} from "@/services/api";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiCheckCircle,
  FiCalendar,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import { MdPets } from "react-icons/md";

const API_BASE = "http://localhost:5000/api";

const steps = [
  { id: 1, label: "Thông tin" },
  { id: 2, label: "Chọn phòng" },
  { id: 3, label: "Dịch vụ thêm" },
  { id: 4, label: "Xác nhận" },
];

export default function CustomerBooking() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Customer info
  const [customerInfo, setCustomerInfo] = useState({
    hoTen: "",
    soDienThoai: "",
    email: "",
    tenThuCung: "",
    loaiThuCung: "CHO",
    giong: "",
    canNang: "",
    tuoi: "",
    ngayNhan: "",
    ngayTra: "",
    ghiChu: "",
  });

  // Step 2: Room
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Step 3: Extra services
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Load services on mount + pre-fill customer info if logged in
  useEffect(() => {
    getAllServices()
      .then((data) =>
        setAllServices(data.filter((s) => s.TRANG_THAI === "HOAT_DONG")),
      )
      .catch(() => {});
    getRoomTypes()
      .then(setRoomTypes)
      .catch(() => {});
    // Pre-fill from logged-in customer
    const savedCustomer = localStorage.getItem("pethub_customer");
    if (savedCustomer) {
      try {
        const cust = JSON.parse(savedCustomer);
        setCustomerInfo((prev) => ({
          ...prev,
          hoTen: cust.HO_TEN || "",
          soDienThoai: cust.SO_DIEN_THOAI || "",
          email: cust.EMAIL || "",
        }));
      } catch {}
    }
  }, []);

  // Step 1 validation
  function validateStep1() {
    const { hoTen, soDienThoai, tenThuCung, loaiThuCung, ngayNhan, ngayTra } =
      customerInfo;
    if (!hoTen || !soDienThoai || !tenThuCung || !ngayNhan || !ngayTra) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }
    if (ngayTra <= ngayNhan) {
      toast.error("Ngày trả phải sau ngày nhận");
      return false;
    }
    return true;
  }

  // Search rooms
  async function searchRooms() {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const rooms = await getAvailableRooms(
        customerInfo.ngayNhan,
        customerInfo.ngayTra,
        customerInfo.loaiThuCung,
      );
      setAvailableRooms(rooms);
      if (rooms.length === 0) {
        toast("Không có phòng trống phù hợp cho thời gian này", { icon: "⚠️" });
      }
      setStep(2);
    } catch (err) {
      toast.error("Lỗi tìm phòng");
    } finally {
      setLoading(false);
    }
  }

  function toggleService(maDv) {
    setSelectedServices((prev) =>
      prev.includes(maDv) ? prev.filter((id) => id !== maDv) : [...prev, maDv],
    );
  }

  // Calculate total
  function calcDays() {
    if (!customerInfo.ngayNhan || !customerInfo.ngayTra) return 0;
    const d1 = new Date(customerInfo.ngayNhan);
    const d2 = new Date(customerInfo.ngayTra);
    return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  }

  function calcTotal() {
    const days = calcDays();
    const roomCost = selectedRoom ? selectedRoom.GIA_MOI_NGAY * days : 0;
    const serviceCost = selectedServices.reduce((sum, id) => {
      const sv = allServices.find((s) => s.MA_DV === id);
      return sum + (sv ? sv.GIA : 0);
    }, 0);
    return { roomCost, serviceCost, total: roomCost + serviceCost, days };
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      // 1. Tìm hoặc tạo khách hàng (luôn dùng findOrCreateCustomer để tránh lỗi FK)
      const custResult = await findOrCreateCustomer({
        hoTen: customerInfo.hoTen,
        soDienThoai: customerInfo.soDienThoai,
        email: customerInfo.email || null,
      });
      const maKh = custResult.maKh;

      // 2. Tạo thú cưng cho khách hàng
      const petResult = await createPet({
        maKh,
        tenTc: customerInfo.tenThuCung,
        loai: customerInfo.loaiThuCung,
        giong: customerInfo.giong || null,
        canNang: customerInfo.canNang ? parseFloat(customerInfo.canNang) : null,
        tuoi: customerInfo.tuoi ? parseInt(customerInfo.tuoi) : null,
      });

      // 3. Đặt phòng với mã thú cưng thực tế
      const bookingResult = await createBooking({
        maTc: petResult.maTc,
        maPhong: selectedRoom.MA_PHONG,
        maNv: null,
        ngayNhan: customerInfo.ngayNhan,
        ngayTra: customerInfo.ngayTra,
        ghiChu: customerInfo.ghiChu,
      });

      // 4. Thêm dịch vụ nếu có
      if (selectedServices.length > 0 && bookingResult.data?.maDatPhong) {
        for (const maDv of selectedServices) {
          try {
            await fetch(
              `${API_BASE}/dat-phong/${bookingResult.data.maDatPhong}/dich-vu`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ maDv, soLuong: 1 }),
              },
            );
          } catch {}
        }
      }

      toast.success("Đặt phòng thành công! Chúng tôi sẽ liên hệ xác nhận.");

      // Lưu thông tin khách hàng vào localStorage để trang account có thể hiển thị
      localStorage.setItem(
        "pethub_customer",
        JSON.stringify({
          MA_KH: maKh,
          HO_TEN: customerInfo.hoTen,
          EMAIL: customerInfo.email || null,
          SO_DIEN_THOAI: customerInfo.soDienThoai,
        }),
      );

      // Reset
      setStep(1);
      setCustomerInfo({
        hoTen: "",
        soDienThoai: "",
        email: "",
        tenThuCung: "",
        loaiThuCung: "CHO",
        giong: "",
        canNang: "",
        tuoi: "",
        ngayNhan: "",
        ngayTra: "",
        ghiChu: "",
      });
      setSelectedRoom(null);
      setSelectedServices([]);
    } catch (err) {
      toast.error(err.message || "Lỗi đặt phòng, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  const { roomCost, serviceCost, total, days } = calcTotal();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Đặt phòng cho thú cưng
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Chỉ cần 4 bước đơn giản để đặt phòng cho bé yêu của bạn!
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${step >= s.id ? "text-amber-600" : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      step > s.id
                        ? "bg-amber-500 border-amber-500 text-white"
                        : step === s.id
                          ? "border-amber-500 text-amber-600"
                          : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {step > s.id ? <FiCheckCircle size={16} /> : s.id}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.id ? "bg-amber-500" : "bg-gray-200"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Step 1: Customer & Pet Info */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Thông tin khách hàng & thú cưng
              </h2>

              {/* Customer info */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                  Thông tin liên hệ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.hoTen}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          hoTen: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.soDienThoai}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          soDienThoai: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="0901234567"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Pet info */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                  Thông tin thú cưng
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên thú cưng *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.tenThuCung}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          tenThuCung: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="Lucky"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại thú cưng *
                    </label>
                    <select
                      value={customerInfo.loaiThuCung}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          loaiThuCung: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                    >
                      <option value="CHO">🐕 Chó</option>
                      <option value="MEO">🐈 Mèo</option>
                      <option value="HAMSTER">🐹 Hamster</option>
                      <option value="THO">🐰 Thỏ</option>
                      <option value="CHIM">🐦 Chim</option>
                      <option value="KHAC">🐾 Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giống
                    </label>
                    <input
                      type="text"
                      value={customerInfo.giong}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          giong: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="Golden Retriever"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cân nặng (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={customerInfo.canNang}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            canNang: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tuổi
                      </label>
                      <input
                        type="number"
                        value={customerInfo.tuoi}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            tuoi: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                  Thời gian lưu trú
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày nhận phòng *
                    </label>
                    <input
                      type="date"
                      required
                      value={customerInfo.ngayNhan}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          ngayNhan: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày trả phòng *
                    </label>
                    <input
                      type="date"
                      required
                      value={customerInfo.ngayTra}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          ngayTra: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      min={
                        customerInfo.ngayNhan ||
                        new Date().toISOString().split("T")[0]
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú đặc biệt
                </label>
                <textarea
                  value={customerInfo.ghiChu}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, ghiChu: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  rows={3}
                  placeholder="Dị ứng thức ăn, chế độ ăn đặc biệt, tình trạng sức khỏe..."
                />
              </div>

              <button
                onClick={searchRooms}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Đang tìm phòng..."
                ) : (
                  <>
                    <FiSearch /> Tìm phòng trống
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Choose Room */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  <FiArrowLeft /> Quay lại
                </button>
                <p className="text-sm text-gray-500">
                  {customerInfo.ngayNhan} → {customerInfo.ngayTra} ({calcDays()}{" "}
                  ngày)
                </p>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Chọn phòng phù hợp
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableRooms.map((room) => (
                  <div
                    key={room.MA_PHONG}
                    onClick={() => setSelectedRoom(room)}
                    className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedRoom?.MA_PHONG === room.MA_PHONG
                        ? "border-amber-500 bg-amber-50 shadow-md"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">
                        {room.TEN_PHONG}
                      </h3>
                      {selectedRoom?.MA_PHONG === room.MA_PHONG && (
                        <FiCheckCircle className="text-amber-500 text-xl" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {room.TEN_LOAI}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Tầng {room.TANG} • Sức chứa {room.SUC_CHUA}
                      </span>
                      <span className="text-amber-600 font-bold">
                        {formatCurrency(room.GIA_MOI_NGAY)}/ngày
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                      <span className="text-lg font-bold text-amber-600">
                        {formatCurrency(room.GIA_MOI_NGAY * calcDays())}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        / {calcDays()} ngày
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {availableRooms.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <MdPets className="text-gray-300 text-6xl mx-auto mb-3" />
                  <p className="text-gray-400">Không có phòng trống phù hợp</p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-4 text-amber-600 font-medium"
                  >
                    Thay đổi ngày
                  </button>
                </div>
              )}

              {selectedRoom && (
                <div className="mt-6 text-right">
                  <button
                    onClick={() => setStep(3)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    Tiếp theo <FiArrowRight />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Extra Services */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  <FiArrowLeft /> Quay lại
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Thêm dịch vụ chăm sóc
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Tùy chọn - bạn có thể bỏ qua bước này
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {allServices.map((sv) => {
                  const icons = {
                    "Tắm spa": "🛁",
                    "Cắt tỉa lông": "✂️",
                    "Khám sức khỏe": "🏥",
                    "Tiêm phòng": "💉",
                    "Dắt đi dạo": "🚶",
                    "Ăn uống đặc biệt": "🍖",
                    "Huấn luyện cơ bản": "🎓",
                    "Cắt móng": "💅",
                  };
                  const isSelected = selectedServices.includes(sv.MA_DV);
                  return (
                    <div
                      key={sv.MA_DV}
                      onClick={() => toggleService(sv.MA_DV)}
                      className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all flex items-center gap-4 ${
                        isSelected
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {icons[sv.TEN_DV] || "🐾"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800">
                          {sv.TEN_DV}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {sv.MO_TA}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-amber-600">
                          {formatCurrency(sv.GIA)}
                        </p>
                        {isSelected && (
                          <FiCheckCircle className="text-amber-500 mt-1 ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-right">
                <button
                  onClick={() => setStep(4)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  Xác nhận đặt phòng <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  <FiArrowLeft /> Quay lại
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Xác nhận đặt phòng
              </h2>

              <div className="space-y-6">
                {/* Customer summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div>
                      <span className="text-gray-500">Họ tên:</span>{" "}
                      <span className="font-medium">{customerInfo.hoTen}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SĐT:</span>{" "}
                      <span className="font-medium">
                        {customerInfo.soDienThoai}
                      </span>
                    </div>
                    {customerInfo.email && (
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        <span className="font-medium">
                          {customerInfo.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pet summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Thông tin thú cưng
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div>
                      <span className="text-gray-500">Tên:</span>{" "}
                      <span className="font-medium">
                        {customerInfo.tenThuCung}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Loài:</span>{" "}
                      <span className="font-medium">
                        {getPetTypeLabel(customerInfo.loaiThuCung)}
                      </span>
                    </div>
                    {customerInfo.giong && (
                      <div>
                        <span className="text-gray-500">Giống:</span>{" "}
                        <span className="font-medium">
                          {customerInfo.giong}
                        </span>
                      </div>
                    )}
                    {customerInfo.canNang && (
                      <div>
                        <span className="text-gray-500">Cân nặng:</span>{" "}
                        <span className="font-medium">
                          {customerInfo.canNang} kg
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Room & dates */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Phòng & thời gian
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div>
                      <span className="text-gray-500">Phòng:</span>{" "}
                      <span className="font-medium">
                        {selectedRoom?.TEN_PHONG} - {selectedRoom?.TEN_LOAI}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tầng:</span>{" "}
                      <span className="font-medium">{selectedRoom?.TANG}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Nhận phòng:</span>{" "}
                      <span className="font-medium">
                        {customerInfo.ngayNhan}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Trả phòng:</span>{" "}
                      <span className="font-medium">
                        {customerInfo.ngayTra}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Số ngày:</span>{" "}
                      <span className="font-medium">{days} ngày</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                {selectedServices.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Dịch vụ thêm
                    </h3>
                    <div className="space-y-2">
                      {selectedServices.map((id) => {
                        const sv = allServices.find((s) => s.MA_DV === id);
                        return sv ? (
                          <div
                            key={id}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <span>{sv.TEN_DV}</span>
                            <span className="font-medium">
                              {formatCurrency(sv.GIA)}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Tiền phòng ({days} ngày ×{" "}
                        {selectedRoom
                          ? formatCurrency(selectedRoom.GIA_MOI_NGAY)
                          : ""}
                        )
                      </span>
                      <span className="font-medium">
                        {formatCurrency(roomCost)}
                      </span>
                    </div>
                    {serviceCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dịch vụ thêm</span>
                        <span className="font-medium">
                          {formatCurrency(serviceCost)}
                        </span>
                      </div>
                    )}
                    <hr className="border-amber-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-800">Tổng cộng (dự kiến)</span>
                      <span className="text-amber-600">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {customerInfo.ghiChu && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Ghi chú
                    </h3>
                    <p className="text-sm text-gray-600">
                      {customerInfo.ghiChu}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <FiCheckCircle /> Xác nhận đặt phòng
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Sau khi đặt phòng, nhân viên sẽ liên hệ xác nhận trong vòng 30
                  phút
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
