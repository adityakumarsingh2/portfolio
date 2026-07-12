import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PageLoader from "@/components/PageLoader";
import BackToTop from "@/components/BackToTop";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Chatbot, { Message } from "@/components/Chatbot";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! I'm Aditya's AI Assistant. Ask me anything about Aditya's full-stack projects, tech stack, certifications, or even his boxing achievements! 🥊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const handleScroll = () => {
      setShowFloatingChat(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  return (
    <>
      <CustomCursor />

      <AnimatePresence mode="wait">
        {isLoading && (
          <PageLoader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && <ScrollProgress />}

      <motion.main
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Navbar />
        <Hero 
          messages={messages} 
          setMessages={setMessages} 
          input={input} 
          setInput={setInput} 
        />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
        <Footer />
        <BackToTop />
        {showFloatingChat && (
          <Chatbot 
            messages={messages} 
            setMessages={setMessages} 
            input={input} 
            setInput={setInput} 
            isOpen={isChatOpen} 
            setIsOpen={setIsChatOpen} 
          />
        )}
      </motion.main>
    </>
  );
};

export default Index;

