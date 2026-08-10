import React, { useState, useEffect } from 'react';
import { Monitor, Download, Terminal, CheckCircle, ShieldCheck, Sparkles, X, Laptop, RefreshCw, Maximize2 } from 'lucide-react';
import { useLocalization } from '../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface DesktopAppModalProps {
  onClose: () => void;
}

const DesktopAppModal: React.FC<DesktopAppModalProps> = ({ onClose }) => {
  const { language } = useLocalization();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const isPt = language.startsWith('pt');

  useEffect(() => {
    // Detect standalone PWA / Electron
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window as any).navigator?.standalone || 
                        (window as any).electronAPI?.isElectron;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } catch (err) {
      console.error('PWA install error:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-yellow-500/60 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-yellow-500/20 border border-yellow-400/40 rounded-xl text-yellow-300">
              <Laptop className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-medieval text-yellow-300">
                {isPt ? 'App de PC Nativo (Desktop)' : 'Native Desktop PC App'}
              </h2>
              <p className="text-sm text-slate-300">
                {isPt ? 'Joga Dragonwood Academy diretamente no teu computador' : 'Play Dragonwood Academy directly on your computer'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">

          {/* Option 1: Quick Desktop App Install (PWA) */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                  {isPt ? 'Opção 1 • Instantânea' : 'Option 1 • Instant'}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 flex items-center">
                  <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                  {isPt ? 'Instalar como App de Computador' : 'Install as Desktop App'}
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  {isPt 
                    ? 'Cria um atalho executável no teu Ambiente de Trabalho / Menu Iniciar com janela nativa, sem barras do navegador.'
                    : 'Creates a desktop shortcut and native window experience without browser bars.'
                  }
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {installPrompt ? (
                <button
                  onClick={handleInstallPWA}
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isPt ? 'Instalar App no PC Agora' : 'Install PC App Now'}
                </button>
              ) : isInstalled ? (
                <div className="flex items-center text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isPt ? 'Já estás a executar como App de PC!' : 'Already running as Desktop App!'}
                </div>
              ) : (
                <div className="text-sm text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-700 w-full">
                  <p className="font-semibold text-yellow-300 mb-1">
                    {isPt ? 'Como instalar manualmente no teu PC:' : 'How to install manually on PC:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                    <li>{isPt ? 'No Chrome / Edge / Brave, clica no ícone de instalação (🖥️) na barra de endereço superior.' : 'In Chrome / Edge / Brave, click the install icon (🖥️) in the address bar.'}</li>
                    <li>{isPt ? 'Clica em "Instalar Dragonwood Academy".' : 'Click "Install Dragonwood Academy".'}</li>
                    <li>{isPt ? 'O jogo abrirá numa janela nativa no teu Windows/Mac/Linux!' : 'The game will open in a dedicated desktop window!'}</li>
                  </ol>
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center text-sm"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                {isPt ? 'Modo Ecrã Inteiro (F11)' : 'Fullscreen Mode (F11)'}
              </button>
            </div>
          </div>

          {/* Option 2: Build Native Executable (.exe / .dmg / .AppImage) with Electron */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              {isPt ? 'Opção 2 • Executável Nativo Electron (.EXE)' : 'Option 2 • Native Electron Executable (.EXE)'}
            </span>
            <h3 className="text-lg font-bold text-white mt-2 flex items-center">
              <Terminal className="w-5 h-5 text-blue-400 mr-2" />
              {isPt ? 'Gerar Executável para Windows / Mac / Linux' : 'Generate Executable for Windows / Mac / Linux'}
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              {isPt
                ? 'Este projeto inclui Electron e electron-builder já configurados para gerar o instalador nativo (.exe).'
                : 'This project includes configured Electron and electron-builder to produce standalone installers.'
              }
            </p>

            <div className="mt-4 space-y-3">
              {/* Command 1: Development mode */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs text-emerald-400">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase tracking-wider">
                    {isPt ? '# Executar em modo PC Desktop local' : '# Run local Desktop mode'}
                  </span>
                  <code>npm run electron:dev</code>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run electron:dev', 'dev')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                >
                  {copiedCmd === 'dev' ? (isPt ? 'Copiado!' : 'Copied!') : (isPt ? 'Copiar' : 'Copy')}
                </button>
              </div>

              {/* Command 2: Build Windows EXE */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs text-emerald-400">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase tracking-wider">
                    {isPt ? '# Compilar instalador Windows (.exe)' : '# Build Windows installer (.exe)'}
                  </span>
                  <code>npm run build:win</code>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run build:win', 'win')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                >
                  {copiedCmd === 'win' ? (isPt ? 'Copiado!' : 'Copied!') : (isPt ? 'Copiar' : 'Copy')}
                </button>
              </div>
            </div>
          </div>

          {/* Features highlight */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <span>{isPt ? 'Guarda o progresso do jogo localmente no PC' : 'Saves game progress locally on PC'}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Monitor className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <span>{isPt ? 'Suporte para ecrã inteiro e atalhos de teclado' : 'Fullscreen & keyboard shortcut support'}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2 px-6 rounded-xl transition-colors text-sm"
          >
            {isPt ? 'Fechar' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DesktopAppModal;
