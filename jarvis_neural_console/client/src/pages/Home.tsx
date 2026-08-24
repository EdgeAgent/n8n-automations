import { Activity, AudioLines, ChevronRight, CircleDot, Crosshair, Database, Mic, Pause, Radio, Rotate3D, Send, ShieldCheck, Sparkles, Volume2, Waves, Zap } from "lucide-react";
import React, { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MemoryLens } from "@/components/MemoryLens";
import { NeuralBrain } from "@/components/NeuralBrain";
import { ResponseWorklog } from "@/components/ResponseWorklog";
import { briefingToSpeech, successfulAnswerPresentation, unavailableAnswerPresentation } from "@/lib/agent-response";
import { BrainMode, getNode, MemoryScope, MODE_COPY, NEURAL_NODES, TRACE_SCENARIOS, TRANSCRIPT_COPY, TraceEvent } from "@/lib/neural-data";
import { trpc } from "@/lib/trpc";
import "@/response-worklog.css";

type Briefing = { title: string; summary: string; steps: Array<{ title: string; detail: string }>; latencyMs?: number };
type ConversationTurn = { role: "user" | "assistant"; content: string };
type RecognitionResult = { isFinal: boolean; 0: { transcript: string }; length: number };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type RecognitionInstance = { continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void; onstart: (() => void) | null; onend: (() => void) | null; onerror: ((event: { error?: string }) => void) | null; onresult: ((event: RecognitionEvent) => void) | null };
type RecognitionConstructor = new () => RecognitionInstance;
type LucyAudioClip = "welcome" | "acknowledgement";
type MicrophoneDevice = { id: string; label: string };

