'use client';

import { Terminal, Play, Plus, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ActionPanel() {
    const [commands, setCommands] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string | null>(null);

    // New Command Form
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCmd, setNewCmd] = useState('');

    const fetchCommands = async () => {
        try {
            const res = await fetch('/api/os/commands');
            const data = await res.json();
            setCommands(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    const runCommand = async (key: string) => {
        setLoading(true);
        setOutput(`> Executing ${key}...`);
        try {
            const res = await fetch('/api/os/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: key }),
            });
            const result = await res.json();
            if (result.status === 'success') {
                setOutput(result.stdout || 'Success (No Output)');
            } else {
                setOutput(`Error: ${result.error}\nStderr: ${result.stderr}`);
            }
        } catch (e) {
            setOutput(`Failed to communicate: ${e}`);
        } finally {
            setLoading(false);
        }
    };

    const addCommand = async () => {
        if (!newName || !newCmd) return;
        await fetch('/api/os/commands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, command: newCmd }),
        });
        setNewName('');
        setNewCmd('');
        setIsAdding(false);
        fetchCommands();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Terminal className="text-green-400" />
                    Actions
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            {isAdding && (
                <div className="p-4 bg-gray-800 rounded-xl mb-4 space-y-3 border border-gray-700">
                    <input
                        placeholder="Action Name (e.g. Ping)"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <input
                        placeholder="Command (e.g. ping google.com)"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                        value={newCmd}
                        onChange={e => setNewCmd(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={addCommand} className="px-4 py-1 bg-green-600 rounded text-sm font-medium">Save</button>
                        <button onClick={() => setIsAdding(false)} className="px-4 py-1 bg-gray-600 rounded text-sm font-medium">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(commands).map((key) => {
                    // Skip restricted visual commands if needed, but we wanted to replace "Remote Desktop"
                    if (key !== 'start_desktop' && key !== 'remote_desktop') {
                        return (
                            <button
                                key={key}
                                onClick={() => runCommand(key)}
                                disabled={loading}
                                className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group"
                            >
                                <span className="font-medium text-gray-200 capitalize">{key.replace(/_/g, ' ')}</span>
                                <Play size={16} className="text-gray-500 group-hover:text-green-400 transition-colors" />
                            </button>
                        );
                    }
                    return null;
                })}

                {/* Remote Desktop Launcher */}
                <Link
                    href="/desktop"
                    className="flex items-center justify-between p-4 bg-indigo-900/50 hover:bg-indigo-900/80 border border-indigo-700 rounded-xl transition-all group"
                    onClick={() => runCommand('start_desktop')} // Start desktop process on click too? Maybe better to let user do it explicitly or have page do it.
                >
                    <span className="font-medium text-indigo-200">Remote Desktop</span>
                    <ExternalLink size={16} className="text-indigo-400" />
                </Link>
            </div>

            {/* Console Output */}
            <div className="w-full bg-black rounded-xl p-4 font-mono text-sm text-gray-300 h-64 overflow-y-auto border border-gray-800">
                <div className="text-gray-600 mb-2"> Console Output</div>
                <pre className="whitespace-pre-wrap">{output || 'Ready...'}</pre>
                {loading && <span className="animate-pulse text-blue-400">_</span>}
            </div>
        </div>
    );
}
