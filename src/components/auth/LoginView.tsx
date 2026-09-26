import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  Phone,
} from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';

type LoginRoleTab = 'ADMIN' | 'TEACHER' | 'PARENT';

export const LoginView: React.FC = () => {
  const {
    school,
    allUsers,
    login,
    changeTeacherPassword,
  } = useSchool();

  const [activeRoleTab, setActiveRoleTab] = useState<LoginRoleTab>('ADMIN');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Change Teacher Password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [cpIdentifier, setCpIdentifier] = useState('');
  const [cpOldPassword, setCpOldPassword] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirmPassword, setCpConfirmPassword] = useState('');
  const [cpShowOld, setCpShowOld] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpShowConfirm, setCpShowConfirm] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);
  const [cpSuccess, setCpSuccess] = useState<string | null>(null);
  const [cpIsLoading, setCpIsLoading] = useState(false);

  // Teacher list for quick selection in change password modal
  const teacherUsers = allUsers.filter(u => u.role === 'TEACHER');

  const handleRoleTabSwitch = (tab: LoginRoleTab) => {
    setActiveRoleTab(tab);
    setErrorMessage(null);
    if (tab === 'ADMIN') {
      setCredential('samuel.adeleke@thecitadelschools.com');
      setPassword('admin');
    } else if (tab === 'TEACHER') {
      setCredential('david.adeleke@thecitadelschools.com');
      setPassword('teacher123');
    } else if (tab === 'PARENT') {
      setCredential('m.okonkwo@medicare.ng');
      setPassword('parent123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(credential, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed.');
      }
    }, 300);
  };

  const handleQuickGeneralAdminLogin = () => {
    login('admin', 'admin');
  };

  const handleOpenChangePassword = (initialId?: string) => {
    setCpError(null);
    setCpSuccess(null);
    setCpOldPassword('');
    setCpNewPassword('');
    setCpConfirmPassword('');
    if (initialId) {
      setCpIdentifier(initialId);
    } else if (activeRoleTab === 'TEACHER' && credential) {
      setCpIdentifier(credential);
    } else {
      setCpIdentifier('david.adeleke@thecitadelschools.com');
    }
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCpError(null);
    setCpSuccess(null);

    if (!cpIdentifier.trim()) {
      setCpError('Please enter your Teacher email address or Staff ID.');
      return;
    }
    if (!cpOldPassword.trim()) {
      setCpError('Please enter your current (old) password.');
      return;
    }
    if (!cpNewPassword.trim()) {
      setCpError('Please enter your new password.');
      return;
    }
    if (cpNewPassword.length < 6) {
      setCpError('New password must be at least 6 characters in length.');
      return;
    }
    if (cpNewPassword !== cpConfirmPassword) {
      setCpError('New password and confirm password do not match.');
      return;
    }
    if (cpOldPassword.trim() === cpNewPassword.trim()) {
      setCpError('New password cannot be identical to your old password.');
      return;
    }

    setCpIsLoading(true);
    setTimeout(() => {
      const result = changeTeacherPassword(cpIdentifier, cpOldPassword, cpNewPassword);
      setCpIsLoading(false);

      if (!result.success) {
        setCpError(result.error || 'Failed to update password. Please check your credentials.');
      } else {
        setCpSuccess('Your password has been successfully updated! You can now log in with your new credentials.');
        setCredential(cpIdentifier);
        setPassword(cpNewPassword);
        setActiveRoleTab('TEACHER');
        setSuccessMessage('Password changed successfully! Click Sign In below to access your account.');
        setTimeout(() => setSuccessMessage(null), 6000);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Branding & Highlights Hero Panel */}
      <div className="lg:w-1/2 p-5 sm:p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Institutional Branding - Large and Centered */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6 pt-1 sm:pt-2">
          {/* Top Bar with Platform Badge */}
          <div className="flex items-center justify-center w-full max-w-xl mx-auto">
            <div className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-xs">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen size={12} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-black text-white font-heading tracking-wide">SchoolOS</span>
              <span className="w-1 h-1 rounded-full bg-cyan-400" />
              <span className="text-[10px] sm:text-[11px] text-cyan-300 font-medium">Enterprise v1.0</span>
            </div>
          </div>

          {/* School Name & Motto - Responsive Sizing */}
          <div className="space-y-2 sm:space-y-3 max-w-xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-cyan-300 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Unified Academic Institution</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-200 tracking-tight font-heading leading-tight">
              {school.name}
            </h1>

            <p className="text-xs sm:text-base lg:text-lg text-indigo-200/90 font-medium italic tracking-wide">
              "{school.motto}"
            </p>
          </div>
        </div>

        {/* Feature Pillars Cards - Visible on medium and desktop screens */}
        <div className="relative z-10 hidden md:grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 lg:my-8">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-xs font-bold text-white font-heading">Admin Command</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Classes, subject curriculum, and result verification lock.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
            <h4 className="text-xs font-bold text-white font-heading">Faculty Gradebook</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              CA & Exam score entries, weekly timetables, and auto-remarks.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users size={18} />
            </div>
            <h4 className="text-xs font-bold text-white font-heading">Guardian Portal</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Instant report cards, daily attendance logs, and alerts.
            </p>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 text-[11px] text-slate-400 hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-slate-800">
          <span>{school.address}</span>
          <span className="text-emerald-400 font-mono font-bold">● System Operational (Online)</span>
        </div>
      </div>

      {/* Right Login Card Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white text-slate-900">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <span className="badge badge-cyan text-[10px] font-bold uppercase tracking-wider">
              Secure Institutional Authentication
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 font-heading tracking-tight">
              Sign In to Your Portal
            </h2>
            <p className="text-xs text-slate-500">
              Select your role below or enter your registered school credentials to proceed.
            </p>
          </div>

          {/* Quick General Admin 1-Click Login Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                General Admin Access
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                School Principal / Super Admin
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickGeneralAdminLogin}
              className="btn btn-primary btn-sm bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm whitespace-nowrap"
            >
              <span>1-Click Admin Login</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Role Tab Buttons */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleTabSwitch('ADMIN')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'ADMIN'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabSwitch('TEACHER')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'TEACHER'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={14} />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabSwitch('PARENT')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'PARENT'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>Parent</span>
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-medium animate-fade-in">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {activeRoleTab === 'TEACHER' ? 'Official Email or Staff ID' : 'Login Email Address'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={
                    activeRoleTab === 'TEACHER'
                      ? 'david.adeleke@thecitadelschools.com or STAFF/2024/001'
                      : activeRoleTab === 'PARENT'
                      ? 'm.okonkwo@medicare.ng'
                      : 'admin@thecitadelschools.com or admin'
                  }
                  value={credential}
                  onChange={e => setCredential(e.target.value)}
                  className="input-control !w-full !pl-10 !bg-white !text-slate-900 !border-slate-300 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="flex items-center gap-3">
                  {activeRoleTab === 'TEACHER' && (
                    <button
                      type="button"
                      onClick={() => handleOpenChangePassword()}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      Change Password
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your login password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-control !w-full !pl-10 !pr-10 !bg-white !text-slate-900 !border-slate-300 font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-md w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to {activeRoleTab === 'ADMIN' ? 'Admin Portal' : activeRoleTab === 'TEACHER' ? 'Faculty Workspace' : 'Guardian Portal'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Change Teacher Password Modal */}
      <ModalPortal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)}>
        <div
          className="modal-container max-w-md w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5 animate-scale-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2.5 text-indigo-600 font-extrabold font-heading text-lg">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <KeyRound size={20} />
                </div>
                <div>
                  <span className="block leading-tight">Change Teacher Password</span>
                  <span className="text-[11px] font-medium text-slate-500">Self-Service Portal Security</span>
                </div>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {cpSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-extrabold text-sm block mb-1">Password Changed Successfully!</strong>
                    <p className="text-emerald-700 leading-relaxed">
                      {cpSuccess}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 font-medium">Updated Account:</div>
                  <div className="font-bold text-slate-900 font-mono">{cpIdentifier}</div>
                  <div className="text-[11px] text-slate-500">Your login form has been automatically updated with your new password.</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="btn btn-primary btn-md w-full bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  To protect your account, you are required to enter your <strong className="text-slate-900">current (old) password</strong> before setting your new password.
                </p>

                {cpError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2 font-medium">
                    <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{cpError}</span>
                  </div>
                )}

                {/* Teacher Identifier */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Teacher Official Email or Staff ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. david.adeleke@thecitadelschools.com or STAFF/2024/001"
                      value={cpIdentifier}
                      onChange={e => setCpIdentifier(e.target.value)}
                      className="input-control !w-full !pl-10 !bg-white !text-slate-900 !border-slate-300"
                    />
                  </div>
                </div>

                {/* Quick teacher chooser chip buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-semibold">Quick select:</span>
                  {teacherUsers.slice(0, 3).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setCpIdentifier(u.email)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        cpIdentifier === u.email
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 border-slate-200'
                      }`}
                    >
                      {u.name.split(' ')[1] || u.name}
                    </button>
                  ))}
                </div>

                {/* 1. Old / Current Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Current (Old) Password <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">(Default: teacher123)</span>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                    <input
                      type={cpShowOld ? 'text' : 'password'}
                      required
                      placeholder="Enter your current existing password"
                      value={cpOldPassword}
                      onChange={e => setCpOldPassword(e.target.value)}
                      className="input-control !w-full !pl-10 !pr-10 !bg-white !text-slate-900 !border-slate-300 font-mono font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowOld(!cpShowOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {cpShowOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 2. New Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type={cpShowNew ? 'text' : 'password'}
                      required
                      placeholder="Enter new password (min. 6 characters)"
                      value={cpNewPassword}
                      onChange={e => setCpNewPassword(e.target.value)}
                      className="input-control !w-full !pl-10 !pr-10 !bg-white !text-slate-900 !border-slate-300 font-mono font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowNew(!cpShowNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {cpShowNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm New Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type={cpShowConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password to confirm"
                      value={cpConfirmPassword}
                      onChange={e => setCpConfirmPassword(e.target.value)}
                      className="input-control !w-full !pl-10 !pr-10 !bg-white !text-slate-900 !border-slate-300 font-mono font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowConfirm(!cpShowConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {cpShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {cpNewPassword && cpConfirmPassword && cpNewPassword !== cpConfirmPassword && (
                    <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                      Passwords do not match.
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={cpIsLoading}
                    className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30"
                  >
                    {cpIsLoading ? 'Verifying & Updating...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
      </ModalPortal>

      {/* Forgot Password / Contact Admin Modal */}
      <ModalPortal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)}>
        <div
          className="modal-container max-w-md w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5 animate-scale-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
            <div className="flex items-center gap-2.5 text-indigo-600 font-extrabold font-heading text-lg">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="block leading-tight">Password Assistance</span>
                <span className="text-[11px] font-medium text-slate-500">Contact School Administrator</span>
              </div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block text-amber-900 text-sm font-heading">
                  Please Contact the Admin for Your Password
                </strong>
                <p className="leading-relaxed">
                  To retrieve your previous password or obtain a new initial password, please reach out to the <strong>Super Admin or School Office</strong>. The administrator can verify your account and provide or reset your credentials.
                </p>
              </div>
            </div>

            {/* Administrative Contact Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                Official Administrative Contact
              </span>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Institution:</span>
                  <strong className="text-slate-900">{school.name}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail size={13} className="text-indigo-600" />
                    Admin Email:
                  </span>
                  <a
                    href={`mailto:${school.email}`}
                    className="font-mono font-bold text-indigo-600 hover:underline"
                  >
                    {school.email}
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone size={13} className="text-indigo-600" />
                    Admin Helpdesk:
                  </span>
                  <span className="font-mono font-bold text-slate-900">{school.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Support Desk:</span>
                  <span className="font-medium text-slate-700">Principal Office & ICT Registry</span>
                </div>
              </div>
            </div>

            {activeRoleTab === 'TEACHER' && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/70 text-xs text-indigo-900 flex items-center justify-between gap-2">
                <span className="leading-tight">
                  Remember your previous password?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    handleOpenChangePassword();
                  }}
                  className="btn btn-primary btn-sm !py-1 !px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold whitespace-nowrap text-xs shadow-xs"
                >
                  Change Password
                </button>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn btn-secondary btn-md w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
              >
                Understood, Return to Sign In
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    </div>
  );
};
