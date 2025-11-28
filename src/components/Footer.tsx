import { Shield, Github, Linkedin, Mail, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const teamMembers = [
    { name: "Ayush Raj", github: "https://github.com" },
    { name: "Abhishek Kr Singh", github: "https://github.com" },
    { name: "Akash Kr Singh", github: "https://github.com" },
    { name: "Aditya Sharma", github: "https://github.com" },
  ];

  return (
    <footer className="border-t border-border/50 backdrop-blur-md bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">Truth Guard</h3>
                <p className="text-xs text-muted-foreground">ML-Powered News Prediction</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Combating misinformation through advanced machine learning models. 
              Our ensemble approach combines DistilBERT, XGBoost, and TF-IDF for accurate fake news detection.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <NavLink to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </NavLink>
              </li>
              <li>
                <NavLink to="/faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQs
                </NavLink>
              </li>
              <li>
                <NavLink to="/sample-datasets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sample Datasets
                </NavLink>
              </li>
              <li>
                <NavLink to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Team
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                  <Github className="w-3 h-3" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="mailto:contact@truthguard.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Team GitHub Links */}
        <div className="border-t border-border/50 pt-8 mb-8">
          <h4 className="font-semibold mb-4 text-foreground text-center">Our Team on GitHub</h4>
          <div className="flex flex-wrap justify-center gap-4">
            {teamMembers.map((member, index) => (
              <a
                key={index}
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card hover:bg-muted/50 transition-colors"
              >
                <Github className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{member.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/50 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Truth Guard. All rights reserved. Built with ML & React.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
