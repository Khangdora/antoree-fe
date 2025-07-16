import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections: {
    title: string;
    links: Array<{ name: string; href: string; external?: boolean }>;
  }[] = [
    {
      title: 'Về chúng tôi',
      links: [
        { name: 'Giới thiệu', href: '/about' },
        { name: 'Tuyển dụng', href: '/careers' },
        { name: 'Tin tức', href: '/news' },
        { name: 'Liên hệ', href: '/contact' },
      ],
    },
    {
      title: 'Hỗ trợ học viên',
      links: [
        { name: 'Hướng dẫn học tập', href: '/help/guide' },
        { name: 'Chính sách hoàn tiền', href: '/help/refund-policy' },
        { name: 'Chứng chỉ', href: '/help/certificates' },
        { name: 'Câu hỏi thường gặp', href: '/help/faq' },
      ],
    },
    {
      title: 'Danh mục khóa học',
      links: [
        { name: 'Lập trình Web', href: '/categories/web-development' },
        { name: 'Thiết kế đồ họa', href: '/categories/design' },
        { name: 'Marketing', href: '/categories/marketing' },
        { name: 'Kinh doanh', href: '/categories/business' },
      ],
    },
    {
      title: 'Kết nối với chúng tôi',
      links: [
        { name: 'Facebook', href: 'https://facebook.com', external: true },
        { name: 'Instagram', href: 'https://instagram.com', external: true },
        { name: 'Youtube', href: 'https://youtube.com', external: true },
        { name: 'Zalo', href: 'https://zalo.me', external: true },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="ml-2 text-xl font-bold text-white">
                Antoree
              </span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Nền tảng học trực tuyến hàng đầu Việt Nam với hơn 1.000 khóa học chất lượng cao. 
              Cam kết mang đến kiến thức thực tiễn và chứng chỉ được công nhận.
            </p>
            <div className="flex space-x-4">
              <a href="tel:0974867266" className="text-blue-400 hover:text-blue-300 transition-colors">
                📞 0974 867 266
              </a>
              <a href="mailto:khangdora2809@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                ✉️ khangdora2809@gmail.com
              </a>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter subscription */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Đăng ký nhận tin khuyến mãi</h3>
              <p className="text-gray-400">Nhận thông tin về các sản phẩm mới và ưu đãi độc quyền</p>
            </div>
            <div className="flex max-w-md">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors duration-200">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Payment and certification */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold mb-2">Phương thức thanh toán</h4>
              <div className="flex space-x-2">
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs">VISA</span>
                </div>
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs">MC</span>
                </div>
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs">ATM</span>
                </div>
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs">COD</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Chứng nhận</h4>
              <div className="flex space-x-2">
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs">BCT</span>
                </div>
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs">SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-400">
              © {currentYear} <a href="https://khangdora.io.vn" target='_blank'>Khang Dora</a>. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                Chính sách Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
