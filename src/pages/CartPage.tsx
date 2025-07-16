const CartPage = () => {
  const cartItems = [
    {
      id: 1,
      name: 'Samsung Galaxy S24 Ultra',
      price: 28990000,
      quantity: 1,
      image: '/api/placeholder/100/100',
    },
    {
      id: 2,
      name: 'Sony WH-1000XM5',
      price: 7990000,
      quantity: 2,
      image: '/api/placeholder/100/100',
    },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Giỏ hàng của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-red-600 font-bold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    -
                  </button>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    +
                  </button>
                </div>
                <button className="ml-4 text-red-500 hover:text-red-700">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tóm tắt đơn hàng
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tạm tính:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vận chuyển:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tổng cộng:
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
