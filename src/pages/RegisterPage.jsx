import React, { useState } from 'react';
import { Gem, UserPlus, Pickaxe, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import { register } from '../utils/userApi';
import { useLanguage } from '../context/LanguageContext';

export const RegisterPage = ({ onRegisterSuccess, onBackToLogin }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const validations = {
    username: {
      minLength: formData.username.length >= 3,
      maxLength: formData.username.length <= 20,
      validChars: /^[a-zA-Z0-9_]*$/.test(formData.username),
      notEmpty: formData.username.length > 0
    },
    email: {
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      notEmpty: formData.email.length > 0
    },
    password: {
      minLength: formData.password.length >= 6,
      notEmpty: formData.password.length > 0
    },
    confirmPassword: {
      matches: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
      notEmpty: formData.confirmPassword.length > 0
    }
  };

  const isFormValid = 
    validations.username.minLength && 
    validations.username.maxLength && 
    validations.username.validChars &&
    validations.email.valid &&
    validations.password.minLength &&
    validations.confirmPassword.matches;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await register(formData.username, formData.email, formData.password);
      onRegisterSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ valid }) => (
    valid ? (
      <Check className="w-4 h-4 text-green-400" />
    ) : (
      <X className="w-4 h-4 text-gray-600" />
    )
  );

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0d1117] p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>
      
      <div className="w-full max-w-md text-center relative z-10">
        {/* Logo */}
        <div className="mb-6 relative inline-block">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 p-3 rounded-2xl border border-emerald-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2">
              <Pickaxe className="w-6 h-6 text-emerald-400 opacity-60 -rotate-45" />
              <Gem className="w-8 h-8 text-emerald-400" />
              <Pickaxe className="w-6 h-6 text-emerald-400 opacity-60 rotate-45" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          {t('auth.createAccount')}
        </h1>
        <p className="text-gray-400 mb-6 text-sm">{t('auth.signUp')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Username */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('auth.username')}</label>
            <input 
              type="text" 
              name="username"
              value={formData.username} 
              onChange={handleChange}
              placeholder="miner_123" 
              className="w-full px-4 py-3 text-emerald-300 placeholder-gray-600 bg-[#161b22] border border-gray-700 hover:border-emerald-500/50 focus:border-emerald-500 rounded-lg text-base font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              autoComplete="username"
            />
            {formData.username && (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <ValidationIcon valid={validations.username.minLength && validations.username.maxLength} />
                  <span className={validations.username.minLength && validations.username.maxLength ? 'text-green-400' : 'text-gray-500'}>
                    3-20 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon valid={validations.username.validChars} />
                  <span className={validations.username.validChars ? 'text-green-400' : 'text-gray-500'}>
                    Only letters, numbers, and underscores
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('auth.email')}</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              placeholder="miner@codequarry.dev" 
              className="w-full px-4 py-3 text-emerald-300 placeholder-gray-600 bg-[#161b22] border border-gray-700 hover:border-emerald-500/50 focus:border-emerald-500 rounded-lg text-base font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              autoComplete="email"
            />
            {formData.email && !validations.email.valid && (
              <p className="mt-1 text-xs text-red-400">Please enter a valid email address</p>
            )}
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password} 
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full px-4 py-3 pr-10 text-emerald-300 placeholder-gray-600 bg-[#161b22] border border-gray-700 hover:border-emerald-500/50 focus:border-emerald-500 rounded-lg text-base font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <ValidationIcon valid={validations.password.minLength} />
                <span className={validations.password.minLength ? 'text-green-400' : 'text-gray-500'}>
                  At least 6 characters
                </span>
              </div>
            )}
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword} 
              onChange={handleChange}
              placeholder="••••••••" 
              className="w-full px-4 py-3 text-emerald-300 placeholder-gray-600 bg-[#161b22] border border-gray-700 hover:border-emerald-500/50 focus:border-emerald-500 rounded-lg text-base font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              autoComplete="new-password"
            />
            {formData.confirmPassword && !validations.confirmPassword.matches && (
              <p className="mt-1 text-xs text-red-400">Passwords don't match</p>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                Create Account
              </>
            )}
          </button>
        </form>
        
        {/* Back to login */}
        <button
          onClick={onBackToLogin}
          className="mt-6 text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Already have an account? Sign in
        </button>
        
        <p className="text-xs text-gray-600 mt-6 font-mono">Your progress will be saved across devices</p>
      </div>
    </div>
  );
};

export default RegisterPage;
