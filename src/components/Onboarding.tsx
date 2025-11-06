import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { skillSuggestions } from "@/constant";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  MapPin,
  Briefcase,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

const fadeSlide = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // States
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState([2]);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState([5]);
  const [resumeFile, setResumeFile] = useState<string>("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);

  // Skill pagination
  const [visibleCount, setVisibleCount] = useState(10);
  const visibleSkills = skillSuggestions.slice(0, visibleCount);
  const hasMore = visibleCount < skillSuggestions.length;

  const progress = (step / totalSteps) * 100;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  // --- 1. Upload Photo ---
  const handlePhotoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }
    setProfilePhoto(URL.createObjectURL(file)); // Preview

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8096/api/profile/upload-photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Photo uploaded successfully!");
      } else {
        toast.error(`Photo upload failed (status ${res.status})`);
        setProfilePhoto("");
      }
    } catch (err) {
      toast.error("Server error while uploading photo");
      setProfilePhoto("");
    }
  };

  // --- 2. Upload Resume ---
  const handleResumeUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files allowed");
      return;
    }
    setResumeFile(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8096/api/profile/upload-resume", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error(`Resume upload failed (status ${res.status})`);
        setResumeFile("");
      }
    } catch (err) {
      toast.error("Server error while uploading resume");
      setResumeFile("");
    }
  };

  // --- 3. Complete Onboarding ---
  const handleComplete = async () => {
    setLoading(true);

    const profileData = {
      fullName: name,
      targetRole: role,
      experienceYears: experience[0],
      bio,
      skills: selectedSkills,
      remoteOnly,
      preferredLocation: location,
      minSalary: salaryMin[0],
      githubProfile: github,
      linkedinProfile: linkedin,
    };

    try {
      const res = await fetch("http://localhost:8096/api/profile/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Profile setup complete!");
        navigate("/feed");
      } else {
        toast.error(`Failed to save profile (status ${res.status})`);
      }
    } catch (err) {
      toast.error("Server error while saving profile");
    } finally {
      setLoading(false);
    }
  };

  // --- Navigation ---
  const handleNext = () => {
    if (step === 1 && (!name || !role)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (step === 2 && !profilePhoto) {
      toast.error("Please upload a profile photo");
      return;
    }
    if (step === 2 && bio.trim().length < 10) {
      toast.error("Bio should be at least 10 characters");
      return;
    }
    if (step === 3 && selectedSkills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }
    if (step < totalSteps) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => step > 1 && setStep(step - 1);

  const handleSkip = () => navigate("/feed");

  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Profile Setup</span>
            <span className="text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:py-12">
        <div className="w-full max-w-md glass-strong rounded-2xl p-6 sm:p-8 shadow-lg border border-border overflow-hidden relative">
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-1">
                    Let’s get to know you
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Tell us about your background
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Current / Target Role</Label>
                    <Input
                      id="role"
                      placeholder="Full Stack Developer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label>Experience: {experience[0]} years</Label>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={experience}
                      onValueChange={setExperience}
                      className="mt-4"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-1">
                    Add Photo & Bio
                  </h3>
                </div>

                <div
                  className="mt-2 glass p-8 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer text-center"
                  onClick={() =>
                    document.getElementById("photo")?.click()
                  }
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-24 h-24 rounded-full mx-auto object-cover mb-3 border border-border"
                    />
                  ) : (
                    <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground mb-2">
                    Tap to upload photo
                  </p>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Short Bio</Label>
                  <textarea
                    id="bio"
                    placeholder="Write a short bio..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-24"
                  />
                </div>
              </motion.div>
            )}

          
            {/* Step 3: Skills */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-1">Your Skills</h3>
                  <p className="text-muted-foreground text-sm">
                    Pick what defines your strengths
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {visibleSkills.map((skill) => (
                    <motion.div
                      key={skill}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Badge
                        variant={
                          selectedSkills.includes(skill)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer text-sm py-2 px-4"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setVisibleCount(hasMore ? visibleCount + 10 : 10)
                    }
                    className="rounded-full"
                  >
                    {hasMore ? "Show More" : "Show Less"}
                  </Button>
                </div>

                {selectedSkills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 glass rounded-xl text-center"
                  >
                    <p className="text-xs text-muted-foreground mb-2">
                      Selected skills
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          className="gradient-primary text-white"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 4: Job Preferences */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-1">Job Preferences</h3>
                  <p className="text-muted-foreground text-sm">
                    Let us match you to ideal roles
                  </p>
                </div>

                <div className="glass p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Remote Only</Label>
                    <p className="text-xs text-muted-foreground">
                      Show only remote roles
                    </p>
                  </div>
                  <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
                </div>

                <div>
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Bengaluru, Mumbai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-2 text-sm"
                  />
                </div>

                <div>
                  <Label>Minimum Salary: ₹{salaryMin[0]} LPA</Label>
                  <Slider
                    min={3}
                    max={100}
                    step={1}
                    value={salaryMin}
                    onValueChange={setSalaryMin}
                    className="mt-4"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 5: Resume */}
            {step === 5 && (
              <motion.div
                key="step5"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-1">Resume & Links</h3>
                  <p className="text-muted-foreground text-sm">
                    Optional, but recommended
                  </p>
                </div>

                <div
                  className="mt-2 glass p-8 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer text-center transition-smooth"
                  onClick={() =>
                    document.getElementById("resume")?.click()
                  }
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Tap to upload PDF
                  </p>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setResumeFile(file.name);
                        toast.success("Resume uploaded!");
                      }
                    }}
                  />
                  {resumeFile && (
                    <Badge variant="secondary" className="mt-3">
                      {resumeFile}
                    </Badge>
                  )}
                </div>

                <div>
                  <Label htmlFor="github">GitHub Profile</Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/username"
                    className="mt-2 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    className="mt-2 text-sm"
                  />
                </div>

                <div className="p-5 rounded-xl gradient-card border border-primary/20 text-sm space-y-1">
                  <p className="font-medium text-primary mb-2">Profile Preview</p>
                  <p><strong>Name:</strong> {name || "Not set"}</p>
                  <p><strong>Role:</strong> {role || "Not set"}</p>
                  <p><strong>Experience:</strong> {experience[0]} years</p>
                  <p><strong>Bio:</strong> {bio || "No bio yet"}</p>
                  <p><strong>Skills:</strong> {selectedSkills.join(", ") || "None"}</p>
                  <p><strong>Location:</strong> {location || "Any"}</p>
                  <p><strong>Min Salary:</strong> ₹{salaryMin[0]} LPA</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={step === 1 ? handleSkip : handleBack}
              className="gap-2"
            >
              {step === 1 ? "Skip for now" : (
                <>
                  <ChevronLeft className="w-4 h-4" /> Back
                </>
              )}
            </Button>
            <Button onClick={handleNext} className="gap-2" disabled={loading}>
              {loading ? "Saving..." : step === totalSteps ? "Complete" : (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
