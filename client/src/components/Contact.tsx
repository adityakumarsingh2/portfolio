import { motion } from "framer-motion";
import {
  Mail,
  Send,
  Github,
  Linkedin,
  Terminal,
  Copy,
  Check,
  MessageSquare,
  Coffee,
  Rocket,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [copied, setCopied] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("adityakumarsingh909@outlook.com");
      setCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy email");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field as keyof typeof fieldErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const mailtoLink = `mailto:adityakumarsingh909@outlook.com?subject=Portfolio Contact from ${encodeURIComponent(
      formData.name
    )}&body=${encodeURIComponent(formData.message)}%0A%0AFrom: ${encodeURIComponent(formData.email)}`;
    window.location.href = mailtoLink;
    toast.success("Opening email client...");
  };

  const quickActions = [
    {
      icon: Coffee,
      label: "Grab a Coffee",
      message: "Hey Aditya! Would love to grab a virtual coffee and chat about potential opportunities.",
    },
    {
      icon: Rocket,
      label: "Hire Me",
      message: "Hi Aditya, I'm interested in hiring you for a project. Let's discuss the details!",
    },
    {
      icon: MessageSquare,
      label: "Just Say Hi",
      message: "Hey Aditya! Just wanted to say hi and connect with you.",
    },
  ];

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Background (static) */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <span className="font-mono text-primary text-sm tracking-wider">
              <span className="text-purple-400">{"function "}</span>
              <span className="text-blue-400">{"connect"}</span>
              <span className="text-foreground">{"() {"}</span>
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              <span className="font-mono text-green-400">{"return "}</span>
              <span className="text-gradient-warm">{"<Contact />"}</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto font-mono text-sm">
              <span className="text-green-400">{"// "}</span>
              Open to internships, freelance & exciting collaborations
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <motion.div
              className="lg:col-span-2 space-y-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="card-elegant overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono ml-2">contact.sh</span>
                </div>
                <div className="p-4 font-mono text-sm space-y-3">
                  <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={handleCopyEmail}
                  >
                    <span className="text-green-400">$</span>
                    <span className="text-muted-foreground">echo</span>
                    <span className="text-primary">$EMAIL</span>
                    <button
                      className="ml-auto p-1.5 rounded-md bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="pl-4 text-blue-400 break-all">adityakumarsingh909@outlook.com</div>

                  <div className="flex items-center gap-3">
                    <span className="text-green-400">$</span>
                    <span className="text-muted-foreground">cat</span>
                    <span className="text-primary">phone.txt</span>
                  </div>
                  <a href="tel:+917654944940" className="pl-4 text-blue-400 hover:underline block">
                    +91 7654944940
                  </a>

                  <div className="flex items-center gap-3">
                    <span className="text-green-400">$</span>
                    <span className="text-muted-foreground">pwd</span>
                  </div>
                  <div className="pl-4 text-yellow-400">/india/punjab/phagwara</div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {[
                  { icon: Github, href: "https://github.com/adityakumarsingh2", label: "GitHub", color: "hover:bg-gray-800" },
                  { icon: Linkedin, href: "https://linkedin.com/in/adityakumarsingh2", label: "LinkedIn", color: "hover:bg-blue-600" },
                  { icon: Mail, href: "mailto:adityakumarsingh909@outlook.com", label: "Email", color: "hover:bg-primary" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 p-4 rounded-xl bg-card border border-border ${social.color} hover:border-transparent hover:text-white transition-all duration-300 flex items-center justify-center gap-2`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Quick action buttons */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono">{"// Quick actions"}</p>
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setFormData({ ...formData, message: action.message })}
                    className="w-full p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 flex items-center gap-3 text-left group"
                    type="button"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <form onSubmit={handleSubmit} className="card-elegant overflow-hidden">
                <div className="bg-muted/50 px-6 py-3 flex items-center gap-2 border-b border-border">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono text-muted-foreground">new Message()</span>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-mono text-muted-foreground mb-2">
                      <span className="text-purple-400">const</span> name <span className="text-blue-400">=</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder='"Your Name"'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      maxLength={100}
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.name ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none transition-colors duration-200 font-mono text-green-400 ${focusedField === "name" ? "ring-2 ring-primary/20" : ""}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 font-mono">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-mono text-muted-foreground mb-2">
                      <span className="text-purple-400">const</span> email <span className="text-blue-400">=</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder='"your@email.com"'
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      maxLength={255}
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.email ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none transition-colors duration-200 font-mono text-green-400 ${focusedField === "email" ? "ring-2 ring-primary/20" : ""}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-mono">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-mono text-muted-foreground mb-2">
                      <span className="text-purple-400">const</span> message <span className="text-blue-400">=</span>{" "}
                      <span className="text-yellow-400">{"`"}</span>
                    </label>
                    <textarea
                      id="message"
                      placeholder="Hey Aditya, I'd like to discuss..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      maxLength={1000}
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.message ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none transition-colors duration-200 resize-none font-mono text-foreground ${focusedField === "message" ? "ring-2 ring-primary/20" : ""}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.message && <p className="text-red-500 text-xs font-mono">{errors.message}</p>}
                      <span className="text-xs text-muted-foreground font-mono ml-auto">{formData.message.length}/1000</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-3 py-4 font-mono group"
                  >
                    <span className="text-primary-foreground/70">await</span>
                    <span>sendMessage()</span>
                    <Send className="w-4 h-4" />
                  </button>

                  <p className="text-center text-xs text-muted-foreground font-mono">
                    <span className="text-green-400">{"// "}</span>
                    Response time: ~24 hours
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
