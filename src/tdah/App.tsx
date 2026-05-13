import React, { useState, useEffect, useRef, useMemo, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Send, 
  RotateCcw, 
  Ghost, 
  Calendar, 
  MapPin, 
  Lightbulb, 
  History,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  X,
  ShoppingCart,
  CreditCard,
  Target,
  Brain,
  Mic,
  MicOff,
  LogIn,
  LogOut,
  Clock,
  WifiOff,
  CloudUpload,
  Settings,
  Volume2,
  Timer,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import { processInput, BrainEntry, BrainType, BrainPriority, BrainStatus } from './services/geminiService';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, Timestamp, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { Logo } from './components/Logo';
import { FocusMode } from './components/FocusMode';
import { RecordItem } from './components/RecordItem';
import { Dashboard } from './components/Dashboard';

const SHORTCUTS = [
  { label: 'Tarefa', icon: CheckCircle2, prefix: 'Tarefa: ', color: 'text-blue-500 bg-blue-50' },
  { label: 'Lembrete', icon: Calendar, prefix: 'Me lembre de ', color: 'text-yellow-500 bg-yellow-50' },
  { label: 'Compra', icon: ShoppingCart, prefix: 'Comprar ', color: 'text-emerald-500 bg-emerald-50' },
  { label: 'Finanças', icon: CreditCard, prefix: 'Gastei R$', color: 'text-slate-600 bg-slate-100' },
  { label: 'Ideia', icon: Lightbulb, prefix: 'Ideia: ', color: 'text-purple-500 bg-purple-50' },
];

const SUGGESTIONS = [
  'amanhã às 10h',
  'hoje às 15h',
  'sexta às 14h',
  'por 30min',
  'no Shopping',
  'em casa',
  'URGENTE!',
  'Importante',
];

const ALERTS = [
  { id: 'default', label: 'Padrão', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'soft', label: 'Suave', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { id: 'crystal', label: 'Cristal', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
  { id: 'modern', label: 'Moderno', url: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3' },
  { id: 'echo', label: 'Eco', url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3' },
];

const AUTHORIZED_EMAILS = [
  'braudock@gmail.com', // Seu e-mail
  'braudock@gmail.com', // Adicione novos e-emails aqui.
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<BrainEntry[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] = useState<'capture' | 'history' | 'today' | 'dashboard'>('today'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedAlertId, setSelectedAlertId] = useState('default');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusedRecordId, setFocusedRecordId] = useState<string | null>(null);
  const [dueAlertRecordId, setDueAlertRecordId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const keepRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const restartTimeoutRef = useRef<number | null>(null);
  const scheduledNotifications = useRef<Set<string>>(new Set());
  const strongAlertedRecords = useRef<Set<string>>(new Set());
  const alertSound = useRef<HTMLAudioElement | null>(null);

  // Stats Logic: Fetch latest 7 days and streak
  useEffect(() => {
    if (!user) return;
    const statsQuery = query(
      collection(db, 'users', user.uid, 'stats'),
      orderBy('date', 'desc')
    );
    return onSnapshot(statsQuery, (snap) => {
      const data = snap.docs.map(d => d.data());
      setStats(data.reverse());
      if (data.length > 0) setStreak(data[0].streak || 0);
    });
  }, [user]);

  // Update Stats when a task is completed or focus session ends
  const updateStats = async (updates: { completed?: number, focusMinutes?: number }) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const statRef = doc(db, 'users', user.uid, 'stats', today);
    const snap = await getDoc(statRef);
    
    if (snap.exists()) {
      const current = snap.data();
      await updateDoc(statRef, {
        completed: (current.completed || 0) + (updates.completed || 0),
        focusMinutes: (current.focusMinutes || 0) + (updates.focusMinutes || 0)
      });
    } else {
      // New day, check streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const ySnap = await getDoc(doc(db, 'users', user.uid, 'stats', yesterdayStr));
      const prevStreak = ySnap.exists() ? ySnap.data().streak : 0;
      
      await setDoc(statRef, {
        date: today,
        completed: updates.completed || 0,
        focusMinutes: updates.focusMinutes || 0,
        streak: prevStreak + 1
      });
    }
  };

  // Initialize sound
  useEffect(() => {
    const alert = ALERTS.find(a => a.id === selectedAlertId) || ALERTS[0];
    alertSound.current = new Audio(alert.url); 
  }, [selectedAlertId]);

  // Load User Settings
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.selectedAlertId) setSelectedAlertId(data.selectedAlertId);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/settings/general`);
    });
    return () => unsub();
  }, [user]);

  const saveSettings = async (updates: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'settings', 'general'), updates);
    } catch (err) {
      // If document doesn't exist, use setDoc or just handle gracefully
      // For simplicity in this env, we'll try to add first or use addDoc if missing
      // Actually updateDoc is fine if we initialize it on first login or just use a helper
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', user.uid, 'settings', 'general'), updates, { merge: true });
      } catch (e) {
        console.error("Failed to save settings", e);
      }
    }
  };

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
    }
  };

  const playAlertSignal = (strong = false) => {
    const sound = alertSound.current;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(strong ? [500, 150, 500, 150, 900] : [200, 100, 200]);
    }
  };

  const sendSystemNotification = (title: string, body: string) => {
    if (!notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      requireInteraction: true
    });
  };

  // Schedule upcoming notifications and strong due-time alerts.
  useEffect(() => {
    if (records.length === 0) return;

    const checkAlerts = () => {
      const now = new Date().getTime();
      records.forEach(record => {
        if (!record.dataHoraDetectada || record.status === BrainStatus.COMPLETED) return;

        const eventTime = new Date(record.dataHoraDetectada).getTime();
        if (Number.isNaN(eventTime)) return;

        const diff = eventTime - now;

        if (diff > 0 && diff <= 10 * 60 * 1000 && !scheduledNotifications.current.has(record.id)) {
          sendSystemNotification(`Lembrete em breve: ${record.tipo}`, record.conteudo);
          playAlertSignal(false);
          scheduledNotifications.current.add(record.id);
        }

        if (diff <= 0 && diff >= -60 * 60 * 1000 && !strongAlertedRecords.current.has(record.id)) {
          strongAlertedRecords.current.add(record.id);
          setDueAlertRecordId(record.id);
          sendSystemNotification(`AGORA: ${record.tipo}`, record.conteudo);
          playAlertSignal(true);
        }
      });
    };

    checkAlerts();
    const interval = window.setInterval(checkAlerts, 15000);

    return () => window.clearInterval(interval);
  }, [records, notificationsEnabled]);

  // Online/Offline Status Observer
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth Observer
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setIsAuthorized(AUTHORIZED_EMAILS.includes(u.email || ''));
      } else {
        setRecords([]);
        setIsAuthorized(false);
        setGoogleToken(null);
      }
      setAuthLoading(false);
    });
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'records'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        hasPendingWrites: d.metadata.hasPendingWrites
      } as BrainEntry));
      setRecords(docs);
    }, (error) => {
      console.error("Firestore sync error", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Speech Recognition Init
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current = `${finalTranscriptRef.current}${transcript} `.replace(/\s+/g, ' ');
          } else {
            interimTranscript += transcript;
          }
        }
        setInput(`${finalTranscriptRef.current}${interimTranscript}`.trimStart());
      };
      recognitionRef.current.onend = () => {
        if (keepRecordingRef.current) {
          restartTimeoutRef.current = window.setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setIsRecording(true);
            } catch {
              // Chrome can throw if it is still closing the previous session.
            }
          }, 250);
          return;
        }

        setIsRecording(false);
      };
      recognitionRef.current.onerror = (e: any) => {
        console.error('Speech recognition error', e.error);
        if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) {
          keepRecordingRef.current = false;
          setIsRecording(false);
        }
      };
    }

    return () => {
      keepRecordingRef.current = false;
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      recognitionRef.current?.abort?.();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        setGoogleToken(credential.accessToken || null);
      }
      await requestNotificationPermission();
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert('Não suportado');
    if (isRecording) {
      keepRecordingRef.current = false;
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      keepRecordingRef.current = true;
      finalTranscriptRef.current = input.trim() ? `${input.trim()} ` : '';
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(true);
      }
    }
  };

  const filteredSuggestions = useMemo(() => {
    return input.length > 3 && input.slice(-1) === ' ' 
      ? SUGGESTIONS.filter(s => !input.toLowerCase().includes(s.toLowerCase())).slice(0, 3)
      : [];
  }, [input]);

  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0);
  }, [filteredSuggestions]);

  const applySuggestion = (s: string) => {
    setInput(prev => prev.slice(-1) === ' ' ? prev + s : prev + ' ' + s);
    setShowSuggestions(false);
  };

  const createCalendarEvent = async (record: Partial<BrainEntry>) => {
    if (!googleToken || !record.dataHoraDetectada) return;

    try {
      const start = new Date(record.dataHoraDetectada);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1h default

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: `[2º Cérebro] ${record.conteudo}`,
          description: `IA Insight: ${record.insight}\nTags: ${record.tags?.join(', ')}`,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
          location: record.local || '',
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 60 },
              { method: 'popup', minutes: 10 }
            ]
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create calendar event');
      console.log("Calendar event created!");
    } catch (error) {
      console.error("Calendar Error", error);
    }
  };

  const handleCapture = async () => {
    if (!input.trim() || !user || loading) return;

    setLoading(true);
    const path = `users/${user.uid}/records`;
    try {
      let data;
      if (isOnline) {
        data = await processInput(input);
      } else {
        // Fallback for offline mode
        data = {
          tipo: BrainType.IDEIA, // Default fallback
          prioridade: BrainPriority.MEDIA,
          conteudo: input,
          insight: 'Capturado offline. A IA processará os detalhes quando você estiver online.',
          tags: ['offline'],
          dataHoraDetectada: null,
          local: null,
          mapsUrl: null,
          wazeUrl: null
        };
      }

      const newDoc = {
        userId: user.uid,
        timestamp: new Date().toLocaleString('pt-BR'),
        tipo: data.tipo as BrainType,
        prioridade: data.prioridade || BrainPriority.MEDIA,
        conteudo: data.conteudo || input,
        insight: data.insight || 'Continue focado.',
        tags: data.tags || [],
        dataHoraDetectada: data.dataHoraDetectada || null,
        local: data.local || null,
        mapsUrl: data.mapsUrl || null,
        wazeUrl: data.wazeUrl || null,
        status: BrainStatus.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, path), newDoc);
      
      if (newDoc.dataHoraDetectada && googleToken && isOnline) {
        await createCalendarEvent(newDoc);
      }

      setError(null);
      setInput('');
      setActiveTab('history');
    } catch (err: any) {
      console.error("Capture failed:", err);
      setError(err.message || String(err));
      // handleFirestoreError(err, OperationType.CREATE, path); // removed for now to allow UI feedback
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/records/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'records', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateRecord = async (id: string, updates: Partial<BrainEntry>) => {
    if (!user) return;
    const path = `users/${user.uid}/records/${id}`;
    
    // Check if local is being updated to regenerate links
    if (updates.local !== undefined) {
      if (updates.local) {
        const query = encodeURIComponent(updates.local);
        updates.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        updates.wazeUrl = `https://waze.com/ul?q=${query}`;
      } else {
        updates.mapsUrl = undefined;
        updates.wazeUrl = undefined;
      }
    }

    try {
      const isFinishing = updates.status === BrainStatus.COMPLETED;
      await updateDoc(doc(db, 'users', user.uid, 'records', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      if (isFinishing) {
        await updateStats({ completed: 1 });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const undoLast = () => {
    if (records.length > 0) deleteRecord(records[0].id);
  };

  const getTypeColor = (type: BrainType) => {
    const colors: Record<string, string> = {
      [BrainType.COMPROMISSO]: 'text-orange-500 bg-orange-50 border-orange-200',
      [BrainType.TAREFA]: 'text-blue-500 bg-blue-50 border-blue-200',
      [BrainType.LEMBRETE]: 'text-yellow-500 bg-yellow-50 border-yellow-200',
      [BrainType.SENTIMENTO]: 'text-pink-500 bg-pink-50 border-pink-200',
      [BrainType.FINANCAS]: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      [BrainType.IDEIA]: 'text-purple-500 bg-purple-50 border-purple-200',
    };
    return colors[type] || 'text-slate-500 bg-slate-50 border-slate-200';
  };

  const getPriorityData = (p: BrainPriority) => {
    const pData: Record<string, any> = {
      [BrainPriority.ALTA]: { label: 'ALTA', color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle },
      [BrainPriority.BAIXA]: { label: 'BAIXA', color: 'text-slate-400 bg-slate-50 border-slate-100', icon: CheckCircle2 },
      [BrainPriority.MEDIA]: { label: 'MÉDIA', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Target },
    };
    return pData[p] || pData[BrainPriority.MEDIA];
  };

  const getPriorityScore = (p: BrainPriority) => {
    switch(p) {
      case BrainPriority.ALTA: return 3;
      case BrainPriority.MEDIA: return 2;
      case BrainPriority.BAIXA: return 1;
      default: return 0;
    }
  };

  const sortedRecords = useMemo(() => {
    return [...records]
      .filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return r.conteudo.toLowerCase().includes(q) || 
               r.insight?.toLowerCase().includes(q) || 
               r.tags?.some(t => t.toLowerCase().includes(q));
      })
      .sort((a, b) => {
      // Completed last
      if (a.status === BrainStatus.COMPLETED && b.status !== BrainStatus.COMPLETED) return 1;
      if (a.status !== BrainStatus.COMPLETED && b.status === BrainStatus.COMPLETED) return -1;
      
      // Priority first
      const pDiff = getPriorityScore(b.prioridade) - getPriorityScore(a.prioridade);
      if (pDiff !== 0) return pDiff;
      
      // Time second
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [records]);

  const todayRecords = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('pt-BR');
    return sortedRecords.filter(r => {
      // If it has a detected date for today, or it was created today
      const createdDate = r.timestamp.split(',')[0];
      const hasDetectedToday = r.dataHoraDetectada && new Date(r.dataHoraDetectada).toLocaleDateString('pt-BR') === todayStr;
      return createdDate === todayStr || hasDetectedToday;
    });
  }, [sortedRecords]);

  const progress = useMemo(() => {
    if (todayRecords.length === 0) return 0;
    const completed = todayRecords.filter(r => r.status === BrainStatus.COMPLETED).length;
    return Math.round((completed / todayRecords.length) * 100);
  }, [todayRecords]);

  const dueAlertRecord = useMemo(() => {
    if (!dueAlertRecordId) return null;
    return records.find(r => r.id === dueAlertRecordId && r.status !== BrainStatus.COMPLETED) || null;
  }, [records, dueAlertRecordId]);

  useEffect(() => {
    if (dueAlertRecordId && !dueAlertRecord) {
      setDueAlertRecordId(null);
    }
  }, [dueAlertRecord, dueAlertRecordId]);

  useEffect(() => {
    if (!dueAlertRecord) return;

    playAlertSignal(true);
    const interval = window.setInterval(() => playAlertSignal(true), 12000);

    return () => window.clearInterval(interval);
  }, [dueAlertRecord?.id]);

  const encourageMessage = useMemo(() => {
    if (progress === 0) return "Vamos começar com algo pequeno?";
    if (progress < 50) return "Você está no caminho certo! Continue.";
    if (progress < 100) return "Quase lá! Só mais um pouco.";
    return "Parabéns! Você venceu o dia! 🏆";
  }, [progress]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-orange-500 rounded-[30%] flex items-center justify-center text-white shadow-xl shadow-orange-500/20"
        >
          <Brain size={32} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-100/40 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 blur-[130px] rounded-full animate-pulse [animation-delay:2s]" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/80 backdrop-blur-2xl rounded-[4rem] p-10 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-white text-center space-y-12 relative z-10"
        >
          <div className="flex justify-center scale-105">
            <Logo size="xl" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-slate-800 text-xl font-bold tracking-tight">Sua mente externa.</h2>
            <p className="text-slate-500 font-medium px-6 leading-[1.6]">Organize pensamentos e compromissos com a clareza que o TDAH exige.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-orange-500 active:scale-95 group transition-all shadow-2xl shadow-slate-900/10 hover:shadow-orange-500/30"
            >
              <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
              CONECTAR AGORA
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              Sincronização Segura
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 opacity-40">
            <div className="flex flex-col items-center gap-1">
              <Brain size={16} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Foco</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Calendar size={16} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Agenda</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={16} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Check</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-50/50 blur-[130px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/80 backdrop-blur-2xl rounded-[4rem] p-10 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-white text-center space-y-10 relative z-10"
        >
          <div className="flex justify-center opacity-20 grayscale scale-90">
            <Logo size="lg" />
          </div>
          
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-inner">
              <X size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Acesso Bloqueado</h1>
              <p className="text-slate-500 font-medium text-xs px-6">Seu endereço de email não faz parte da lista de testadores autorizados.</p>
            </div>
            <div className="bg-slate-50/50 py-3 px-4 rounded-2xl border border-slate-100 inline-block overflow-hidden max-w-full">
              <p className="text-slate-900 font-black text-[11px] tracking-wide truncate">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="p-5 bg-orange-50/50 rounded-[2rem] border border-orange-100 leading-relaxed text-left flex gap-4 items-start">
              <AlertCircle size={20} className="text-orange-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-800 font-bold uppercase tracking-wide leading-normal">
                Solicite acesso ao administrador do projeto para entrar nesta versão do sistema.
              </p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-slate-100 text-slate-500 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-95"
            >
              <LogOut size={16} />
              SAIR DA CONTA
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-orange-100 pb-20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-slate-100">
        <div className="relative max-w-2xl mx-auto flex flex-col">
          <div className="px-4 h-14 md:h-16 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2">
              <div className="sm:hidden">
                <Logo size="sm" iconOnly />
              </div>
              <div className="hidden sm:block">
                <Logo size="sm" />
              </div>
              <span className="sm:hidden max-w-[8.5rem] truncate text-sm font-black uppercase tracking-tight text-slate-900">
                2º Cérebro
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!isOnline && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[8px] font-black uppercase mr-1 animate-pulse" title="Modo Offline Ativo">
                  <WifiOff size={10} />
                  <span className="hidden min-[390px]:inline">Offline</span>
                </div>
              )}
              {!notificationsEnabled && (
                <button 
                  onClick={requestNotificationPermission}
                  className="p-1.5 md:p-2 text-orange-400 hover:text-orange-600 transition-colors"
                  title="Ativar Alertas"
                >
                  <AlertCircle size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="p-1.5 md:p-2 text-slate-300 hover:text-orange-500 transition-colors"
                title="Configurações"
              >
                <Settings size={16} />
              </button>
              <button onClick={handleLogout} className="p-1.5 md:p-2 text-slate-300 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <div className="px-3 pb-2 md:absolute md:left-1/2 md:top-3 md:w-auto md:-translate-x-1/2 md:px-0 md:pb-0">
            <nav className="grid grid-cols-4 bg-slate-100 p-1 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
              <button onClick={() => setActiveTab('capture')} className={`px-2 md:px-4 py-2 rounded-xl transition-all ${activeTab === 'capture' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Captura</button>
              <button onClick={() => setActiveTab('today')} className={`px-2 md:px-4 py-2 rounded-xl transition-all ${activeTab === 'today' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Hoje ({todayRecords.length})</button>
              <button onClick={() => setActiveTab('dashboard')} className={`px-2 md:px-4 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Dash</button>
              <button onClick={() => setActiveTab('history')} className={`px-2 md:px-4 py-2 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Histórico</button>
            </nav>
          </div>
          {todayRecords.length > 0 && (
            <div className="bg-white/50 px-4 py-1.5 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-tighter truncate">{encourageMessage}</span>
              <span className="text-[9px] md:text-[10px] font-black text-orange-500 shrink-0">{progress}%</span>
            </div>
          )}
          {todayRecords.length > 0 && (
            <div className="h-1 bg-slate-100 w-full relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute top-0 left-0 h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 min-[390px]:px-4 pt-36 md:pt-24 text-slate-900">
        {activeTab === 'capture' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-slate-900">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold mb-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>Erro ao salvar: {error}</span>
                </div>
                <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg">
                  <X size={14} />
                </button>
              </motion.div>
            )}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
              {SHORTCUTS.map((s) => (
                <button 
                  key={s.label} 
                  onClick={() => setInput(s.prefix)} 
                  className={`flex flex-col items-center justify-center gap-2 min-w-[70px] md:min-w-[80px] p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] whitespace-nowrap font-black text-[9px] md:text-[10px] uppercase tracking-tighter transition-all active:scale-90 border-2 border-transparent hover:border-current/20 hover:shadow-lg ${s.color}`}
                >
                  <s.icon size={20} className="md:w-6 md:h-6" />
                  {s.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 md:space-y-6 relative text-slate-900">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="O que está na sua mente?"
                className="w-full text-lg md:text-2xl font-medium placeholder:text-slate-200 border-none focus:ring-0 resize-none min-h-[120px] md:min-h-[160px] bg-transparent leading-relaxed text-slate-900"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && handleCapture()}
              />
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-5 md:left-8 bottom-24 md:bottom-28 flex flex-wrap gap-1 md:gap-2">
                    {filteredSuggestions.map(s => (
                      <button key={s} onClick={() => applySuggestion(s)} className="px-2 md:px-3 py-1 bg-slate-900 text-white text-[9px] md:text-[10px] font-black rounded-lg md:rounded-xl shadow-lg border border-slate-800 tracking-tight transition-transform active:scale-95">+ {s}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-slate-50">
                <div className="flex gap-1">
                  <button onClick={undoLast} disabled={records.length === 0} className="p-2 md:p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all disabled:opacity-20"><RotateCcw size={20} className="md:w-[22px] md:h-[22px]" /></button>
                  <button onClick={toggleRecording} className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${isRecording ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}><Mic size={20} className="md:w-[22px] md:h-[22px]" /></button>
                </div>
                <button onClick={handleCapture} disabled={!input.trim() || loading} className="bg-orange-500 text-white px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-wider flex items-center gap-2 md:gap-3 hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-500/30 disabled:grayscale">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} SALVAR
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard stats={stats} streak={streak} />
        )}

        {(activeTab === 'history' || activeTab === 'today') && (
          <div className="space-y-4 md:space-y-6">
            <div className="relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar em tudo..."
                className="w-full bg-white rounded-2xl px-12 py-3.5 border-2 border-slate-50 text-sm font-bold placeholder:text-slate-200 focus:border-orange-100 transition-all shadow-sm group-hover:shadow-md"
              />
              <History size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-orange-300 transition-colors" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-50 rounded-lg">
                  <X size={16} className="text-slate-300" />
                </button>
              )}
            </div>
            <AnimatePresence mode="popLayout">
              {(activeTab === 'today' ? todayRecords : sortedRecords).length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                  <Clock className="mx-auto text-slate-100 mb-4" size={64} />
                  <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Nada por aqui ainda</p>
                </motion.div>
              ) : (
                (activeTab === 'today' ? todayRecords : sortedRecords).map((record) => (
                  <RecordItem 
                    key={record.id} 
                    record={record} 
                    onDelete={() => deleteRecord(record.id)} 
                    onUpdate={(updates) => updateRecord(record.id, updates)}
                    onFocus={(rec) => setFocusedRecordId(rec.id)}
                    getTypeColor={getTypeColor}
                    getPriorityData={getPriorityData}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
      {activeTab !== 'capture' && <button onClick={() => setActiveTab('capture')} className="fixed bottom-6 right-5 md:bottom-8 md:right-8 w-14 h-14 bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center hover:scale-105 transition-all"><Plus size={28} /></button>}

      <AnimatePresence>
        {dueAlertRecord && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.25rem] bg-white shadow-2xl"
            >
              <div className="bg-red-600 px-6 py-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 animate-pulse">
                      <AlertCircle size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Alerta forte</p>
                      <h2 className="text-2xl font-black uppercase leading-none">É agora</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setDueAlertRecordId(null)}
                    className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white"
                    title="Fechar alerta"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${getTypeColor(dueAlertRecord.tipo)}`}>
                      {dueAlertRecord.tipo}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase text-red-600">
                      <Clock size={12} />
                      {dueAlertRecord.dataHoraDetectada
                        ? new Date(dueAlertRecord.dataHoraDetectada).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : 'Agora'}
                    </span>
                  </div>
                  <p className="text-2xl font-black leading-tight text-slate-900">{dueAlertRecord.conteudo}</p>
                </div>

                {dueAlertRecord.local && (
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase">
                      <MapPin size={14} />
                      <span className="truncate">{dueAlertRecord.local}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={dueAlertRecord.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dueAlertRecord.local)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-white px-3 py-2 text-center text-[10px] font-black uppercase shadow-sm"
                      >
                        Maps
                      </a>
                      <a
                        href={dueAlertRecord.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(dueAlertRecord.local)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-white px-3 py-2 text-center text-[10px] font-black uppercase text-blue-600 shadow-sm"
                      >
                        Waze
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setFocusedRecordId(dueAlertRecord.id);
                      setDueAlertRecordId(null);
                    }}
                    className="rounded-2xl bg-slate-900 px-4 py-4 text-xs font-black uppercase tracking-wide text-white active:scale-95"
                  >
                    Focar agora
                  </button>
                  <button
                    onClick={async () => {
                      await updateRecord(dueAlertRecord.id, { status: BrainStatus.COMPLETED });
                      setDueAlertRecordId(null);
                    }}
                    className="rounded-2xl bg-orange-500 px-4 py-4 text-xs font-black uppercase tracking-wide text-white active:scale-95"
                  >
                    Marcar feito
                  </button>
                </div>

                <button
                  onClick={() => setDueAlertRecordId(null)}
                  className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 active:scale-95"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {focusedRecordId && (
          <FocusMode 
            record={records.find(r => r.id === focusedRecordId)!} 
            onClose={() => setFocusedRecordId(null)} 
            onComplete={async () => {
              const rec = records.find(r => r.id === focusedRecordId);
              if (rec) {
                await updateRecord(rec.id, { status: BrainStatus.COMPLETED });
                await updateStats({ focusMinutes: 25 });
              }
              setFocusedRecordId(null);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Sons de Alerta</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-2">
                {ALERTS.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => {
                      setSelectedAlertId(alert.id);
                      saveSettings({ selectedAlertId: alert.id });
                      // Play preview
                      const audio = new Audio(alert.url);
                      audio.play().catch(() => {});
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                      selectedAlertId === alert.id 
                        ? 'border-orange-500 bg-orange-50 text-orange-900' 
                        : 'border-slate-50 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="font-bold text-sm">{alert.label}</span>
                    <div className={`p-2 rounded-lg transition-colors ${
                      selectedAlertId === alert.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200'
                    }`}>
                      <Volume2 size={16} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">
                  O som será tocado durante lembretes e compromissos
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
