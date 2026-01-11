"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Shield, Zap, Terminal, Github, Linkedin, Cpu } from "lucide-react";
import dynamic from "next/dynamic";
import SkavTechLogo from "../ui/SkavTechLogo";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <SkavTechLogo className="w-12 h-12" />
                        <span className="font-bold text-xl tracking-tighter">SKAV TECH OS</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
                        <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
                        <Link href="/dashboard">
                            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105">
                                START OS
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <HeroScene />

                <div className="relative z-10 text-center max-w-4xl px-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            The Future of <br /> Web Computing
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Experience a full Linux environment directly in your browser.
                            Secure, fast, and accessible from anywhere.
                        </p>

                        <div className="pointer-events-auto">
                            <Link href="/dashboard">
                                <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-primary px-8 font-medium text-white transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900">
                                    <span className="mr-2">Launch SKAV OS</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <span className="text-xs text-gray-500">Scroll to explore</span>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-zinc-900/50 relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">What is SKAV TECH OS?</h2>
                            <div className="space-y-4 text-gray-400">
                                <p>
                                    SKAV TECH OS is a revolutionary web-based operating system provided by SKAV TECH.
                                    It bridges the gap between local computing and cloud flexibility.
                                </p>
                                <p>
                                    Built on top of Docker and Ubuntu, it provides a persistent, secure, and fully functional
                                    desktop environment that lives in your browser. Whether you are a developer needs a quick
                                    environment or a user exploring Linux, SKAV TECH OS delivers.
                                </p>
                            </div>
                        </div>
                        <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                            <Terminal className="w-24 h-24 text-white/20 group-hover:text-primary transition-colors duration-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-black relative">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">How It Works</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Globe}
                            title="Browser Native"
                            description="No downloads required. Access your OS from Chrome, Firefox, or Safari on any device."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Secure Sandbox"
                            description="Each session works in an isolated Docker container, ensuring maximum security and privacy."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Boot"
                            description="Spin up a fresh instance in seconds. High-performance computing at your fingertips."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0 text-center md:text-left">
                            <h3 className="text-lg font-bold text-white mb-2">SKAV TECH OS</h3>
                            <p className="text-sm text-gray-500">Built by Sandeep Kasturi</p>
                            <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                Visit SKAV TECH
                            </a>
                        </div>

                        <div className="flex space-x-6">
                            <a href="https://github.com/sandeepkasturi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com/in/sandeepkasturi9" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} SKAV TECH. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
