import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin } from "lucide-react";
import ayushRaj from "@/assets/team/ayush-raj.jpg";
import abhishekSingh from "@/assets/team/abhishek-singh.jpg";
import akashSingh from "@/assets/team/akash-singh.jpg";
import adityaSharma from "@/assets/team/aditya-sharma.jpg";

const teamMembers = [
  {
    name: "Ayush Raj",
    role: "ML Engineer & Lead Developer",
    description: "Specializes in machine learning model development and ensemble techniques. Led the implementation of DistilBERT and XGBoost models for accurate fake news detection. Passionate about leveraging ML to combat misinformation.",
    image: ayushRaj,
    linkedin: "https://www.linkedin.com",
  },
  {
    name: "Abhishek Kr Singh",
    role: "Backend Developer & ML Specialist",
    description: "Expert in backend architecture and ML model integration. Developed the ensemble prediction system and optimized API performance. Focuses on building scalable solutions for real-time news verification.",
    image: abhishekSingh,
    linkedin: "https://www.linkedin.com",
  },
  {
    name: "Akash Kr Singh",
    role: "Full Stack Developer & Data Engineer",
    description: "Handles data pipeline architecture and feature engineering. Implemented TF-IDF vectorization and model training workflows. Dedicated to improving model accuracy through advanced data preprocessing techniques.",
    image: akashSingh,
    linkedin: "https://www.linkedin.com",
  },
  {
    name: "Aditya Sharma",
    role: "Frontend Developer & UX Designer",
    description: "Designs intuitive user interfaces and responsive web experiences. Built the React-based frontend with focus on accessibility and user experience. Ensures seamless interaction with ML models through elegant design.",
    image: adityaSharma,
    linkedin: "https://www.linkedin.com",
  },
];

const Team = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
              Meet Our Team
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A dedicated group of ML engineers and developers working to combat misinformation through advanced technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {teamMembers.map((member, index) => (
              <Card key={index} className="glass-card hover:scale-[1.02] transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-1 gradient-text">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {member.description}
                    </p>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <Linkedin className="w-4 h-4" />
                      Connect on LinkedIn
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Team;
