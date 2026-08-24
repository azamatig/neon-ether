import React, { useState } from "react";
import { 
  Package, 
  Sparkles, 
  Coins, 
  Store, 
  Swords, 
  Scroll, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Shield, 
  Zap, 
  Flame, 
  Eye, 
  Gift, 
  ArrowRight 
} from "lucide-react";
import { ItemDetails, ITEM_METADATA } from "../../data";
import { GameState } from "../../types";

export interface CustomWorldItem extends ItemDetails {
  id: string;
  cost: number;
  placedInShop?: string; // POI id e.g. "marv_clinic", "nouveau_chrome", "black_market", "scavenger_outpost"
  placedInPOILoot?: string; // POI id where it can be looted/dropped
  rewardForQuest?: string; // Quest id or title
  image?: string;
}

interface ItemForgeStudioProps {
  customItems: CustomWorldItem[];
  setCustomItems: React.Dispatch<React.SetStateAction<CustomWorldItem[]>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
}

const PRESET_IMAGE_ITEMS = [
  { name: "Plasma Katana", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=400" },
  { name: "Cyberdeck Core", url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400" },
  { name: "Heavy Nanite Armor", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400" },
  { name: "Neural Stimulant", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" },
  { name: "Ancient Tech Relic", url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=400" },
  { name: "VIP Cyber-Implant", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=400" }
];

const SHOP_LOCATIONS = [
  { id: "marv_clinic", name: "Dr. Marv's Cyber-Clinic (Aurus District)" },
  { id: "nouveau_chrome", name: "Nouveau Cybernetic Showroom (Downtown)" },
  { id: "black_market", name: "Underground Black Market (Conduit 09)" },
  { id: "scavenger_outpost", name: "Scavenger Scrap Hub (Waste-Barrens)" },
  { id: "temple", name: "The Iron Coven Temple (Satoshi Square)" },
  { id: "club_afterlife", name: "Club Afterlife VIP Lounge (Downtown)" }
];

export const ItemForgeStudio: React.FC<ItemForgeStudioProps> = ({
  customItems,
  setCustomItems,
  gameState,
  setGameState,
  triggerToast
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(customItems[0]?.id || "new");
  
  const [itemForm, setItemForm] = useState<CustomWorldItem>({
    id: `item_${Date.now()}`,
    name: "Singularity Overcharger",
    desc: "A modified technomantic coil siphoning raw ether into hyper-accelerated plasma pulses.",
    slot: "meleeWeapon",
    rarity: "epic",
    cost: 320,
    specialEffect: "💥 Overcharge: +25% Critical Bio-Shock Damage",
    stats: {
      meleeAtk: 45,
      str: 3,
      dex: 2,
      maxMana: 30
    },
    placedInShop: "nouveau_chrome",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=400"
  });

  const handleSelectExisting = (item: CustomWorldItem) => {
    setSelectedItemId(item.id);
    setItemForm({ ...item });
  };

  const handleCreateNew = () => {
    const newId = `item_${Date.now()}`;
    const newItem: CustomWorldItem = {
      id: newId,
      name: "Custom Prototype Gear",
      desc: "Engineered in the Technomantic Forge.",
      slot: "meleeWeapon",
      rarity: "deluxe",
      cost: 180,
      specialEffect: "",
      stats: {
        meleeAtk: 25,
        str: 2
      },
      placedInShop: "black_market"
    };
    setSelectedItemId(newId);
    setItemForm(newItem);
  };

  const handleSaveItem = () => {
    if (!itemForm.name.trim()) {
      triggerToast("VALIDATION ERROR: Item Name is required!");
      return;
    }

    setCustomItems(prev => {
      const idx = prev.findIndex(i => i.id === itemForm.id || i.name.toLowerCase() === itemForm.name.toLowerCase());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = itemForm;
        return next;
      }
      return [...prev, itemForm];
    });

    triggerToast(`FORGE SUCCESS: "${itemForm.name}" registered in World Database!`);
  };

  const handleDeleteItem = (id: string) => {
    setCustomItems(prev => prev.filter(i => i.id !== id));
    triggerToast("Item removed from custom forge registry.");
    if (selectedItemId === id) {
      handleCreateNew();
    }
  };

  const handleSpawnIntoPlayerInventory = () => {
    setGameState(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), itemForm.name]
    }));
    triggerToast(`INVENTORY INJECTION: 1x "${itemForm.name}" added directly to Player Stash!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden text-xs font-mono">
      
      {/* LEFT COLUMN: Custom Items List & Actions */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden border-r border-cyan-500/20 pr-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <Package size={16} />
            <span>World Item Registry</span>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-black px-2.5 py-1 rounded font-bold uppercase cursor-pointer text-2xs transition-all"
          >
            <Plus size={12} /> New Item
          </button>
        </div>

        <p className="text-3xs text-slate-400 font-sans">
          Forge custom weapons, implants, stims, and relics. Appoint them to vendor shops, quest rewards, or loot tables across the city.
        </p>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {customItems.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-cyan-500/30 text-center text-slate-500 text-2xs">
              No custom items forged yet. Click "+ New Item" to create your first weapon, cyberware, or relic!
            </div>
          ) : (
            customItems.map(item => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectExisting(item)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]" 
                      : "bg-slate-950/70 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-200 truncate">{item.name}</span>
                    <span className={`text-3xs px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.rarity === "legendary" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                      item.rarity === "epic" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" :
                      item.rarity === "deluxe" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" :
                      "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}>
                      {item.rarity || "deluxe"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-3xs text-slate-400">
                    <span className="capitalize">{item.slot}</span>
                    <span className="text-amber-400 font-bold">{item.cost || 0}¤</span>
                  </div>

                  {item.placedInShop && (
                    <div className="flex items-center gap-1 text-3xs text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <Store size={10} />
                      <span className="truncate">Shop: {SHOP_LOCATIONS.find(s => s.id === item.placedInShop)?.name.split(" ")[0] || item.placedInShop}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Item Editor & World Placer */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Header and Quick Injection Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={18} />
            <span className="font-bold text-sm text-white uppercase tracking-wider">Item Forge & Placement Controls</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpawnIntoPlayerInventory}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-3 py-1.5 rounded font-bold uppercase cursor-pointer text-2xs transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              <Gift size={13} /> Spawn in Inventory
            </button>
            <button
              onClick={handleSaveItem}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 rounded font-black uppercase cursor-pointer text-2xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              <Check size={13} /> Save to World
            </button>
            {customItems.some(i => i.id === itemForm.id) && (
              <button
                onClick={() => handleDeleteItem(itemForm.id)}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 p-1.5 rounded cursor-pointer transition-all"
                title="Delete Item"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Core Item Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Item Name</label>
            <input
              type="text"
              value={itemForm.name}
              onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full bg-slate-950/80 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs focus:border-cyan-400 outline-none"
              placeholder="e.g. Apex Hyper-Katana"
            />
          </div>

          <div className="space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Equipment Slot</label>
            <select
              value={itemForm.slot}
              onChange={e => setItemForm({ ...itemForm, slot: e.target.value as any })}
              className="w-full bg-slate-950/80 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs focus:border-cyan-400 outline-none uppercase"
            >
              <option value="meleeWeapon">Melee Weapon</option>
              <option value="rangedWeapon">Ranged Weapon</option>
              <option value="armor">Armor</option>
              <option value="headpiece">Headpiece / Visor</option>
              <option value="trinket">Cyberware / Implant</option>
              <option value="consumable">Consumable Stim</option>
              <option value="valuable">Quest Relic / Valuable</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Rarity Tier</label>
            <select
              value={itemForm.rarity || "deluxe"}
              onChange={e => setItemForm({ ...itemForm, rarity: e.target.value as any })}
              className="w-full bg-slate-950/80 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs focus:border-cyan-400 outline-none uppercase"
            >
              <option value="common">Common (Standard)</option>
              <option value="deluxe">Deluxe (Modified)</option>
              <option value="epic">Epic (Prototype)</option>
              <option value="legendary">Legendary (Ancient Relic)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-3xs text-amber-400 uppercase font-bold">Market Price (Credits ¤)</label>
            <input
              type="number"
              value={itemForm.cost || 0}
              onChange={e => setItemForm({ ...itemForm, cost: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-950/80 border border-amber-500/30 rounded p-2 text-amber-300 text-xs focus:border-amber-400 outline-none font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Special Combat Effect</label>
            <input
              type="text"
              value={itemForm.specialEffect || ""}
              onChange={e => setItemForm({ ...itemForm, specialEffect: e.target.value })}
              className="w-full bg-slate-950/80 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs focus:border-cyan-400 outline-none"
              placeholder="e.g. +20% EMP Stun on Crit"
            />
          </div>
        </div>

        {/* Item Description */}
        <div className="space-y-1">
          <label className="text-3xs text-cyan-400 uppercase font-bold">Lore & Description</label>
          <textarea
            rows={2}
            value={itemForm.desc}
            onChange={e => setItemForm({ ...itemForm, desc: e.target.value })}
            className="w-full bg-slate-950/80 border border-cyan-500/30 rounded p-2 text-slate-300 text-2xs focus:border-cyan-400 outline-none font-sans"
            placeholder="Describe the weapon's history, manufacturer, and technomantic components..."
          />
        </div>

        {/* Stat Modifiers Grid */}
        <div className="border border-cyan-500/20 bg-slate-950/60 rounded-lg p-3 space-y-2">
          <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={12} /> Combat & Attribute Stat Boosts
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            <div>
              <label className="text-3xs text-slate-400 uppercase">Melee ATK</label>
              <input
                type="number"
                value={itemForm.stats?.meleeAtk || 0}
                onChange={e => setItemForm({ ...itemForm, stats: { ...itemForm.stats, meleeAtk: parseInt(e.target.value) || 0 } })}
                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-cyan-300 text-xs"
              />
            </div>
            <div>
              <label className="text-3xs text-slate-400 uppercase">Ranged ATK</label>
              <input
                type="number"
                value={itemForm.stats?.rangeAtk || 0}
                onChange={e => setItemForm({ ...itemForm, stats: { ...itemForm.stats, rangeAtk: parseInt(e.target.value) || 0 } })}
                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-cyan-300 text-xs"
              />
            </div>
            <div>
              <label className="text-3xs text-slate-400 uppercase">Max HP</label>
              <input
                type="number"
                value={itemForm.stats?.maxHp || 0}
                onChange={e => setItemForm({ ...itemForm, stats: { ...itemForm.stats, maxHp: parseInt(e.target.value) || 0 } })}
                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-emerald-400 text-xs"
              />
            </div>
            <div>
              <label className="text-3xs text-slate-400 uppercase">Max Mana / Ether</label>
              <input
                type="number"
                value={itemForm.stats?.maxMana || 0}
                onChange={e => setItemForm({ ...itemForm, stats: { ...itemForm.stats, maxMana: parseInt(e.target.value) || 0 } })}
                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-purple-400 text-xs"
              />
            </div>
            <div>
              <label className="text-3xs text-slate-400 uppercase">Strength (STR)</label>
              <input
                type="number"
                value={itemForm.stats?.str || 0}
                onChange={e => setItemForm({ ...itemForm, stats: { ...itemForm.stats, str: parseInt(e.target.value) || 0 } })}
                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-red-400 text-xs"
              />
            </div>
            <div>
              <label className="text-3xs text-slate-400 uppercase">Intellect (INT)</label>
              <input
                type="number"
                value={itemForm.stats?.int || 0}
                onChange={e => setItemForm({ ...itemForm, stats: { ...itemForm.stats, int: parseInt(e.target.value) || 0 } })}
                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-blue-400 text-xs"
              />
            </div>
          </div>
        </div>

        {/* WORLD PLACEMENT SECTION */}
        <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-2xs">
            <Store size={14} />
            <span>World Placement (Where Can Players Find / Buy This Item?)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-3xs text-emerald-300 uppercase font-bold">🏪 Buyable at Vendor / Shop</label>
              <select
                value={itemForm.placedInShop || ""}
                onChange={e => setItemForm({ ...itemForm, placedInShop: e.target.value || undefined })}
                className="w-full bg-slate-950 border border-emerald-500/30 rounded p-2 text-emerald-200 text-xs outline-none"
              >
                <option value="">-- Do Not Put In Vendor Stores --</option>
                {SHOP_LOCATIONS.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-3xs text-purple-300 uppercase font-bold">📜 Reward for Quest / Contract</label>
              <input
                type="text"
                value={itemForm.rewardForQuest || ""}
                onChange={e => setItemForm({ ...itemForm, rewardForQuest: e.target.value })}
                className="w-full bg-slate-950 border border-purple-500/30 rounded p-2 text-purple-200 text-xs outline-none"
                placeholder="e.g. Nouveau Heist or Custom Quest"
              />
            </div>
          </div>
        </div>

        {/* Visual Artwork & Presets */}
        <div className="border border-white/10 bg-slate-950/60 rounded-lg p-3 space-y-2">
          <label className="text-3xs text-cyan-400 uppercase font-bold">Item Artwork URL & Presets</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={itemForm.image || ""}
              onChange={e => setItemForm({ ...itemForm, image: e.target.value })}
              className="flex-1 bg-slate-900 border border-white/10 rounded p-2 text-cyan-200 text-2xs outline-none"
              placeholder="https://images.unsplash.com/..."
            />
            {itemForm.image && (
              <img
                src={itemForm.image}
                alt="preview"
                className="w-10 h-10 object-cover rounded border border-cyan-500/40"
              />
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
            <span className="text-3xs text-slate-500 uppercase font-bold">Presets:</span>
            {PRESET_IMAGE_ITEMS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setItemForm({ ...itemForm, image: preset.url })}
                className="text-3xs bg-slate-900 hover:bg-cyan-950 border border-white/10 hover:border-cyan-400/40 text-slate-300 px-2 py-1 rounded transition-all cursor-pointer truncate max-w-[140px]"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
