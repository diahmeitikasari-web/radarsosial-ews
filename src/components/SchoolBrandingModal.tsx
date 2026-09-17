import React, { useState } from 'react';
import { Palette, Check, Sparkles, X, ShieldCheck } from 'lucide-react';
import { School, SchoolTheme } from '../types';
import { THEME_PRESETS } from '../utils/themePresets';
import { dataStorage } from '../services/dataStorage';

interface SchoolBrandingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentSchool?: School;
  school?: School;
  onThemeSaved?: () => void;
  onSaveTheme?: (updatedSchool: School) => void;
}

export const SchoolBrandingModal: React.FC<SchoolBrandingModalProps> = ({
  isOpen = true,
  onClose,
  currentSchool,
  school,
  onThemeSaved,
  onSaveTheme,
}) => {
  const targetSchool = currentSchool || school;
  const [selectedPreset, setSelectedPreset] = useState<SchoolTheme['preset']>(
    targetSchool?.theme?.preset || 'navy_gold'
  );
  const [schoolBadge, setSchoolBadge] = useState<string>(
    targetSchool?.theme?.schoolBadge || 'Sekolah Unggul Berakhlak Mulia'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !targetSchool) return null;

  const currentPresetDef = THEME_PRESETS.find((p) => p.id === selectedPreset) || THEME_PRESETS[0];

  const handleSave = () => {
    const updatedTheme: SchoolTheme = {
      preset: selectedPreset,
      primaryColor: currentPresetDef.primary,
      secondaryColor: currentPresetDef.secondary,
      accentColor: currentPresetDef.accent,
      accentLight: currentPresetDef.accentLight,
      schoolBadge: schoolBadge.trim() || undefined,
    };

    dataStorage.updateSchoolTheme(targetSchool.id, updatedTheme);
    const updatedSchool = { ...targetSchool, theme: updatedTheme };
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onThemeSaved) onThemeSaved();
      if (onSaveTheme) onSaveTheme(updatedSchool);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0a2a4a] border border-[#1a3f64] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1a3f64] flex items-center justify-between bg-[#0d3555]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-[#f0c040] border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span>Preferensi Warna &amp; Branding Sekolah</span>
                <Sparkles className="w-4 h-4 text-[#f0c040]" />
              </h3>
              <p className="text-xs text-[#b0c4de]">
                Personalisasi atmosfer visual dashboard untuk <strong className="text-white">{currentSchool.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b0c4de] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Live Preview Card */}
          <div className="space-y-2">
            <label className="text-[#f7d970] font-semibold text-xs flex items-center gap-1.5">
              <span>Pratinjau Langsung (Live Preview Suasana Dashboard)</span>
            </label>
            <div
              className="p-4 rounded-xl border transition-all duration-300 relative overflow-hidden shadow-lg"
              style={{
                backgroundColor: currentPresetDef.primary,
                borderColor: currentPresetDef.accent,
              }}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: currentPresetDef.secondary,
                      color: currentPresetDef.accentLight,
                    }}
                  >
                    {currentSchool.type} &bull; {currentSchool.city}
                  </span>
                  <h4 className="font-serif text-base font-bold text-white">
                    {currentSchool.name}
                  </h4>
                  <p className="text-[11px] text-white/80 font-medium">
                    {schoolBadge || 'Motto Sekolah'}
                  </p>
                </div>
                <div
                  className="px-3 py-1.5 rounded-lg font-bold text-xs shadow"
                  style={{
                    backgroundColor: currentPresetDef.accent,
                    color: currentPresetDef.primary,
                  }}
                >
                  Radar Sosial Aktif
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/70">
                <span>NPSN: {currentSchool.npsn}</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: currentPresetDef.accent }} />
                  Tema: {currentPresetDef.name.split(' (')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Preset Palettes Grid */}
          <div className="space-y-3">
            <label className="text-white font-semibold text-xs block">
              Pilih Palet Tema Identitas Sekolah:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#133e66] border-[#f0c040] shadow-md ring-1 ring-[#f0c040]'
                        : 'bg-[#08223d] border-[#1a3f64] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#f0c040]" />}
                        <span>{preset.name}</span>
                      </span>
                    </div>

                    <p className="text-[10px] text-[#b0c4de] mb-3 leading-relaxed">
                      {preset.description}
                    </p>

                    {/* Color swatches */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                      <span className="text-[9px] text-[#8fa8c6] mr-1">Warna:</span>
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: preset.primary }}
                        title={`Utama: ${preset.primary}`}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: preset.secondary }}
                        title={`Sekunder: ${preset.secondary}`}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: preset.accent }}
                        title={`Aksen: ${preset.accent}`}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: preset.accentLight }}
                        title={`Sorotan: ${preset.accentLight}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slogan / Motto Customization */}
          <div className="space-y-1.5">
            <label className="text-white font-semibold text-xs block">
              Slogan / Motto Satuan Pendidikan:
            </label>
            <input
              type="text"
              value={schoolBadge}
              onChange={(e) => setSchoolBadge(e.target.value)}
              placeholder="Contoh: Madrasah Mandiri Berprestasi &amp; Ramah Anak"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#08223d] border border-[#1a3f64] text-white text-xs focus:outline-none focus:border-[#f0c040]"
            />
            <p className="text-[10px] text-[#8fa8c6]">
              Motto ini akan tampil pada banner identitas dashboard Guru BK dan Kepala Sekolah.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a3f64] bg-[#0d3555] flex items-center justify-between">
          <div className="text-[11px] text-[#b0c4de]">
            Preferensi tersimpan di penyimpanan lokal sekolah
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-800" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  <span>Terapkan Tema Sekolah</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
