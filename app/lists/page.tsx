import ListEditor from "@/components/ListEditor";

export default function ListsPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My Lists</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Organize companies into custom lists. Data is stored locally in your
                    browser.
                </p>
            </div>
            <ListEditor />
        </div>
    );
}