const modeOrder: BrainMode[] = ["idle", "listening", "thinking", "speaking", "approval"];
const quickNodes = ["core", "router", "memory", "research", "operations", "approval-gate"];
const LUCY_AUDIO: Record<LucyAudioClip, string> = {
  welcome: "/manus-storage/lucy-welcome_b676a200.wav",
  acknowledgement: "/manus-storage/lucy-command-acknowledgement_08f776a8.wav",
};
function parseWakeCommand(rawCommand: string) {
  const normalized = rawCommand.replace(/[“”]/g, '"').replace(/^(hey|hello|okay|ok)\s+/i, "").trim();
  const match = normalized.match(/^(jarvis|jarviss)(?:'s)?\s*[,.:\-]?\s*(.*)$/i);
  return match ? { wakeWord: match[1], request: match[2].trim() } : null;
}
function isCompleteQuestion(text: string) {
  const normalized = text.trim();
  return /[?!.]$/.test(normalized) || /^(what|why|when|where|who|how|can|could|would|will|do|does|is|are|should|tell|show|explain|prepare)\b/i.test(normalized);
}
function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read microphone audio"));
    reader.onloadend = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(blob);
  });
}
function displayTime(date = new Date()) { return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function inProgressTrace(request: string, retry = false): TraceEvent[] {
  const time = displayTime();
  return [
    { id: `input-${Date.now()}`, step: "01", source: "INPUT", label: retry ? "Question queued for retry" : "Question captured", detail: request, time, status: "complete", nodeId: "input-cortex" },
    { id: `route-${Date.now()}`, step: "02", source: "ROUTER", label: "Request routed", detail: "JARVIS is selecting an appropriate department and keeping execution within safe confirmation boundaries.", time, status: "complete", nodeId: "router" },
    { id: `synthesis-${Date.now()}`, step: "03", source: "JARVIS", label: "Answer synthesis in progress", detail: "JARVIS is preparing a concise user-facing response. This log shows high-level activity, not private reasoning.", time: "NOW", status: "active", nodeId: "core" },
  ];
}
function isRecoverableAnswerError(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  return /timeout|timed out|network|fetch|temporar|unavailable|502|503|504/i.test(detail);
}
const INITIAL_BRIEF: Briefing = {
  title: "JARVIS / neuroscience brief",
  summary: "The popular claim that people use only ten percent of the brain is fictional. Brain imaging, metabolic studies, and clinical neurology show that all major brain systems contribute over the course of ordinary life, although not every neural circuit is maximally active at the same instant.",
  steps: [
    { title: "Separate fiction from science", detail: "Treat fictional superhuman abilities as narrative fiction, not an evidence-based model of cognition." },
    { title: "Use precise language", detail: "Say that humans use the whole brain across time, with activity varying by task, not that the brain is a single percentage dial." },
    { title: "Frame the assistant responsibly", detail: "JARVIS remains a calm, capable interface while its explanations stay grounded in neuroscience." },
  ],
};

export default function Home() {
  const [mode, setMode] = useState<BrainMode>("thinking");
  const [selectedId, setSelectedId] = useState("core");
  const [soundOn, setSoundOn] = useState(true);
  const [memoryScope, setMemoryScope] = useState<MemoryScope>("session");
  const [boostCount, setBoostCount] = useState(0);
  const [panelTab, setPanelTab] = useState("lucy");
  const [command, setCommand] = useState("");
  const [briefing, setBriefing] = useState<Briefing>(INITIAL_BRIEF);
  const [voiceStatus, setVoiceStatus] = useState("JARVIS / READY");
  const [isListening, setIsListening] = useState(false);
  const [isAlwaysOn, setIsAlwaysOn] = useState(false);
  const [privacyLock, setPrivacyLock] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("Microphone privacy is on. Select Start mic when you are ready.");
  const [micLevel, setMicLevel] = useState(0);
  const [micGuidance, setMicGuidance] = useState("Privacy is locked. Microphone input is disabled.");
  const [microphones, setMicrophones] = useState<MicrophoneDevice[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState("default");
  const [wakeSensitivity, setWakeSensitivity] = useState(62);
  const [cloudRecognition, setCloudRecognition] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("CLOUD / OPTIONAL");
  const [answerReceivedAt, setAnswerReceivedAt] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [retryableAnswerFailure, setRetryableAnswerFailure] = useState(false);
  const [answerTrace, setAnswerTrace] = useState<TraceEvent[]>([]);
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const lucyAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const meterFrameRef = useRef<number | null>(null);
  const alwaysOnRef = useRef(false);
  const privacyLockRef = useRef(true);
  const responseCooldownRef = useRef(false);
  const recognitionRestartRef = useRef<number | null>(null);
  const cloudRecorderRef = useRef<MediaRecorder | null>(null);
  const cloudBusyRef = useRef(false);
  const cloudRecognitionRef = useRef(false);
  const voiceDetectedRef = useRef(false);
  const cloudSuppressUntilRef = useRef(0);
  const answerInProgressRef = useRef(false);
  const conversationHistoryRef = useRef<ConversationTurn[]>([]);
  const conversationExpiresAtRef = useRef(0);
  const selected = useMemo(() => getNode(selectedId), [selectedId]);
  const stateCopy = MODE_COPY[mode];
  const visibleTrace = answerTrace.length ? answerTrace : TRACE_SCENARIOS[mode].slice(0, 3);
  const cloudTranscription = trpc.voice.transcribeClip.useMutation();
  const conversationAnswer = trpc.voice.answerQuestion.useMutation();

  const refreshMicrophones = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter((device) => device.kind === "audioinput").map((device, index) => ({ id: device.deviceId, label: device.label || `Microphone ${index + 1}` }));
    setMicrophones(inputs);
    setSelectedMicrophoneId((current) => current !== "default" && !inputs.some((input) => input.id === current) ? "default" : current);
  };

  const playLucyAsset = (clip: LucyAudioClip) => {
    if (!soundOn || typeof window === "undefined") return;
    lucyAudioRef.current?.pause();
    const audio = new Audio(LUCY_AUDIO[clip]);
    audio.volume = 1;
    audio.onplay = () => setVoiceStatus("JARVIS / SPEAKING");
    audio.onended = () => setVoiceStatus("JARVIS / READY");
    audio.onerror = () => setVoiceStatus("JARVIS / AUDIO UNAVAILABLE");
    lucyAudioRef.current = audio;
    audio.play().catch(() => setVoiceStatus("JARVIS / VOICE READY"));
  };

  const toggleLucyAudio = () => {
    setSoundOn((value) => {
      if (value) lucyAudioRef.current?.pause();
      return !value;
    });
  };

  const completeSpokenAnswer = () => {
    answerInProgressRef.current = false;
    setVoiceStatus("JARVIS / READY");
    if (!privacyLockRef.current && alwaysOnRef.current) scheduleWakeRestart(450);
  };

  const rememberTurn = (turn: ConversationTurn) => {
    conversationHistoryRef.current = [...conversationHistoryRef.current, turn].slice(-6);
  };

  const hasActiveConversation = () => Date.now() < conversationExpiresAtRef.current;

  const speakQuickAcknowledgement = () => {
    if (!soundOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const acknowledgement = new SpeechSynthesisUtterance("Got it.");
    acknowledgement.rate = 1.12;
    acknowledgement.pitch = 1;
    window.speechSynthesis.speak(acknowledgement);
  };

  const speakDetailedAnswer = (answer: Briefing) => {
    if (!soundOn || typeof window === "undefined") {
      completeSpokenAnswer();
      return;
    }
    lucyAudioRef.current?.pause();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(briefingToSpeech(answer));
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find((voice) => /en(-|_)/i.test(voice.lang) && /natural|neural|samantha|zira|aria|google/i.test(voice.name)) ?? voices.find((voice) => /en(-|_)/i.test(voice.lang)) ?? null;
      utterance.rate = 0.96;
      utterance.pitch = 1;
      utterance.onstart = () => setVoiceStatus("JARVIS / SPEAKING ANSWER");
      utterance.onend = completeSpokenAnswer;
      utterance.onerror = completeSpokenAnswer;
      window.speechSynthesis.speak(utterance);
      return;
    }
    const audio = new Audio(LUCY_AUDIO.acknowledgement);
    audio.volume = 1;
    audio.onplay = () => setVoiceStatus("JARVIS / ACKNOWLEDGEMENT");
    audio.onended = completeSpokenAnswer;
    audio.onerror = completeSpokenAnswer;
    lucyAudioRef.current = audio;
    audio.play().catch(completeSpokenAnswer);
  };

  const stopAudioMeter = () => {
    if (meterFrameRef.current !== null) window.cancelAnimationFrame(meterFrameRef.current);
    meterFrameRef.current = null;
    if (cloudRecorderRef.current?.state !== "inactive") cloudRecorderRef.current?.stop();
    cloudRecorderRef.current = null;
    cloudBusyRef.current = false;
    voiceDetectedRef.current = false;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    setMicLevel(0);
  };

  const startAudioMeter = async () => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("media-unsupported");
    stopAudioMeter();
    setMicGuidance("Calibrating microphone. Speak normally after JARVIS.");
    const deviceId = selectedMicrophoneId === "default" ? undefined : { exact: selectedMicrophoneId };
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    void refreshMicrophones();
    const context = new AudioContext();
    if (context.state === "suspended") await context.resume();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    mediaStreamRef.current = stream;
    audioContextRef.current = context;
    const startedAt = performance.now();
    let inputDetected = false;
    let lowInputNoticeShown = false;
    const sample = () => {
      analyser.getByteTimeDomainData(samples);
      let energy = 0;
      samples.forEach((value) => { const normalized = (value - 128) / 128; energy += normalized * normalized; });
      const level = Math.min(1, Math.sqrt(energy / samples.length) * 6.5);
      const inputThreshold = 0.025 + ((100 - wakeSensitivity) / 100) * 0.09;
      setMicLevel(level);
      if (level > inputThreshold) voiceDetectedRef.current = true;
      if (level > inputThreshold && !inputDetected) {
        inputDetected = true;
        setMicGuidance("Input detected. JARVIS is listening for a question beginning with JARVIS.");
      }
      if (!inputDetected && !lowInputNoticeShown && performance.now() - startedAt > 3500) {
        lowInputNoticeShown = true;
        setMicGuidance("Input is very quiet. Move closer, select the correct browser microphone, then try again.");
      }
      meterFrameRef.current = window.requestAnimationFrame(sample);
    };
    sample();
    return stream;
  };

  const processCloudTranscript = (text: string) => {
    const transcript = text.trim();
    if (!transcript) return;
    setLiveTranscript(transcript);
    const wakeCommand = parseWakeCommand(transcript);
    const request = wakeCommand?.request ?? (hasActiveConversation() ? transcript : "");
    if (!request) { setVoiceStatus("CLOUD / AWAITING JARVIS"); return; }
    if (!isCompleteQuestion(request)) { setVoiceStatus("CLOUD / QUESTION IN PROGRESS"); return; }
    if (processCommand(wakeCommand ? transcript : request, !wakeCommand)) {
      responseCooldownRef.current = true;
      cloudSuppressUntilRef.current = Date.now() + 3_000;
      recognitionRef.current?.stop();
    }
  };

  const startCloudRecorder = (stream: MediaStream) => {
    if (!cloudRecognitionRef.current || typeof MediaRecorder === "undefined") return;
    const supportedMimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    const mimeType = supportedMimeTypes.find((candidate) => MediaRecorder.isTypeSupported(candidate));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = async (event) => {
      if (!cloudRecognitionRef.current || privacyLockRef.current || cloudBusyRef.current || !voiceDetectedRef.current || Date.now() < cloudSuppressUntilRef.current || event.data.size < 8_000) return;
      cloudBusyRef.current = true;
      voiceDetectedRef.current = false;
      setCloudStatus("CLOUD / TRANSCRIBING");
      try {
        const audioBase64 = await blobToBase64(event.data);
        const response = await cloudTranscription.mutateAsync({ audioBase64, mimeType: event.data.type === "audio/ogg" ? "audio/ogg" : "audio/webm", language: navigator.language?.slice(0, 2) || "en" });
        setCloudStatus("CLOUD / ACTIVE");
        processCloudTranscript(response.text);
      } catch {
        setCloudStatus("CLOUD / LOCAL FALLBACK");
      } finally {
        cloudBusyRef.current = false;
      }
    };
    recorder.start(5_000);
    cloudRecorderRef.current = recorder;
    setCloudStatus("CLOUD / ACTIVE");
  };

  const stopListening = (lockPrivacy: boolean) => {
    if (recognitionRestartRef.current !== null) window.clearTimeout(recognitionRestartRef.current);
    recognitionRestartRef.current = null;
    responseCooldownRef.current = false;
    if (lockPrivacy) {
      privacyLockRef.current = true;
      alwaysOnRef.current = false;
      setPrivacyLock(true);
      setIsAlwaysOn(false);
      setLiveTranscript("Microphone is private and inactive.");
      setMicGuidance("Privacy is locked. Microphone input is disabled.");
      setVoiceStatus("MIC / PRIVACY LOCKED");
    }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    stopAudioMeter();
    setIsListening(false);
  };

  const scheduleWakeRestart = (delay: number) => {
    if (recognitionRestartRef.current !== null) window.clearTimeout(recognitionRestartRef.current);
    recognitionRestartRef.current = window.setTimeout(() => {
      recognitionRestartRef.current = null;
      if (!privacyLockRef.current && alwaysOnRef.current) void startWakeListening();
    }, delay);
  };

  const togglePrivacyLock = () => {
    if (privacyLock) {
      privacyLockRef.current = false;
      alwaysOnRef.current = true;
      setPrivacyLock(false);
      setIsAlwaysOn(true);
      setVoiceStatus("MIC / ACTIVATING WAKE MODE");
      setLiveTranscript("Privacy is open. Requesting microphone access and starting wake mode.");
      setMicGuidance("Opening microphone access. Approve the browser prompt to activate JARVIS.");
      void startWakeListening(true);
    } else stopListening(true);
  };

  const toggleAlwaysOn = () => {
    if (privacyLock) return;
    const next = !isAlwaysOn;
    alwaysOnRef.current = next;
    setIsAlwaysOn(next);
    setVoiceStatus(next ? "WAKE MODE / ARMED" : "WAKE MODE / MANUAL");
    setLiveTranscript(next ? "Wake mode is armed. Listening will restart after short pauses." : "Wake mode is manual. Listening stops after each microphone session.");
    if (next && !isListening) startWakeListening(true);
  };

  const selectMicrophone = (deviceId: string) => {
    setSelectedMicrophoneId(deviceId);
    const label = deviceId === "default" ? "Browser default microphone" : microphones.find((device) => device.id === deviceId)?.label ?? "Selected microphone";
    setMicGuidance(`${label} selected. Restarting JARVIS’s listening channel.`);
    if (!privacyLockRef.current) {
      stopListening(false);
      window.setTimeout(() => { if (!privacyLockRef.current) void startWakeListening(isAlwaysOn); }, 120);
    }
  };

  const toggleCloudRecognition = () => {
    const next = !cloudRecognition;
    cloudRecognitionRef.current = next;
    setCloudRecognition(next);
    setCloudStatus(next ? "CLOUD / ARMING" : "CLOUD / OPTIONAL");
    setMicGuidance(next ? "Cloud accuracy is enabled. Brief voice clips are sent for transcription while privacy is open." : "Cloud accuracy is off. JARVIS uses only browser recognition.");
    if (!privacyLockRef.current) {
      stopListening(false);
      window.setTimeout(() => { if (!privacyLockRef.current) void startWakeListening(isAlwaysOn); }, 120);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => playLucyAsset("welcome"), 700);
    return () => { window.clearTimeout(timer); lucyAudioRef.current?.pause(); stopListening(true); };
  }, []);

  const createBriefing = (request: string): Briefing => {
    const normalized = request.toLowerCase();
    if (/10\s*percent|100\s*percent|brain theory|lucy movie|superhuman/.test(normalized)) return INITIAL_BRIEF;
    return {
      title: "JARVIS / detailed operational briefing",
      summary: `Acknowledged. Your instruction is: “${request}”. JARVIS will structure the work as a bounded sequence, make the active system visible, and retain approval controls for any external action.`,
      steps: [
        { title: "Establish the objective", detail: `Restate the intended outcome in measurable terms and identify the information or decision required to complete “${request}”.` },
        { title: "Route the active systems", detail: `JARVIS will use the ${selected.department.toLowerCase()} path, beginning with ${selected.label}, then attach the relevant memory and verification nodes.` },
        { title: "Review before release", detail: "JARVIS will present the resulting plan, key assumptions, and any required approval point before an external action is released." },
      ],
    };
  };

  const requestDetailedAnswer = async (request: string) => {
    answerInProgressRef.current = true;
    setLastQuestion(request);
    setRetryableAnswerFailure(false);
    setAnswerReceivedAt(null);
    setAnswerTrace(inProgressTrace(request, Boolean(lastQuestion)));
    setPanelTab("lucy");
    setMode("thinking");
    setVoiceStatus("JARVIS / PREPARING DETAILED ANSWER");
    setLiveTranscript(`Question received: ${request}`);
    setBriefing({ title: "JARVIS / preparing answer", summary: "Got it. I’m putting that together now.", steps: [] });
    speakQuickAcknowledgement();
    try {
      const history = hasActiveConversation() ? conversationHistoryRef.current : [];
      if (!history.length) conversationHistoryRef.current = [];
      const answer = await conversationAnswer.mutateAsync({ question: request, activeNode: selected.label, activeDepartment: selected.department, history });
      const receivedAt = displayTime();
      rememberTurn({ role: "user", content: request });
      rememberTurn({ role: "assistant", content: answer.summary });
      conversationExpiresAtRef.current = Date.now() + 120_000;
      setBriefing(answer);
      setAnswerReceivedAt(receivedAt);
      setAnswerTrace((events) => [...events.map((event) => ({ ...event, status: event.status === "active" ? "complete" as const : event.status })), { id: `parsed-${Date.now()}`, step: "04", source: "PARSER", label: "Final parsed answer ready", detail: `${answer.summary} · ${Math.max(1, Math.round((answer.latencyMs ?? 0) / 100) / 10)}s model response`, time: receivedAt, status: "complete", nodeId: "response-wave" }]);
      const presentation = successfulAnswerPresentation(answer);
      setLiveTranscript(presentation.liveTranscript);
      setMode(presentation.mode);
      setVoiceStatus(presentation.voiceStatus);
      speakDetailedAnswer(answer);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "The answer service did not return a usable response.";
      const unavailable = unavailableAnswerPresentation(detail);
      const canRetry = isRecoverableAnswerError(error);
      setBriefing(unavailable);
      setRetryableAnswerFailure(canRetry);
      setAnswerTrace((events) => [...events.map((event) => ({ ...event, status: event.status === "active" ? "complete" as const : event.status })), { id: `failure-${Date.now()}`, step: "04", source: "DELIVERY", label: canRetry ? "Recoverable answer interruption" : "Answer service stopped", detail: canRetry ? "The request is retained. You can retry without speaking or typing it again." : detail, time: displayTime(), status: canRetry ? "awaiting" : "complete", nodeId: "response-wave" }]);
      setLiveTranscript(unavailable.liveTranscript);
      setMode(unavailable.mode);
      setVoiceStatus(unavailable.voiceStatus);
      completeSpokenAnswer();
    }
  };

  const processCommand = (rawCommand: string, allowTypedQuestion = false) => {
    if (!rawCommand.trim()) return false;
    const wakeCommand = parseWakeCommand(rawCommand);
    const canContinueConversation = hasActiveConversation();
    if (!wakeCommand && !allowTypedQuestion && !canContinueConversation) {
      setVoiceStatus("JARVIS / WAKE WORD REQUIRED");
      setBriefing({ title: "JARVIS / wake word required", summary: "Begin a spoken command with “JARVIS” so the interface can distinguish a deliberate instruction from background sound.", steps: [{ title: "Example", detail: "Say: JARVIS, prepare a detailed operational briefing." }] });
      setPanelTab("lucy");
      return false;
    }
    const request = wakeCommand?.request || rawCommand.trim() || "prepare an operational briefing";
    setCommand(wakeCommand ? `JARVIS, ${request}` : request);
    setMode("thinking");
    setSelectedId("core");
    setPanelTab("lucy");
    setVoiceStatus("JARVIS / COMMAND ACCEPTED");
    void requestDetailedAnswer(request);
    return true;
  };

  const submitCommand = (event: FormEvent) => { event.preventDefault(); processCommand(command, true); };
  const retryLastAnswer = () => { if (lastQuestion && retryableAnswerFailure && !answerInProgressRef.current) void requestDetailedAnswer(lastQuestion); };

  const startWakeListening = async (activateWakeMode = false) => {
    if (recognitionRestartRef.current !== null) window.clearTimeout(recognitionRestartRef.current);
    recognitionRestartRef.current = null;
    if (privacyLockRef.current) {
      setVoiceStatus("MIC / PRIVACY LOCKED");
      setLiveTranscript("Unlock microphone privacy before starting a listening session.");
      return;
    }
    if (activateWakeMode) {
      alwaysOnRef.current = true;
      setIsAlwaysOn(true);
    }
    if (isListening) {
      alwaysOnRef.current = false;
      setIsAlwaysOn(false);
      stopListening(false);
      setVoiceStatus("MIC / MANUAL STOP");
      setLiveTranscript("Listening paused. Select Start mic to resume.");
      return;
    }
    const browserWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      stopAudioMeter();
      setVoiceStatus("MIC / UNSUPPORTED — TYPE COMMAND");
      setBriefing({ title: "JARVIS / microphone unavailable", summary: "This browser does not expose microphone recognition. You can still type a command beginning with JARVIS.", steps: [{ title: "Example", detail: "Type: JARVIS, prepare a detailed operational briefing." }] });
      setPanelTab("lucy");
      return;
    }
    let stream: MediaStream;
    try { stream = await startAudioMeter(); }
    catch {
      setVoiceStatus("MIC / PERMISSION REQUIRED");
      setLiveTranscript("Allow microphone access in your browser, then select Start mic again.");
      return;
    }
    recognitionRef.current?.stop();
    startCloudRecorder(stream);
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language?.startsWith("en") ? navigator.language : "en-US";
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus(alwaysOnRef.current ? "WAKE MODE / LISTENING" : "MIC / LISTENING FOR JARVIS");
      setLiveTranscript("Listening for JARVIS…");
      setMicGuidance("Listening. Begin your question with JARVIS, then speak naturally.");
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setIsListening(false);
      if (answerInProgressRef.current) return;
      if (!privacyLockRef.current && alwaysOnRef.current) {
        const resumeDelay = responseCooldownRef.current ? 1900 : 700;
        responseCooldownRef.current = false;
        scheduleWakeRestart(resumeDelay);
      } else {
        stopAudioMeter();
        setVoiceStatus((current) => current.includes("LISTENING") ? "JARVIS / READY" : current);
      }
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      const permissionError = event.error === "not-allowed" || event.error === "service-not-allowed";
      if (permissionError) {
        alwaysOnRef.current = false;
        setIsAlwaysOn(false);
        setVoiceStatus("MIC / PERMISSION REQUIRED");
        setLiveTranscript("Microphone access was blocked. Allow it in the browser, then open privacy again to restart JARVIS.");
        setMicGuidance("Browser permission is blocked. Enable microphone access in the address-bar site controls.");
        stopAudioMeter();
      } else {
        setVoiceStatus("MIC / RECONNECTING");
        setLiveTranscript("The listening channel paused. JARVIS will reconnect automatically while wake mode remains enabled.");
        setMicGuidance("Reconnecting the listening channel. Keep the microphone permission open.");
      }
      setPanelTab("lucy");
    };
    recognition.onresult = (event) => {
      const words: string[] = [];
      let finalCommand = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";
        words.push(transcript);
        if (result.isFinal) finalCommand += `${transcript} `;
      }
      if (words.length) setLiveTranscript(words.join(" ").trim());
      if (!finalCommand.trim()) return;
      setCommand(finalCommand.trim());
      const wakeCommand = parseWakeCommand(finalCommand);
      const canContinueConversation = hasActiveConversation();
      if (!wakeCommand && !canContinueConversation) {
        setVoiceStatus("MIC / AWAITING JARVIS");
        return;
      }
      const request = wakeCommand?.request ?? finalCommand.trim();
      if (!request || !isCompleteQuestion(request)) {
        setVoiceStatus("MIC / QUESTION IN PROGRESS");
        setLiveTranscript(`${finalCommand.trim()} …`);
        return;
      }
      const accepted = processCommand(wakeCommand ? finalCommand : request, !wakeCommand);
      if (accepted) {
        responseCooldownRef.current = true;
        recognition.stop();
      }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); }
    catch {
      stopAudioMeter();
      setVoiceStatus("MIC / UNAVAILABLE — TYPE COMMAND");
      setLiveTranscript("The listening service could not start. Type a JARVIS command instead.");
    }
  };

  const dispatchPriorityPulse = () => { setBoostCount((count) => count + 1); setMode("thinking"); setSelectedId("operations"); setPanelTab("trace"); };

  return <div className="neural-console fixed-console">
    <div className="hero-aurora" aria-hidden="true" /><div className="signal-texture" aria-hidden="true" />
    <header className="top-rail">
      <div className="brand-lockup"><img src="/manus-storage/jarvis-synapse-mark_e6c91227.png" alt="JARVIS synapse mark" className="brand-mark" /><div><p className="brand-name">JARVIS</p><p className="brand-subtitle">NEURAL CONSOLE <span>•</span> NATURAL VOICE</p></div></div>
      <div className="system-readout" aria-live="polite"><span className="live-dot" /> {voiceStatus} <span className="readout-divider" /> {boostCount ? `PULSE ${String(boostCount).padStart(2, "0")} / OPERATIONS` : "SESSION 0418"}</div>
      <div className="top-actions">
        <Button className="rail-button lucy-voice-button" variant="outline" onClick={() => playLucyAsset("welcome")}><AudioLines size={14} /><span>JARVIS voice</span></Button>
        <Button className={`rail-button ${isListening ? "is-listening" : ""}`} variant="outline" disabled={privacyLock} onClick={() => startWakeListening()}><Mic size={14} /><span>{isListening ? "Stop mic" : "Start mic"}</span></Button>
        <Button className="rail-button" variant="outline" onClick={toggleLucyAudio} aria-label={soundOn ? "Mute JARVIS voice" : "Enable JARVIS voice"}>{soundOn ? <Volume2 size={14} /> : <Pause size={14} />}<span>{soundOn ? "Voice on" : "Voice off"}</span></Button>
        <Button className={`rail-button boost-button ${boostCount ? "is-active" : ""}`} variant="outline" onClick={dispatchPriorityPulse}><Zap size={14} /><span>Priority pulse</span></Button>
        <Button className="rail-button square-control" variant="outline" onClick={() => setSelectedId("core")} aria-label="Recenter on JARVIS core"><Crosshair size={15} /></Button>
      </div>
    </header>

    <main className="workspace-shell">
      <aside className="workspace-sidebar panel-glass" aria-label="Command sidebar">
        <div className="sidebar-state"><div className="panel-kicker"><Radio size={13} /> JARVIS COMMAND STATUS</div><div className="compact-readout"><span className="mode-indicator" style={{ backgroundColor: stateCopy.color, boxShadow: `0 0 14px ${stateCopy.color}` }} /><div><p>{voiceStatus}</p><h1>{stateCopy.title}</h1></div></div><p className="sidebar-copy">{stateCopy.body}</p><div className="sidebar-wave" aria-label="Live system waveform">{Array.from({ length: 21 }, (_, index) => <span key={index} style={{ height: `${24 + ((index * 17 + (mode === "speaking" ? 29 : 9)) % 52)}%` }} />)}</div></div>
        <div className="sidebar-rule" /><div className="panel-kicker sidebar-systems-title"><Activity size={13} /> ACTIVE SYSTEMS</div>
        <nav className="sidebar-list" aria-label="Select a neural system">{NEURAL_NODES.filter((node) => quickNodes.includes(node.id)).map((node, index) => <button className={`path-item ${node.id === selectedId ? "selected" : ""}`} onClick={() => { setSelectedId(node.id); setPanelTab("node"); }} key={node.id}><span className="path-index">{String(index + 1).padStart(2, "0")}</span><span>{node.label}</span><ChevronRight size={12} /></button>)}</nav>
        <div className="sidebar-footer"><CircleDot size={13} /> {NEURAL_NODES.length} nodes online</div>
      </aside>

      <section className="workspace-main" aria-label="JARVIS command workspace">
        <section className="brain-stage" aria-label="Interactive three-dimensional neural graph"><div className="stage-label stage-label-top"><span>JARVIS NEURAL TOPOLOGY</span><span>LIVE / INTERACTIVE</span></div><NeuralBrain mode={mode} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setPanelTab("node"); }} /><div className="stage-quote"><p>JARVIS / OPERATIONAL CORE</p><span>DETAILED RESPONSE MODE</span></div><div className="mode-dock" role="group" aria-label="Simulate JARVIS operational states"><span className="dock-label">STATE</span>{modeOrder.map((item) => <button key={item} onClick={() => setMode(item)} className={`mode-button ${mode === item ? "is-active" : ""}`} style={mode === item ? { "--mode-color": MODE_COPY[item].color } as CSSProperties : undefined}>{item === "idle" ? <Activity size={14} /> : item === "listening" ? <Mic size={14} /> : item === "thinking" ? <Sparkles size={14} /> : item === "speaking" ? <AudioLines size={14} /> : <Waves size={14} />}<span>{item}</span></button>)}</div></section>

        <aside className="workspace-panel panel-glass" aria-label="Operational detail panel">
          <Tabs value={panelTab} onValueChange={setPanelTab} className="workspace-tabs">
            <TabsList className="panel-tabs-list" aria-label="Command workspace tabs">
              <TabsTrigger className="panel-tabs-trigger" value="lucy"><AudioLines size={13} /> JARVIS</TabsTrigger>
              <TabsTrigger className="panel-tabs-trigger" value="trace"><Radio size={13} /> Trace</TabsTrigger>
              <TabsTrigger className="panel-tabs-trigger" value="memory"><Database size={13} /> Memory</TabsTrigger>
              <TabsTrigger className="panel-tabs-trigger" value="node"><Rotate3D size={13} /> Node</TabsTrigger>
            </TabsList>
            <TabsContent value="lucy" className="panel-tab-content lucy-tab-content">
              <div className="tab-heading"><span>JARVIS / DETAILED GUIDANCE</span><b><i /> {voiceStatus}</b></div>
              <form className="alice-command-form" onSubmit={submitCommand}>
                <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="JARVIS, prepare a detailed briefing" aria-label="JARVIS wake-word command" />
                <button type="submit" aria-label="Send command"><Send size={14} /></button>
              </form>
              <div className="voice-control-row"><Button className={`privacy-control ${privacyLock ? "is-locked" : "is-open"}`} onClick={togglePrivacyLock}><ShieldCheck size={12} /> {privacyLock ? "Privacy locked" : "Privacy open"}</Button><Button className={`always-on-control ${isAlwaysOn ? "is-active" : ""}`} disabled={privacyLock} onClick={toggleAlwaysOn}><Radio size={12} /> {isAlwaysOn ? "Wake mode on" : "Wake mode"}</Button></div>
              <div className="voice-device-controls"><label><span>INPUT DEVICE</span><Select value={selectedMicrophoneId} onValueChange={selectMicrophone}><SelectTrigger className="voice-select"><SelectValue placeholder="Browser default microphone" /></SelectTrigger><SelectContent><SelectItem value="default">Browser default microphone</SelectItem>{microphones.map((device) => <SelectItem key={device.id} value={device.id}>{device.label}</SelectItem>)}</SelectContent></Select></label><label><span>WAKE SENSITIVITY <b>{wakeSensitivity}%</b></span><Slider min={25} max={95} step={1} value={[wakeSensitivity]} onValueChange={([value]) => setWakeSensitivity(value ?? 62)} className="voice-sensitivity" /></label></div>
              <div className="cloud-control"><Button className={`always-on-control ${cloudRecognition ? "is-active" : ""}`} onClick={toggleCloudRecognition}><Waves size={12} /> {cloudRecognition ? "Cloud accuracy on" : "Cloud accuracy"}</Button><span>{cloudStatus}</span></div>
              <div className="alice-hint"><Mic size={12} /> <b>{privacyLock ? "Unlock privacy" : "Start mic"}.</b> {privacyLock ? "The microphone is off." : "Allow access, then say JARVIS."}</div>
              <div className="voice-monitor" aria-label={`Microphone level ${Math.round(micLevel * 100)} percent`}><div className="voice-monitor-heading"><span><Mic size={11} /> LIVE MICROPHONE</span><b>{isListening ? "LISTENING" : privacyLock ? "PRIVATE" : "STANDBY"}</b></div><div className="mic-level-meter" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ opacity: micLevel * 18 > index ? 1 : 0.16, height: `${25 + ((index * 13) % 56)}%` }} />)}</div><div className="alice-hint mic-calibration" aria-live="polite"><Mic size={11} /> {micGuidance}</div><div className="live-transcript" aria-live="polite"><span>LIVE TRANSCRIPT</span><p>{liveTranscript}</p></div></div>
              <article className="lucy-briefing">{answerReceivedAt && <div className="guidance-answer-receipt" data-testid="answer-received-timestamp"><span>FINAL PARSED ANSWER</span><time>ANSWER RECEIVED / {answerReceivedAt}</time></div>}<h3>{briefing.title}</h3><p>{briefing.summary}</p><ol>{briefing.steps.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>)}</ol></article>
              <Button className="lucy-replay" onClick={() => playLucyAsset("acknowledgement")}><AudioLines size={14} /> Play JARVIS response</Button>
            </TabsContent>
          <TabsContent value="trace" className="panel-tab-content"><div className="tab-heading"><span>LIVE EXECUTION TRACE</span><b><i /> RECORDING</b></div><div className="trace-transcript"><span><Mic size={11} /> ACTIVE TRANSCRIPT</span><p>{TRANSCRIPT_COPY[mode]}</p></div><div className="compact-trace-list">{visibleTrace.map((event) => <button key={event.id} onClick={() => setSelectedId(event.nodeId)} className={`compact-trace-item ${event.nodeId === selectedId ? "is-selected" : ""}`}><span className="compact-trace-marker" style={{ backgroundColor: event.status === "awaiting" ? "#dca765" : stateCopy.color }} /><span><small>{event.source} / {event.time}</small><strong>{event.label}</strong><em>{event.detail}</em></span></button>)}</div><div className="operator-note"><ShieldCheck size={12} /> Operator view only. Private reasoning remains sealed.</div></TabsContent>
          <TabsContent value="memory" className="panel-tab-content"><div className="tab-heading"><span>CONTEXT / MEMORY</span><b><i /> LOCAL</b></div><MemoryLens scope={memoryScope} onScopeChange={(scope) => { setMemoryScope(scope); setSelectedId("memory"); }} /><div className="memory-footnote"><Database size={13} /><span>Context remains local to this simulated operator console until connected to an agent service.</span></div></TabsContent>
          <TabsContent value="node" className="panel-tab-content"><div className="tab-heading"><span>NODE TELEMETRY</span><b className="node-state">{selected.activity}</b></div><div className="selected-node-mark" style={{ "--node-color": selected.type === "decision" ? "#dca765" : stateCopy.color } as CSSProperties}><span /></div><p className="node-department">{selected.department} / {selected.type}</p><h2 className="selected-node-title">{selected.label}</h2><p className="selected-node-description">{selected.description}</p><dl className="selected-node-stats"><div><dt>ACTIVE TASK</dt><dd>{selected.currentTask}</dd></div><div><dt>LIVE METRIC</dt><dd>{selected.metric}</dd></div><div><dt>LINKS</dt><dd>{selected.connections} direct connections</dd></div><div><dt>LAST SIGNAL</dt><dd>{selected.lastSignal}</dd></div></dl><Button className="inspect-button" onClick={() => setMode(selected.type === "decision" ? "approval" : "thinking")}>Trace selected node <ChevronRight size={14} /></Button></TabsContent>
        </Tabs></aside>
      </section>
    </main>
    {(answerTrace.length > 0 || retryableAnswerFailure || answerReceivedAt) && <ResponseWorklog events={visibleTrace} answer={answerReceivedAt ? briefing : null} answerReceivedAt={answerReceivedAt} retryable={retryableAnswerFailure} isPending={answerInProgressRef.current} onRetry={retryLastAnswer} onSelect={(nodeId) => { setSelectedId(nodeId); setPanelTab("node"); }} />}
    <footer className="bottom-rail"><span><span className="keycap">JARVIS</span> command prefix</span><span><span className="keycap">DRAG</span> orbit <span className="keycap">SCROLL</span> depth</span><span>JARVIS NATURAL VOICE / LOCAL BROWSER OUTPUT.</span></footer>
  </div>;
}
