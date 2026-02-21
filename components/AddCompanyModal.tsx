"use client";

import { useState } from "react";
import { useCompaniesContext } from "@/components/CompaniesContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddCompanyModal({ isOpen, onClose }: Props) {
    const { addCompany } = useCompaniesContext();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        website: "",
        sector: "Enterprise Software",
        stage: "Seed",
        short_desc: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Basic URL validation
            let url = formData.website;
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }
            new URL(url); // Throws if invalid

            const success = await addCompany({ ...formData, website: url });
            if (success) {
                setFormData({
                    name: "",
                    website: "",
                    sector: "Enterprise Software",
                    stage: "Seed",
                    short_desc: "",
                });
                onClose();
            }
        } catch (err) {
            alert("Please enter a valid website URL. Example: https://example.com");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-surface text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-surface-border p-6 m-4 animate-slide-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight">Add Company</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input w-full"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                        <input
                            required
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="input w-full"
                            placeholder="e.g. acme.com or https://acme.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sector</label>
                            <select
                                name="sector"
                                value={formData.sector}
                                onChange={handleChange}
                                className="input w-full cursor-pointer"
                            >
                                <option value="Enterprise Software">Enterprise Software</option>
                                <option value="Artificial Intelligence">Artificial Intelligence</option>
                                <option value="Fintech">Fintech</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Consumer">Consumer</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                            <select
                                name="stage"
                                value={formData.stage}
                                onChange={handleChange}
                                className="input w-full cursor-pointer"
                            >
                                <option value="Seed">Seed</option>
                                <option value="Series A">Series A</option>
                                <option value="Series B">Series B</option>
                                <option value="Growth">Growth</option>
                                <option value="Late Stage">Late Stage</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description <span className="text-slate-400 font-normal">(optional)</span></label>
                        <textarea
                            name="short_desc"
                            value={formData.short_desc}
                            onChange={handleChange}
                            className="input w-full py-2 min-h-[80px]"
                            placeholder="Briefly describe what they do..."
                        />
                    </div>

                    <div className="mt-8 pt-4 border-t border-surface-border flex items-center justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-ghost" disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary min-w-[100px]" disabled={submitting}>
                            {submitting ? "Adding..." : "Add Company"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
