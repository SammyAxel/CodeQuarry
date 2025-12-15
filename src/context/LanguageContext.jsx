/**
 * Language Context for Internationalization (i18n)
 * Supports English and Indonesian (Bahasa Indonesia)
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';

const LanguageContext = createContext();

// Indonesian translations
const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      admin: 'Admin',
      logout: 'Logout',
    },
    // Home Page
    home: {
      title: 'Master Programming Through Interactive Practice',
      subtitle: 'Learn to code with hands-on exercises, real-time feedback, and guided lessons. From beginner to advanced.',
      getStarted: 'Get Started',
      features: {
        interactive: 'Interactive Practice',
        interactiveDesc: 'Write real code in your browser with instant feedback',
        guided: 'Guided Learning',
        guidedDesc: 'Step-by-step lessons that build your skills progressively',
        realtime: 'Real-time Feedback',
        realtimeDesc: 'Get immediate results and hints to guide your learning',
      },
      courses: 'Available Courses',
      modules: 'modules',
      comingSoon: 'Coming Soon',
    },
    // Authentication
    auth: {
      login: 'Login',
      loginSubtitle: 'Sign in to continue your mining expedition',
      register: 'Register',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      signIn: 'Sign In',
      signUp: 'Sign Up',
      adminPortal: 'Admin Portal',
      adminPassword: 'Admin Password',
      modPassword: 'Moderator Password',
      loginAsAdmin: 'Login as Admin',
      loginAsMod: 'Login as Moderator',
      cancel: 'Cancel',
    },
    // Dashboard
    dashboard: {
      title: 'Your Learning Dashboard',
      stats: {
        modulesCompleted: 'Modules Completed',
        currentStreak: 'Current Streak',
        days: 'days',
        timeSpent: 'Time Spent',
        hours: 'hours',
        longestStreak: 'Longest Streak',
      },
      progress: 'Overall Progress',
      continue: 'Continue Learning',
      completed: 'Completed Courses',
      activity: 'Activity (Last 7 Days)',
      noProgress: 'Start learning to see your progress here',
    },
    // Profile
    profile: {
      title: 'Profile',
      displayName: 'Display Name',
      email: 'Email',
      username: 'Username',
      verified: 'Verified',
      memberSince: 'Member Since',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      updatePassword: 'Update Password',
    },
    // Practice Mode
    practice: {
      hint: 'Hint',
      run: 'Run',
      submit: 'Submit',
      reset: 'Reset',
      loading: 'Loading...',
      output: 'Output',
      success: 'Success!',
      error: 'Error',
      nextLesson: 'Next Lesson',
      prevLesson: 'Previous Lesson',
      completed: 'Module Completed!',
      wellDone: 'Well done! Keep up the great work.',
    },
    // Course Map
    map: {
      title: 'Course Map',
      close: 'Close Map',
      completed: 'Completed',
      current: 'Current',
      locked: 'Locked',
    },
    // Common
    common: {
      backToHome: 'Back to Home',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
    },
  },
  id: {
    // Navigation
    nav: {
      dashboard: 'Dasbor',
      users: 'Pengguna',
      admin: 'Admin',
      leaderboard: 'Peringkat',
      shop: 'Toko',
      logout: 'Keluar',
    },
    // Home Page
    home: {
      title: 'Kuasai Pemrograman Melalui Praktik Interaktif',
      subtitle: 'Belajar coding dengan latihan langsung, feedback real-time, dan panduan terstruktur. Dari pemula hingga mahir.',
      getStarted: 'Mulai Belajar',
      features: {
        interactive: 'Praktik Interaktif',
        interactiveDesc: 'Tulis kode asli di browser dengan feedback instan',
        guided: 'Pembelajaran Terarah',
        guidedDesc: 'Pelajaran bertahap yang membangun kemampuan Anda secara progresif',
        realtime: 'Feedback Real-time',
        realtimeDesc: 'Dapatkan hasil dan petunjuk langsung untuk memandu pembelajaran Anda',
      },
      courses: 'Kursus Tersedia',
      modules: 'modul',
      comingSoon: 'Segera Hadir',
    },
    // Authentication
    auth: {
      login: 'Masuk',
      loginSubtitle: 'Masuk untuk melanjutkan ekspedisi coding Anda',
      register: 'Daftar',
      username: 'Nama Pengguna',
      email: 'Email',
      password: 'Kata Sandi',
      confirmPassword: 'Konfirmasi Kata Sandi',
      createAccount: 'Buat Akun',
      alreadyHaveAccount: 'Sudah punya akun?',
      dontHaveAccount: 'Belum punya akun?',
      signIn: 'Masuk',
      signUp: 'Daftar',
      adminPortal: 'Portal Admin',
      adminPassword: 'Kata Sandi Admin',
      modPassword: 'Kata Sandi Moderator',
      loginAsAdmin: 'Masuk sebagai Admin',
      loginAsMod: 'Masuk sebagai Moderator',
      cancel: 'Batal',
    },
    // Dashboard
    dashboard: {
      title: 'Dasbor Pembelajaran Anda',
      stats: {
        modulesCompleted: 'Modul Selesai',
        currentStreak: 'Streak Saat Ini',
        days: 'hari',
        timeSpent: 'Waktu Belajar',
        hours: 'jam',
        longestStreak: 'Streak Terpanjang',
      },
      progress: 'Progress Keseluruhan',
      continue: 'Lanjutkan Belajar',
      completed: 'Kursus Selesai',
      activity: 'Aktivitas (7 Hari Terakhir)',
      noProgress: 'Mulai belajar untuk melihat progress Anda di sini',
    },
    // Profile
    profile: {
      title: 'Profil',
      displayName: 'Nama Tampilan',
      email: 'Email',
      username: 'Nama Pengguna',
      verified: 'Terverifikasi',
      memberSince: 'Anggota Sejak',
      changePassword: 'Ubah Kata Sandi',
      currentPassword: 'Kata Sandi Saat Ini',
      newPassword: 'Kata Sandi Baru',
      confirmNewPassword: 'Konfirmasi Kata Sandi Baru',
      save: 'Simpan',
      cancel: 'Batal',
      edit: 'Ubah',
      updatePassword: 'Perbarui Kata Sandi',
    },
    // Practice Mode
    practice: {
      hint: 'Petunjuk',
      run: 'Jalankan',
      submit: 'Kumpulkan',
      reset: 'Reset',
      loading: 'Memuat...',
      output: 'Hasil',
      success: 'Berhasil!',
      error: 'Error',
      nextLesson: 'Pelajaran Berikutnya',
      prevLesson: 'Pelajaran Sebelumnya',
      completed: 'Modul Selesai!',
      wellDone: 'Kerja bagus! Terus pertahankan!',
    },
    // Course Map
    map: {
      title: 'Peta Kursus',
      close: 'Tutup Peta',
      completed: 'Selesai',
      current: 'Saat Ini',
      locked: 'Terkunci',
    },
    // Common
    common: {
      backToHome: 'Kembali ke Beranda',
      loading: 'Memuat...',
      error: 'Error',
      success: 'Berhasil',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      close: 'Tutup',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) return key; // Return key if translation not found
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
