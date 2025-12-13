import { useScrollAnimation } from "@/hooks/useScrollAnimation"

export function GetStartedSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 })

    return (
        <section className="py-20 bg-white">
            <div
                ref={ref as React.RefObject<HTMLDivElement>}
                className={`max-w-7xl mx-auto px-6 w-full transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="relative bg-gray-950 rounded-xl p-12 text-center text-white overflow-hidden mb-24">
                    {/* Subtle gradient decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                    <h3 className="text-4xl font-bold mb-6">Ready to get started?</h3>
                    <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
                        Join leading platforms earning passive income on idle user balances
                    </p>
                    <div className="flex items-center justify-center">
                        <a
                            href="/register"
                            className="bg-gray-900 text-white px-10 py-5 rounded-lg hover:bg-gray-800 shadow-sm hover:shadow-md transition-all font-medium text-xl"
                        >
                            Start Building
                        </a>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-bold text-gray-950 mb-6">
                        Share Your Feedback
                    </h2>
                    <p className="text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Help us build the right solution for your business. Your input shapes our product roadmap.
                    </p>
                    <a
                        href="https://tally.so/r/0QdMAQ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-gray-50 text-gray-900 border border-gray-200 px-10 py-5 rounded-lg hover:bg-gray-100 transition-all font-medium text-xl shadow-sm hover:shadow-md"
                    >
                        Take Survey
                    </a>
                </div>
            </div>
        </section>
    )
}
