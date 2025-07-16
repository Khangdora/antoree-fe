const PromotionsPage = () => {
  const promotions = [
    {
      id: 1,
      title: 'Flash Sale 12.12',
      description: 'Giảm giá lên đến 50% cho tất cả sản phẩm điện thoại',
      discount: '50%',
      endDate: '2025-12-12',
      image: '/api/placeholder/400/300',
      category: 'Điện thoại',
      isHot: true,
    },
    {
      id: 2,
      title: 'Laptop Gaming Sale',
      description: 'Ưu đãi đặc biệt cho laptop gaming cao cấp',
      discount: '30%',
      endDate: '2025-07-20',
      image: '/api/placeholder/400/300',
      category: 'Laptop',
      isHot: false,
    },
    {
      id: 3,
      title: 'Apple Week',
      description: 'Tuần lễ sản phẩm Apple với nhiều ưu đãi hấp dẫn',
      discount: '25%',
      endDate: '2025-07-15',
      image: '/api/placeholder/400/300',
      category: 'Apple',
      isHot: true,
    },
    {
      id: 4,
      title: 'Smart Home Sale',
      description: 'Giảm giá thiết bị nhà thông minh cho ngôi nhà hiện đại',
      discount: '40%',
      endDate: '2025-07-25',
      image: '/api/placeholder/400/300',
      category: 'Nhà thông minh',
      isHot: false,
    },
  ];

  const flashSaleProducts = [
    {
      id: 1,
      name: 'Samsung Galaxy S24 Ultra',
      price: 28990000,
      originalPrice: 35990000,
      image: '/api/placeholder/200/200',
      discount: 19,
      timeLeft: '2h 30m',
      sold: 45,
      total: 100,
    },
    {
      id: 2,
      name: 'MacBook Air M3',
      price: 32500000,
      originalPrice: 36990000,
      image: '/api/placeholder/200/200',
      discount: 12,
      timeLeft: '2h 30m',
      sold: 23,
      total: 50,
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5',
      price: 7990000,
      originalPrice: 9990000,
      image: '/api/placeholder/200/200',
      discount: 20,
      timeLeft: '2h 30m',
      sold: 78,
      total: 100,
    },
    {
      id: 4,
      name: 'Apple Watch Series 9',
      price: 9500000,
      originalPrice: 10990000,
      image: '/api/placeholder/200/200',
      discount: 14,
      timeLeft: '2h 30m',
      sold: 34,
      total: 80,
    },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 mb-12 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">🔥 Khuyến mãi HOT</h1>
        <p className="text-xl mb-6">Cơ hội vàng sở hữu sản phẩm yêu thích với giá tốt nhất!</p>
        <div className="flex justify-center items-center space-x-4">
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold">02</span>
            <p className="text-sm">Giờ</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold">30</span>
            <p className="text-sm">Phút</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold">45</span>
            <p className="text-sm">Giây</p>
          </div>
        </div>
      </div>

      {/* Flash Sale */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            ⚡ Flash Sale - Giá sốc
          </h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-4xl">📱</span>
                </div>
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                  -{product.discount}%
                </div>
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 text-xs font-bold rounded">
                  {product.timeLeft}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Đã bán: {product.sold}</span>
                    <span>Còn: {product.total - product.sold}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(product.sold / product.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors duration-200">
                  Mua ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotion Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Chương trình khuyến mãi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
              {promo.isHot && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm font-bold rounded-full z-10">
                  HOT 🔥
                </div>
              )}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-6xl">🎁</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {promo.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {promo.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-3 py-1 rounded-full font-semibold">
                    Giảm {promo.discount}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Kết thúc: {promo.endDate}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Voucher Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Mã giảm giá
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { code: 'SAVE50K', discount: '50.000đ', condition: 'Đơn từ 500.000đ', expire: '31/07/2025' },
            { code: 'NEWBIE20', discount: '20%', condition: 'Khách hàng mới', expire: '31/07/2025' },
            { code: 'FREESHIP', discount: 'Miễn phí ship', condition: 'Đơn từ 200.000đ', expire: '31/07/2025' },
          ].map((voucher, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {voucher.code}
                </h3>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-semibold">
                  {voucher.discount}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {voucher.condition}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  HSD: {voucher.expire}
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200">
                  Sao chép
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PromotionsPage;
