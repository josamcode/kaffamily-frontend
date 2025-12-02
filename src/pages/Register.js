import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    country: '',
    dateOfBirth: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    college: '',
    university: '',
    residence: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Parse dateOfBirth if it exists (for editing scenarios)
  useEffect(() => {
    if (formData.dateOfBirth && !formData.birthDay && !formData.birthMonth && !formData.birthYear) {
      const date = new Date(formData.dateOfBirth);
      if (!isNaN(date.getTime())) {
        setFormData(prev => ({
          ...prev,
          birthDay: String(date.getDate()).padStart(2, '0'),
          birthMonth: String(date.getMonth() + 1).padStart(2, '0'),
          birthYear: String(date.getFullYear())
        }));
      }
    }
  }, [formData.dateOfBirth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // Validate date of birth
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      setError('يرجى إدخال تاريخ الميلاد كاملاً');
      return;
    }

    const selectedDate = new Date(
      parseInt(formData.birthYear),
      parseInt(formData.birthMonth) - 1,
      parseInt(formData.birthDay)
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setError('تاريخ الميلاد لا يمكن أن يكون في المستقبل');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    const { confirmPassword, birthDay, birthMonth, birthYear, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      showToast('تم التسجيل بنجاح! حسابك في انتظار موافقة المسؤول.', 'success');
      navigate('/login');
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        const errorMsg = result.message || 'خطأ في التسجيل';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              إنشاء حساب جديد
            </h2>
            <p className="text-gray-600 text-sm">
              املأ البيانات التالية للتسجيل
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="جرجس صموئيل"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال *
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="text"
                  required
                  pattern="^01\d{9}$"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="01204770940"
                  value={formData.mobile}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">مثال: 01234567890</p>
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  البلد *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="مطاى"
                  value={formData.country}
                  onChange={handleChange}
                />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الميلاد *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Day */}
                  <div className="relative">
                    <select
                      name="birthDay"
                      value={formData.birthDay || ''}
                      onChange={(e) => {
                        const day = e.target.value;
                        const month = formData.birthMonth || '01';
                        const year = formData.birthYear || '2000';
                        const dateStr = `${year}-${month}-${day.padStart(2, '0')}`;
                        setFormData({
                          ...formData,
                          birthDay: day,
                          dateOfBirth: dateStr
                        });
                      }}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer hover:border-gray-400 text-gray-900 font-medium"
                    >
                      <option value="" disabled>اليوم</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Month */}
                  <div className="relative">
                    <select
                      name="birthMonth"
                      value={formData.birthMonth || ''}
                      onChange={(e) => {
                        const month = e.target.value;
                        const day = formData.birthDay || '01';
                        const year = formData.birthYear || '2000';
                        const dateStr = `${year}-${month}-${day.padStart(2, '0')}`;
                        setFormData({
                          ...formData,
                          birthMonth: month,
                          dateOfBirth: dateStr
                        });
                      }}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer hover:border-gray-400 text-gray-900 font-medium"
                    >
                      <option value="" disabled>الشهر</option>
                      {[
                        { value: '01', label: 'يناير' },
                        { value: '02', label: 'فبراير' },
                        { value: '03', label: 'مارس' },
                        { value: '04', label: 'أبريل' },
                        { value: '05', label: 'مايو' },
                        { value: '06', label: 'يونيو' },
                        { value: '07', label: 'يوليو' },
                        { value: '08', label: 'أغسطس' },
                        { value: '09', label: 'سبتمبر' },
                        { value: '10', label: 'أكتوبر' },
                        { value: '11', label: 'نوفمبر' },
                        { value: '12', label: 'ديسمبر' }
                      ].map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Year */}
                  <div className="relative">
                    <select
                      name="birthYear"
                      value={formData.birthYear || ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        const day = formData.birthDay || '01';
                        const month = formData.birthMonth || '01';
                        const dateStr = `${year}-${month}-${day.padStart(2, '0')}`;
                        setFormData({
                          ...formData,
                          birthYear: year,
                          dateOfBirth: dateStr
                        });
                      }}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer hover:border-gray-400 text-gray-900 font-medium"
                    >
                      <option value="" disabled>السنة</option>
                      {Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return year;
                      }).map(year => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>

              {/* College */}
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-2">
                  الكلية
                </label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="الهندسة"
                  value={formData.college}
                  onChange={handleChange}
                />
              </div>

              {/* University */}
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                  الجامعة
                </label>
                <input
                  id="university"
                  name="university"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="جامعة القاهرة"
                  value={formData.university}
                  onChange={handleChange}
                />
              </div>

              {/* Residence */}
              <div className="md:col-span-2">
                <label htmlFor="residence" className="block text-sm font-medium text-gray-700 mb-2">
                  السكن
                </label>
                <input
                  id="residence"
                  name="residence"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="القاهرة"
                  value={formData.residence}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="12345678"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="12345678"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    جاري التسجيل...
                  </span>
                ) : (
                  'إنشاء الحساب'
                )}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  سجل الدخول
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
