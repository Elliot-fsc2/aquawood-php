import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, X, LoaderCircle } from 'lucide-react';
import { store as emergencyStore } from '@/routes/emergency';

const emergencyTypes = [
    { value: 'general', label: 'General', emoji: '🔔' },
    { value: 'medical', label: 'Medical', emoji: '🚨' },
    { value: 'fire', label: 'Fire', emoji: '🔥' },
    { value: 'security', label: 'Security', emoji: '⚠️' },
    { value: 'other', label: 'Other', emoji: '📢' },
];

export default function EmergencySosButton() {
    const { canTriggerEmergency } = usePage().props as { canTriggerEmergency?: boolean };

    if (!canTriggerEmergency) {
        return null;
    }
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ type: 'general', details: '' });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        setSubmitting(true);
        setError(null);

        router.post(
            emergencyStore().url,
            form,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setOpen(false);
                    setForm({ type: 'general', details: '' });
                    setSubmitting(false);
                },
                onError: (err) => {
                    setError(Object.values(err)[0] ?? 'An error occurred.');
                    setSubmitting(false);
                },
            },
        );
    };

    return (
        <>
            {/* SOS Button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 hover:scale-110 active:scale-95 transition-all animate-pulse hover:animate-none flex items-center justify-center"
                title="Emergency"
            >
                <AlertTriangle className="w-6 h-6" />
            </button>

            {/* SOS Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={() => !submitting && setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-red-900">Emergency Alert</h3>
                                        <p className="text-sm text-red-700">This will notify the front desk immediately</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !submitting && setOpen(false)}
                                    className="text-red-400 hover:text-red-600"
                                    disabled={submitting}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Emergency Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {emergencyTypes.map((et) => (
                                        <button
                                            key={et.value}
                                            onClick={() => setForm({ ...form, type: et.value })}
                                            className={`px-3 py-3 rounded-lg text-sm font-medium transition border ${
                                                form.type === et.value
                                                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                                            }`}
                                        >
                                            <div className="text-lg mb-1">{et.emoji}</div>
                                            {et.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Details (optional)
                                </label>
                                <textarea
                                    value={form.details}
                                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                                    placeholder="Describe the situation..."
                                    rows={3}
                                    maxLength={1000}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none"
                                />
                                <div className="text-xs text-gray-400 text-right mt-1">{form.details.length}/1000</div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setOpen(false)}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <LoaderCircle className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" />
                                    )}
                                    Send Alert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
