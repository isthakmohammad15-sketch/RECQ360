import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Save } from 'lucide-react';

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  help?: string;
  /** Half width on desktop. */
  half?: boolean;
}

interface FormModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  fields: FormField[];
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  portal?: boolean;
}

/** Professional dark modal form used by every "Add …" action. */
export const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  subtitle,
  fields,
  submitLabel = 'Save',
  onClose,
  onSubmit,
  portal = false,
}) => {
  const initial = () => {
    const v: Record<string, any> = {};
    fields.forEach((f) => {
      v[f.name] =
        f.defaultValue !== undefined
          ? f.defaultValue
          : f.type === 'checkbox'
            ? false
            : f.type === 'select'
              ? (f.options?.[0]?.value ?? '')
              : '';
    });
    return v;
  };

  const [values, setValues] = useState<Record<string, any>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  // Reset the form each time the modal is opened.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(initial());
      setErrors({});
      setBusy(false);
    }
  }

  if (!open) return null;

  const set = (name: string, value: any) => setValues((p) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (!f.required) return;
      const v = values[f.name];
      if (f.type === 'checkbox') return;
      if (v === '' || v === null || v === undefined) nextErrors[f.name] = 'Required';
      if (f.type === 'number' && v !== '' && Number.isNaN(Number(v))) nextErrors[f.name] = 'Must be a number';
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full bg-[#0B1220] border border-white/10 rounded px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#2E9CCA]';

  const modalContent = (
    <div
      className={`fixed inset-0 ${portal ? 'z-[9999]' : 'z-[100]'} bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto`}
    >
      <div className="bg-[#0F1A2E] border border-[#2E9CCA]/30 rounded-lg w-full max-w-2xl shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-lg text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.half ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="block text-[11px] font-mono uppercase tracking-wide text-slate-400 mb-1">
                  {f.label}
                  {f.required && <span className="text-[#E4572E]"> *</span>}
                </label>

                {f.type === 'textarea' && (
                  <textarea
                    className={inputCls}
                    rows={3}
                    placeholder={f.placeholder ?? ''}
                    value={values[f.name] ?? ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}

                {f.type === 'select' && (
                  <select className={inputCls} value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}

                {f.type === 'checkbox' && (
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                    <input
                      type="checkbox"
                      checked={!!values[f.name]}
                      onChange={(e) => set(f.name, e.target.checked)}
                      className="accent-[#2E9CCA] w-4 h-4"
                    />
                    <span>{f.placeholder ?? 'Enabled'}</span>
                  </label>
                )}

                {(f.type === 'text' || f.type === 'number') && (
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    className={inputCls}
                    placeholder={f.placeholder ?? ''}
                    value={values[f.name] ?? ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}

                {f.help && <p className="text-[10px] text-slate-500 font-mono mt-1">{f.help}</p>}
                {errors[f.name] && (
                  <p className="text-[10px] text-[#E4572E] font-mono mt-1">{errors[f.name]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-white/10 text-slate-300 font-mono text-xs hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded bg-[#2E9CCA]/20 hover:bg-[#2E9CCA]/30 border border-[#2E9CCA]/40 text-[#2E9CCA] font-mono text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{submitLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
