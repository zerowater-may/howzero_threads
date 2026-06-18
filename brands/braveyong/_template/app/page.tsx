"use client"

import Image from "next/image"
import { ExternalLink, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const isDark = theme === "dark"

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-4 transition-colors duration-500 sm:p-6 ${
        isDark ? "bg-black" : "bg-white"
      }`}
    >
      <button
        onClick={toggleTheme}
        className={`fixed right-4 top-4 rounded-full border-2 p-2.5 transition-all duration-300 hover:scale-110 sm:right-6 sm:top-6 sm:p-3 ${
          isDark
            ? "border-white bg-black text-white hover:bg-white hover:text-black"
            : "border-black bg-white text-black hover:bg-black hover:text-white"
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>

      <div className="w-full max-w-2xl">
        <div className="space-y-6 text-center sm:space-y-8">
          <div
            className={`mx-auto h-40 w-40 overflow-hidden rounded-full border-2 transition-colors duration-500 sm:h-48 sm:w-48 md:h-64 md:w-64 ${
              isDark ? "border-white" : "border-black"
            }`}
          >
            <Image
              src="/profile.jpg"
              alt="Profile"
              width={256}
              height={256}
              className="h-full w-full object-cover grayscale"
              priority
            />
          </div>

          <div className="space-y-2">
            <h1
              className={`text-3xl font-bold uppercase leading-tight tracking-tight transition-colors duration-500 sm:text-4xl md:text-5xl lg:text-6xl ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              JESSIN SAM S
            </h1>
            <p
              className={`text-sm uppercase tracking-wide transition-colors duration-500 sm:text-base md:text-lg ${
                isDark ? "text-white/60" : "text-black/60"
              }`}
            >
              FOUNDER & CREATOR
            </p>
          </div>

          <p
            className={`mx-auto max-w-xl px-2 text-base leading-relaxed transition-colors duration-500 sm:px-0 md:text-lg ${
              isDark ? "text-white/80" : "text-black/80"
            }`}
          >
            Passionate about AI innovation and creative technology. With a background in computer vision and design, I'm
            committed to building tools that bridge the gap between imagination and creation.
          </p>

          <div
            className={`space-y-4 border-t pt-6 transition-colors duration-500 sm:pt-8 ${
              isDark ? "border-white/10" : "border-black/10"
            }`}
          >
            <h2
              className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 sm:text-sm ${
                isDark ? "text-white/60" : "text-black/60"
              }`}
            >
              FOUNDER OF
            </h2>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="https://www.studdio.app"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 sm:px-6 sm:py-3 sm:text-base ${
                  isDark
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                STUDDIO APP
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a
                href="https://www.1ui.dev"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 sm:px-6 sm:py-3 sm:text-base ${
                  isDark
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                1UI.DEV
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>

          <div
            className={`flex flex-col items-center gap-3 border-t pt-6 transition-colors duration-500 sm:flex-row sm:justify-center sm:gap-4 sm:pt-8 ${
              isDark ? "border-white/10" : "border-black/10"
            }`}
          >
            <a
              href="https://x.com/jessinvibe"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-base font-medium uppercase tracking-wide underline decoration-2 underline-offset-4 transition-all duration-300 sm:text-lg ${
                isDark ? "text-white hover:text-white/60" : "text-black hover:text-black/60"
              }`}
            >
              X / TWITTER
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <span
              className={`hidden transition-colors duration-500 sm:inline ${isDark ? "text-white/20" : "text-black/20"}`}
            >
              •
            </span>
            <a
              href="https://jessinsam.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-base font-medium uppercase tracking-wide underline decoration-2 underline-offset-4 transition-all duration-300 sm:text-lg ${
                isDark ? "text-white hover:text-white/60" : "text-black hover:text-black/60"
              }`}
            >
              PORTFOLIO
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
