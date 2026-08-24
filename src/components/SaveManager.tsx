import React, { useState, useEffect } from "react";
import { Save, FolderOpen, Download, Upload, Trash2, Check, X, ShieldAlert } from "lucide-react";
import { GameState, LogMessage } from "../types";

export interface SaveMetadata {
  slotId: string;
  timestamp: string;
  playerName: string;
  archetype: string;
  level: number;
  credits: number;
  hp: number;
  maxHp: number;
  district: string;
  poi: string;
  day: number;
}

interface SaveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState | null;
  logs: LogMessage[];
  onLoadSave: (state: GameState, logs: LogMessage[]) => void;
  triggerToast: (msg: string) => void;
}

export default function SaveManager({
  isOpen,
  onClose,
  gameState,
  logs,
  onLoadSave,
  triggerToast
}: SaveManagerProps) {
  const [slots, setSlots] = useState<Record<string, SaveMetadata>>({});
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);

  // Load slot metadata on open
  useEffect(() => {
    const loadedSlots: Record<string, SaveMetadata> = {};
    const slotKeys = ["slot1", "slot2", "slot3", "autosave"];
    
    slotKeys.forEach(slotId => {
      const metaStr = localStorage.getItem(`neon_ether_meta_${slotId}`);
      if (metaStr) {
        try {
          loadedSlots[slotId] = JSON.parse(metaStr);
        } catch (e) {
          console.error(`Failed parsing metadata for ${slotId}`, e);
        }
      }
    });

    setSlots(loadedSlots);

    // Read autosave setting
    const autoSetting = localStorage.getItem("neon_ether_autosave_enabled");
    if (autoSetting !== null) {
      setAutosaveEnabled(autoSetting === "true");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle autosave setting
  const handleToggleAutosave = (enabled: boolean) => {
    setAutosaveEnabled(enabled);
    localStorage.setItem("neon_ether_autosave_enabled", enabled ? "true" : "false");
    triggerToast(`AUTOSAVE PROTOCOLS ${enabled ? "ONLINE" : "OFFLINE"}`);
  };

  // Perform saving
  const handleSaveToSlot = (slotId: string) => {
    if (!gameState) {
      triggerToast("ERROR: NO ACTIVE NEURAL SYSTEM DETECTED TO RECORD");
      return;
    }

    try {
      const timestamp = new Date().toLocaleString();
      const metadata: SaveMetadata = {
        slotId,
        timestamp,
        playerName: gameState.playerName || "Kaelen",
        archetype: gameState.archetype || "Unknown",
        level: gameState.level || 1,
        credits: gameState.credits || 0,
        hp: gameState.hp || 100,
        maxHp: gameState.maxHp || 100,
        district: gameState.district || "Aurus Hideout",
        poi: gameState.poi || "Hideout Core",
        day: gameState.day || 1
      };

      localStorage.setItem(`neon_ether_state_${slotId}`, JSON.stringify(gameState));
      localStorage.setItem(`neon_ether_logs_${slotId}`, JSON.stringify(logs));
      localStorage.setItem(`neon_ether_meta_${slotId}`, JSON.stringify(metadata));

      // Backup to primary slot key if Slot 1
      if (slotId === "slot1") {
        localStorage.setItem("neon_ether_state", JSON.stringify(gameState));
        localStorage.setItem("neon_ether_logs", JSON.stringify(logs));
      }

      setSlots(prev => ({ ...prev, [slotId]: metadata }));
      triggerToast(`💾 COGNITIVE SNAPSHOT LOCKED INTO [${slotId.toUpperCase()}]`);
    } catch (err) {
      console.error(err);
      triggerToast("CRITICAL FAIL: FILE WRITE ACCESS OUT-OF-BOUNDS");
    }
  };

  // Perform loading
  const handleLoadFromSlot = (slotId: string) => {
    const stateStr = localStorage.getItem(`neon_ether_state_${slotId}`);
    const logsStr = localStorage.getItem(`neon_ether_logs_${slotId}`);

    if (stateStr && logsStr) {
      try {
        const loadedState = JSON.parse(stateStr);
        const loadedLogs = JSON.parse(logsStr);
        
        onLoadSave(loadedState, loadedLogs);
        triggerToast(`📡 MEMORY SECTOR RESTORED FROM [${slotId.toUpperCase()}]`);
        onClose();
      } catch (err) {
        console.error(err);
        triggerToast("ERROR: SAVE DATA PARSING INTEGRITY FAULT");
      }
    } else {
      triggerToast("SECTOR VACANT: NO RECORDED DATA STREAM FOUND");
    }
  };

  // Delete save
  const handleDeleteSlot = (slotId: string) => {
    localStorage.removeItem(`neon_ether_state_${slotId}`);
    localStorage.removeItem(`neon_ether_logs_${slotId}`);
    localStorage.removeItem(`neon_ether_meta_${slotId}`);

    if (slotId === "slot1") {
      localStorage.removeItem("neon_ether_state");
      localStorage.removeItem("neon_ether_logs");
    }

    setSlots(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });

    triggerToast(`🗑️ PURGED: Save Slot [${slotId.toUpperCase()}] scrubbed clean`);
  };

  // Export current slot data to JSON file
  const handleExportSave = (slotId: string) => {
    const stateStr = localStorage.getItem(`neon_ether_state_${slotId}`);
    const logsStr = localStorage.getItem(`neon_ether_logs_${slotId}`);
    const metaStr = localStorage.getItem(`neon_ether_meta_${slotId}`);

    if (!stateStr) {
      triggerToast("ERROR: CANNOT EXPORT AN EMPTY SECTOR");
      return;
    }

    try {
      const exportObject = {
        state: JSON.parse(stateStr),
        logs: logsStr ? JSON.parse(logsStr) : [],
        meta: metaStr ? JSON.parse(metaStr) : null,
        exportedAt: new Date().toISOString(),
        version: "2.0"
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `neon_ether_save_${slotId}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      triggerToast("📥 CHRONO SAVE CORE SHIELDED & DOWNLOADED AS JSON");
    } catch (e) {
      console.error(e);
      triggerToast("EXPORT ERROR: FILE CONVERSION TIMEOUT");
    }
  };

  // Import JSON save file
  const handleImportSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];

    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.state) {
          triggerToast("INTEGRITY ERROR: JSON missing state block");
          return;
        }

        // Import into Slot 3 by default or find an empty slot, or override slot1
        const targetSlot = "slot1";
        const meta = parsed.meta || {
          slotId: targetSlot,
          timestamp: new Date().toLocaleString(),
          playerName: parsed.state.playerName || "Kaelen",
          archetype: parsed.state.archetype || "Unknown",
          level: parsed.state.level || 1,
          credits: parsed.state.credits || 0,
          hp: parsed.state.hp || 100,
          maxHp: parsed.state.maxHp || 100,
          district: parsed.state.district || "Aurus",
          poi: parsed.state.poi || "The Hideout",
          day: parsed.state.day || 1
        };

        localStorage.setItem(`neon_ether_state_${targetSlot}`, JSON.stringify(parsed.state));
        localStorage.setItem(`neon_ether_logs_${targetSlot}`, JSON.stringify(parsed.logs));
        localStorage.setItem(`neon_ether_meta_${targetSlot}`, JSON.stringify(meta));

        // Sync main
        localStorage.setItem("neon_ether_state", JSON.stringify(parsed.state));
        localStorage.setItem("neon_ether_logs", JSON.stringify(parsed.logs));

        setSlots(prev => ({ ...prev, [targetSlot]: meta }));
        onLoadSave(parsed.state, parsed.logs);
        triggerToast("📤 SYSTEM DECK RESTORED SUCCESS: Save imported into Slot 1");
        onClose();
      } catch (err) {
        console.error(err);
        triggerToast("DECRYPTION ERROR: File format corrupted or incompatible");
      }
    };

    fileReader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 box-glow-cyan">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Save className="text-cyan-400" size={18} />
            <h3 className="font-display font-black text-sm uppercase tracking-widest text-cyan-300">
              Integrated Neural Save Deck
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all cursor-pointer p-1 hover:bg-white/5 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Global Autosave and Backup Control */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/60 p-4 rounded-xl border border-white/5 gap-3">
          <div>
            <div className="text-[11px] font-bold text-white uppercase font-mono">
              Autosave synchronization protocols
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              Automatically updates slot [AUTOSAVE] during travel, resting, and post-combat cycles.
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autosaveEnabled}
                onChange={(e) => handleToggleAutosave(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-slate-950"></div>
              <span className="ml-2 text-[10px] font-mono uppercase text-slate-300">
                {autosaveEnabled ? "ACTIVE" : "STANDBY"}
              </span>
            </label>

            <label className="bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1.5">
              <Upload size={11} /> Import .json Save
              <input
                type="file"
                accept=".json"
                onChange={handleImportSave}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Save Slots List */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[360px] pr-1">
          {["slot1", "slot2", "slot3", "autosave"].map((slotId) => {
            const meta = slots[slotId];
            const isAutosave = slotId === "autosave";

            return (
              <div
                key={slotId}
                className={`bg-slate-950/40 border rounded-xl p-4 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  isAutosave
                    ? "border-purple-500/20 bg-purple-950/5 hover:border-purple-500/40"
                    : meta
                    ? "border-cyan-500/20 hover:border-cyan-500/40"
                    : "border-white/5 bg-slate-950/10"
                }`}
              >
                {/* Slot Details */}
                <div className="flex flex-col gap-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border uppercase leading-none ${
                        isAutosave
                          ? "bg-purple-950/60 text-purple-400 border-purple-500/30"
                          : meta
                          ? "bg-cyan-950/60 text-cyan-400 border-cyan-500/30"
                          : "bg-slate-900 text-slate-500 border-white/5"
                      }`}
                    >
                      {isAutosave ? "Autosave" : `Slot ${slotId.replace("slot", "")}`}
                    </span>
                    {meta && (
                      <span className="text-[10px] text-slate-500">
                        Synced: {meta.timestamp}
                      </span>
                    )}
                  </div>

                  {meta ? (
                    <div className="mt-2 text-left">
                      <div className="text-xs text-white font-black uppercase">
                        {meta.playerName} <span className="text-cyan-400">Lv.{meta.level}</span> {meta.archetype}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[10px] text-slate-400 mt-1">
                        <p>📍 Sector: <span className="text-slate-300">{meta.district.toUpperCase()}</span></p>
                        <p>⛺ POI: <span className="text-slate-300">{meta.poi.replace("Main Headquarters ", "")}</span></p>
                        <p>💰 Credits: <span className="text-emerald-400 font-bold">{meta.credits}¤</span></p>
                        <p>❤️ HP: <span className="text-rose-400">{meta.hp}/{meta.maxHp}</span></p>
                        <p>📅 Cycle Day: <span className="text-slate-300">{meta.day}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-600 text-xs mt-1.5 italic">
                      No memory cells recorded in this sector
                    </div>
                  )}
                </div>

                {/* Slot Operations */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Save to Slot (Not allowed for Autosave) */}
                  {!isAutosave && gameState && (
                    <button
                      onClick={() => handleSaveToSlot(slotId)}
                      title="Save game to this slot"
                      className="bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-cyan-400 p-2 rounded transition-all cursor-pointer hover:scale-105"
                    >
                      <Save size={13} />
                    </button>
                  )}

                  {/* Load from Slot */}
                  {meta && (
                    <button
                      onClick={() => handleLoadFromSlot(slotId)}
                      title="Restore memory snapshot"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded font-extrabold transition-all cursor-pointer hover:scale-105"
                    >
                      <FolderOpen size={13} />
                    </button>
                  )}

                  {/* Export Slot */}
                  {meta && (
                    <button
                      onClick={() => handleExportSave(slotId)}
                      title="Export save file to disk"
                      className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 p-2 rounded transition-all cursor-pointer hover:scale-105"
                    >
                      <Download size={13} />
                    </button>
                  )}

                  {/* Delete Slot (Only manual slots) */}
                  {!isAutosave && meta && (
                    <button
                      onClick={() => handleDeleteSlot(slotId)}
                      title="Purge slot"
                      className="bg-slate-950 hover:bg-rose-950/40 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 p-2 rounded transition-all cursor-pointer hover:scale-105"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer Warning */}
        <div className="text-[9px] text-slate-500 border-t border-white/5 pt-3 flex items-center gap-1.5 font-mono">
          <ShieldAlert size={12} className="text-amber-500" />
          DO NOT FLUSH BROWSER CACHE OR DATA DIRECTORIES UNLESS BACKUP IS SECURED VIA JSON EXPORTS.
        </div>
      </div>
    </div>
  );
}
