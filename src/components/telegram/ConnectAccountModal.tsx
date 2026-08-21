import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Bot,
  Key,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useTelegram } from '../../context/TelegramContext';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { refreshAccounts } = useTelegram();
  const [tab, setTab] = useState<'phone' | 'bot'>('phone');

  // Phone flow states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [sessionId, setSessionId] = useState('');
  const [code, setCode] = useState('');
  const [password2FA, setPassword2FA] = useState('');
  const [show2FAPassword, setShow2FAPassword] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [codeDeliveryNote, setCodeDeliveryNote] = useState('');

  // Bot flow states
  const [botToken, setBotToken] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await api.sendAuthCode({
        phoneNumber: phoneNumber.trim(),
        apiId: apiId.trim() || undefined,
        apiHash: apiHash.trim() || undefined,
        connectionType: 'user_mtproto',
      });
      setSessionId(res.sessionId);
      setCodeDeliveryNote(res.message || 'Telegram code dispatched');
      setStep('code');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send login code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await api.verifyAuthCode({
        sessionId,
        code: code.trim(),
        password2FA: needs2FA ? password2FA : undefined,
        apiId: apiId.trim() || undefined,
        apiHash: apiHash.trim() || undefined,
      });

      if (res.needs2FA) {
        setNeeds2FA(true);
        setIsLoading(false);
        return;
      }

      if (res.success) {
        setStep('success');
        await refreshAccounts();
        setTimeout(() => {
          onClose();
          setStep('phone');
          setCode('');
          setPassword2FA('');
          setNeeds2FA(false);
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Verification failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await api.verifyAuthCode({
        sessionId: 'bot_session_' + Date.now(),
        code: 'BOT',
        botToken: botToken.trim(),
        apiId: apiId.trim() || undefined,
        apiHash: apiHash.trim() || undefined,
      });
      if (res.success) {
        setStep('success');
        await refreshAccounts();
        setTimeout(() => {
          onClose();
          setStep('phone');
          setBotToken('');
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Invalid bot token');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-sky-500" /> Connect Telegram Account
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Secure MTProto 2.0 or official Bot API connection with AES-256 encryption.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {step !== 'success' && (
          <div className="flex border-b border-neutral-100 dark:border-neutral-800 p-2 gap-2 bg-neutral-50/50 dark:bg-neutral-800/30">
            <button
              onClick={() => {
                setTab('phone');
                setStep('phone');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'phone'
                  ? 'bg-white dark:bg-neutral-800 text-sky-600 dark:text-sky-400 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Personal Phone / MTProto
            </button>
            <button
              onClick={() => {
                setTab('bot');
                setStep('phone');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'bot'
                  ? 'bg-white dark:bg-neutral-800 text-sky-600 dark:text-sky-400 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" /> Telegram Bot Token
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'success' ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Connected Successfully!</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Your Telegram account is now synchronized with the AI auto-reply worker queue.
              </p>
            </div>
          ) : tab === 'phone' ? (
            step === 'phone' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+880 1700 000000"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-neutral-700 font-mono"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Telegram will send an official login code to your Telegram app or SMS.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      API ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={apiId}
                      onChange={(e) => setApiId(e.target.value)}
                      placeholder="e.g. 293847"
                      className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      API Hash (Optional)
                    </label>
                    <input
                      type="password"
                      value={apiHash}
                      onChange={(e) => setApiHash(e.target.value)}
                      placeholder="my.telegram.org hash"
                      className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-neutral-700"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Request Login Code</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {codeDeliveryNote && (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-sky-500" />
                    <span>{codeDeliveryNote}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Enter Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={isLoading}
                      className="text-[11px] font-medium text-sky-500 hover:text-sky-600 hover:underline disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[\s-]/g, ''))}
                    placeholder="e.g. 12345"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-lg font-mono text-center tracking-widest text-neutral-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-neutral-700"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1 text-center">
                    Enter the code dispatched by Telegram to your active app or SMS on {phoneNumber}
                  </p>
                </div>

                {needs2FA && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Lock className="w-4 h-4" /> Two-Step Verification (2FA) Required
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Your account is protected with a cloud password. Please enter it to finish logging in.
                    </p>
                    <div className="relative">
                      <input
                        type={show2FAPassword ? 'text' : 'password'}
                        required
                        value={password2FA}
                        onChange={(e) => setPassword2FA(e.target.value)}
                        placeholder="Your Telegram 2FA cloud password"
                        className="w-full bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white pl-3.5 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-neutral-200 dark:border-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShow2FAPassword(!show2FAPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        {show2FAPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !code.trim() || (needs2FA && !password2FA.trim())}
                    className="flex-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Confirm & Authorize</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleConnectBot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Telegram Bot API Token
                </label>
                <input
                  type="text"
                  required
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-neutral-700"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Obtain your Bot Token from <span className="font-semibold text-sky-500">@BotFather</span> on Telegram.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                  <span>Connect Bot Instance</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
