import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { useContent, SiteContent } from '../../hooks/useContent';

const fields: { key: keyof SiteContent; label: string; description: string }[] = [
  {
    key: 'hero_name',
    label: 'Photographer Name',
    description: 'The large text displayed in the hero section (currently 武山松)',
  },
  {
    key: 'hero_subtitle',
    label: 'Hero Subtitle',
    description: 'Small label above the name (e.g. "Portfolio")',
  },
  {
    key: 'grid_title',
    label: 'Gallery Section Title',
    description: 'Heading for the photo grid (e.g. "Selected Works")',
  },
];

const ContentEditor: React.FC = () => {
  const { content, loading, refetch } = useContent();
  const [values, setValues] = useState<SiteContent>(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local state when remote content loads
  useEffect(() => {
    setValues(content);
  }, [content]);

  const isDirty = JSON.stringify(values) !== JSON.stringify(content);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.updateContent(values as unknown as Record<string, string>);
      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-slate/40" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-charcoal/10 pb-8">
        <h2 className="font-serif italic text-3xl text-charcoal mb-1">Site Text</h2>
        <p className="font-mono text-[10px] tracking-widest uppercase text-slate/50">
          Edit the text that appears on your portfolio
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-10 max-w-lg">
        {fields.map(({ key, label, description }) => (
          <div key={key}>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-slate/60 mb-1">
              {label}
            </label>
            <p className="font-sans text-xs text-slate/40 mb-3">{description}</p>
            <input
              type="text"
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal/60 outline-none py-3 font-sans text-base text-charcoal placeholder:text-slate/30 transition-colors duration-300"
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="font-mono text-[10px] tracking-widest uppercase text-red-400">{error}</p>
      )}

      {/* Save button */}
      <div className="flex items-center gap-6">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-2 px-6 py-3 border border-charcoal/20 hover:border-charcoal/60 font-mono text-[10px] tracking-widest uppercase text-charcoal/60 hover:text-charcoal transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 size={13} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={13} /> Saved</>
          ) : (
            'Save Changes'
          )}
        </button>

        {isDirty && !saving && (
          <button
            onClick={() => setValues(content)}
            className="font-mono text-[10px] tracking-widest uppercase text-slate/30 hover:text-slate/60 transition-colors duration-300"
          >
            Discard
          </button>
        )}
      </div>

      {/* Info note */}
      <div className="border border-charcoal/8 p-5 max-w-lg">
        <p className="font-mono text-[10px] tracking-widest uppercase text-slate/40 mb-2">Note</p>
        <p className="font-sans text-xs text-slate/50 leading-relaxed">
          Changes take effect immediately on the live site. Visitors who already have the page open
          will see the update on their next page load.
        </p>
      </div>
    </div>
  );
};

export default ContentEditor;
