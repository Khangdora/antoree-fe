# AnToRee Academy - Nền tảng học trực tuyến với Render Sleep Handling

AnToRee Academy là một nền tảng học trực tuyến hiện đại được xây dựng bằng React, TypeScript và Tailwind CSS. Dự án cung cấp hơn 1000+ khóa học chất lượng cao từ các lĩnh vực như lập trình, thiết kế, marketing, kinh doanh và nhiều hơn nữa.

## 🔗 Production Links

- **Production API**: https://antoree-api.onrender.com/api
- **Health Check**: https://antoree-api.onrender.com/api/health
- **GitHub Repository**: https://github.com/your-username/antoree

## ✨ Tính năng chính

### 🎓 Khóa học đa dạng
- **Lập trình Web**: ReactJS, Node.js, Python, JavaScript
- **Thiết kế đồ họa**: Photoshop, Illustrator, UI/UX Design
- **Marketing**: Digital Marketing, Social Media, SEO
- **Kinh doanh**: Quản lý, Khởi nghiệp, Phân tích dữ liệu
- **Ngoại ngữ**: Tiếng Anh, Tiếng Nhật, Tiếng Hàn

### 🔍 Tìm kiếm thông minh
- Tìm kiếm theo tên khóa học với API integration
- Lọc theo danh mục và cấp độ
- Sắp xếp theo giá và đánh giá
- Gợi ý tìm kiếm thông minh

### 📱 Giao diện responsive với animations
- Tối ưu cho mobile, tablet và desktop
- Dark mode / Light mode
- Framer Motion animations và hiệu ứng smooth
- SVG icons thay thế emoji
- Loading skeletons cho UX tốt hơn

### 🛌 Render Sleep Handling
- **Auto wake-up**: Tự động đánh thức server khi sleeping
- **Smart retry**: Retry với exponential backoff
- **User feedback**: Hiển thị progress và GitHub link
- **Fallback data**: Local data khi server không available
- **Extended timeout**: 30s timeout cho Render cold start

### 🎯 SEO tối ưu
- Meta tags đầy đủ
- Open Graph và Twitter Cards
- Structured data
- Sitemap và robots.txt

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19** - Framework chính
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Helmet Async** - SEO meta tags

### Tools & Build
- **Vite** - Build tool và dev server
- **ESLint** - Code linting

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Header với navigation, search
│   │   ├── Footer.tsx          # Footer với links và info
│   │   └── Layout.tsx          # Layout wrapper
│   └── ui/
│       ├── CourseCard.tsx      # Component hiển thị khóa học
│       ├── Loading.tsx         # Loading spinner
│       └── EmptyState.tsx      # Empty state component
├── pages/
│   ├── HomePage.tsx            # Trang chủ
│   ├── CoursesPage.tsx         # Danh sách khóa học
│   ├── SearchPage.tsx          # Trang tìm kiếm
│   ├── ContactPage.tsx         # Liên hệ
│   └── ...
├── contexts/
│   └── ThemeContext.tsx        # Context cho dark/light mode
├── data/
│   └── data.json              # Dữ liệu khóa học
└── index.css                  # Global styles
```

## 🎨 Thiết kế và UX

### Color Scheme
- **Primary**: Blue (#3B82F6) - Tin cậy, chuyên nghiệp
- **Secondary**: Purple (#8B5CF6) - Sáng tạo, học tập
- **Accent**: Yellow (#F59E0B) - Nổi bật, khuyến khích

### Components
- **Course Cards**: Hiển thị thông tin khóa học với hover effects
- **Search Bar**: Autocomplete với results preview
- **Filters**: Category, price range, level, rating
- **Navigation**: Sticky header với dropdowns

## 🔧 Customization

### Thêm khóa học mới
Chỉnh sửa file `src/data/data.json` và thêm object course mới.

### Thêm danh mục mới
Cập nhật icon mapping trong các component.

## 📊 Performance

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 98+
- **Best Practices**: 100
- **SEO**: 100

## 🌐 SEO Features

### Meta Tags
- Title và description cho mỗi trang
- Open Graph tags cho social sharing
- Twitter Cards
- Canonical URLs

## 🔐 Accessibility

### WCAG 2.1 AA Compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Alt text for images

## 📞 Support

- Email: support@antoree.com
- Phone: 1900 1234

---

**Antoree Academy** - Học thông minh, thành công bền vững! 🚀
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
