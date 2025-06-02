import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MagicButton } from "@/components/ui/magic-button";
import {
  Dumbbell,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Brain,
  Award,
  Target,
  TrendingUp,
} from "lucide-react";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { BlurFade } from "@/components/magicui/blur-fade";
import { HyperText } from "@/components/magicui/hyper-text";
import { Meteors } from "@/components/magicui/meteors";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none"></div>
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>
      <div className="fixed top-20 left-0 right-0 -z-10  w-full bg-[radial-gradient(circle_500px_at_50%_200px,rgba(var(--primary-rgb),0.1),transparent)] pointer-events-none"></div>

      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Header */}
      <header className="fixed top-0 w-full bg-background/60 backdrop-blur-xl z-50 border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="font-bold text-2xl tracking-tight flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-300 transition-all duration-300 hover:scale-105 hover:from-purple-400 hover:to-primary"
          >
            <span className="relative">
              <Dumbbell className="h-6 w-6 text-primary transition-all duration-300 group-hover:rotate-12" />
            </span>
            <span>FitHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-foreground/80 hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Features
            </Link>
            <Link
              href="#ai-section"
              className="text-foreground/80 hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              AI Power
            </Link>
            <Link
              href="#benefits"
              className="text-foreground/80 hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Benefits
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                className="transition-all duration-300 hover:text-primary hover:bg-primary/10 relative overflow-hidden group"
              >
                <span className="relative z-10">Log In</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:translate-x-full transform"></span>
              </Button>
            </Link>
            <Link href="/register">
              <MagicButton
                sparkle
                hoverScale
                glowColor="rgba(var(--primary-rgb), 0.7)"
              >
                Sign Up
              </MagicButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-16 md:pt-44 md:pb-28 container px-4 mx-auto relative">
        <div className="fixed top-18 left-0 right-0 -z-10 blur-3xl opacity-30 bg-gradient-to-r from-primary/40 via-purple-500/40 to-primary/40 h-96 transform -rotate-12"></div>
        <Meteors number={15} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <BlurFade direction="up" delay={0} startOnView inView>
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>AI-Powered Fitness Companion</span>
              </div>
            </BlurFade>

            <BlurFade direction="up" delay={0.1} startOnView inView>
              <div className="flex flex-col">
                <HyperText
                  startOnView
                  delay={300}
                  className="text-4xl md:text-6xl font-bold tracking-tight leading-none"
                  duration={1000}
                >
                  YOUR ULTIMATE
                </HyperText>
                <HyperText
                  startOnView
                  delay={600}
                  className="text-4xl md:text-6xl font-bold tracking-tight leading-none"
                  duration={1000}
                >
                  FITNESS
                </HyperText>
                <HyperText
                  startOnView
                  delay={900}
                  className="text-4xl md:text-6xl font-bold tracking-tight leading-none"
                  duration={1000}
                >
                  COMPANION
                </HyperText>
              </div>
              <h2 className="text-2xl md:text-3xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                Powered by AI technology
              </h2>
            </BlurFade>

            <BlurFade direction="up" delay={0.3} startOnView inView>
              <p className="text-xl text-muted-foreground">
                Book gyms, track workouts, and connect with fitness enthusiasts
                all in one place. Powered by AI to optimize your fitness
                journey.
              </p>
            </BlurFade>

            <BlurFade direction="up" delay={0.4} startOnView inView>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <MagicButton
                    size="lg"
                    className="w-full sm:w-auto relative group overflow-hidden"
                    sparkle
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </MagicButton>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto group transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Explore Features
                      <ChevronRight className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary/40 to-purple-400/40 transition-all duration-300 group-hover:w-full"></span>
                  </Button>
                </Link>
              </div>
            </BlurFade>
          </div>
          <BlurFade direction="left" delay={0.5} startOnView inView>
            <div className="bg-gradient-to-br from-primary/20 to-purple-400/20 p-1 rounded-xl transition-all duration-300 hover:from-primary/30 hover:to-purple-400/30 hover:shadow-xl hover:shadow-primary/10 relative">
              <div className="relative overflow-hidden rounded-lg h-96 w-full bg-background/70 backdrop-blur-sm group">
                <Image
                  src="/images/dash.png"
                  alt="FitHub Dashboard"
                  fill
                  className="object-cover p-1 rounded-xl object-center transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <Meteors number={10} className="opacity-70" />
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 relative">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <BlurFade direction="up" delay={0} startOnView inView>
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Powerful Tools</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need For Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Fitness Journey
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                FitHub combines powerful features to make your fitness
                experience seamless and effective.
              </p>
            </div>
          </BlurFade>

          <BentoGrid className="auto-rows-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <BlurFade delay={0} direction="up" startOnView inView>
              <BentoCard
                name="Gym Booking"
                className="md:row-span-1 col-span-1"
                Icon={Calendar}
                description="Easily book your favorite gyms and fitness classes in advance"
                cta="Schedule your next workout session with just a few clicks"
                href="#"
                background={
                  <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-primary/5 to-purple-400/5 p-1">
                    <div className="absolute inset-0 rounded-xl" />
                  </div>
                }
              />
            </BlurFade>

            <BlurFade delay={0.1} direction="up" startOnView inView>
              <BentoCard
                name="Workout Tracking"
                className="md:row-span-1 col-span-1"
                Icon={Dumbbell}
                description="Log your workouts and track your progress over time with detailed analytics"
                cta="Monitor your performance with comprehensive progress tracking"
                href="#"
                background={
                  <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-primary/5 to-purple-400/5 p-1">
                    <div className="absolute inset-0 rounded-xl" />
                  </div>
                }
              />
            </BlurFade>

            <BlurFade delay={0.2} direction="up" startOnView inView>
              <BentoCard
                name="AI Trainer"
                className="md:row-span-1 col-span-1"
                Icon={Brain}
                description="Get personalized workout plans and exercise suggestions powered by AI"
                cta="Experience the future of fitness training"
                href="#"
                background={
                  <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-primary/5 to-purple-400/5 p-1">
                    <div className="absolute inset-0 rounded-xl" />
                  </div>
                }
              />
            </BlurFade>

            <BlurFade delay={0.3} direction="up" startOnView inView>
              <BentoCard
                name="Community"
                className="md:row-span-1 col-span-1"
                Icon={Users}
                description="Connect with other fitness enthusiasts and share your journey"
                cta="Join a supportive fitness community"
                href="#"
                background={
                  <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-primary/5 to-purple-400/5 p-1">
                    <div className="absolute inset-0 rounded-xl" />
                  </div>
                }
              />
            </BlurFade>

            <BlurFade delay={0.4} direction="up" startOnView inView>
              <BentoCard
                name="Progress Tracking"
                className="md:row-span-1 col-span-1"
                Icon={TrendingUp}
                description="Track your fitness progress with detailed analytics and insights"
                cta="Monitor your journey to success"
                href="#"
                background={
                  <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-primary/5 to-purple-400/5 p-1">
                    <div className="absolute inset-0 rounded-xl" />
                  </div>
                }
              />
            </BlurFade>

            <BlurFade delay={0.5} direction="up" startOnView inView>
              <BentoCard
                name="Exercise Library"
                className="md:row-span-1 col-span-1"
                Icon={Target}
                description="Access a comprehensive library of exercises with proper form guides"
                cta="Explore hundreds of exercises with detailed instructions"
                href="#"
                background={
                  <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-primary/5 to-purple-400/5 p-1">
                    <div className="absolute inset-0 rounded-xl" />
                  </div>
                }
              />
            </BlurFade>
          </BentoGrid>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai-section" className="py-16 relative">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <BlurFade direction="up" delay={0} startOnView inView>
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
                <Brain className="h-4 w-4 mr-2" />
                <span>AI-Powered Features</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Experience the Future of{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Fitness Training
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our AI technology provides personalized workout plans and
                intelligent exercise suggestions.
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlurFade delay={0.1} direction="up" startOnView inView>
              <div className="bg-primary/5 p-6 rounded-xl">
                <Brain className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Smart Workout Plans
                </h3>
                <p className="text-muted-foreground">
                  Get personalized workout plans based on your fitness level and
                  goals.
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} direction="up" startOnView inView>
              <div className="bg-primary/5 p-6 rounded-xl">
                <Target className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Progress Analysis
                </h3>
                <p className="text-muted-foreground">
                  AI-powered insights help you track and optimize your fitness
                  journey.
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.3} direction="up" startOnView inView>
              <div className="bg-primary/5 p-6 rounded-xl">
                <Award className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Achievement Tracking
                </h3>
                <p className="text-muted-foreground">
                  Celebrate your milestones with personalized achievements and
                  rewards.
                </p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 relative">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <BlurFade direction="up" delay={0} startOnView inView>
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Why Choose FitHub</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Perfect{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Fitness Solution
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of fitness enthusiasts who trust FitHub for their
                fitness journey.
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BlurFade delay={0.1} direction="up" startOnView inView>
              <div className="bg-primary/5 p-6 rounded-xl">
                <Clock className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Time Saving</h3>
                <p className="text-muted-foreground">
                  Streamline your fitness routine with efficient booking and
                  tracking.
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} direction="up" startOnView inView>
              <div className="bg-primary/5 p-6 rounded-xl">
                <Users className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Community Support
                </h3>
                <p className="text-muted-foreground">
                  Connect with like-minded individuals and share your journey.
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.3} direction="up" startOnView inView>
              <div className="bg-primary/5 p-6 rounded-xl">
                <Brain className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Guidance</h3>
                <p className="text-muted-foreground">
                  Get personalized recommendations and insights powered by AI.
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.4} direction="up" startOnView inView>
              <div className="bg-primary/5 p-6 rounded-xl">
                <TrendingUp className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
                <p className="text-muted-foreground">
                  Track your progress and achieve your fitness goals
                  effectively.
                </p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <BlurFade direction="up" delay={0} startOnView inView>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                  Fitness Journey
                </span>
                ?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join FitHub today and experience the future of fitness training.
              </p>
              <Link href="/register">
                <MagicButton
                  size="lg"
                  className="relative group overflow-hidden"
                  sparkle
                >
                  <span className="relative z-10 flex items-center">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </MagicButton>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border/30 relative">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link
                href="/"
                className="font-bold text-2xl flex items-center gap-2 group"
              >
                <Dumbbell className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-300">
                  FitHub
                </span>
              </Link>
              <p className="text-muted-foreground mt-2">
                Your ultimate fitness companion
              </p>
            </div>
            <div className="flex gap-8 flex-wrap justify-center">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                Features
              </Link>
              <Link
                href="#ai-section"
                className="text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                AI Power
              </Link>
              <Link
                href="#benefit"
                className="text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                Benefit
              </Link>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
            © {new Date().getFullYear()} FitHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
