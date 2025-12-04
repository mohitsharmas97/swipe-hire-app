import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import {
  Edit, MapPin, Briefcase, Mail, Phone,
  Github, Linkedin, FileText, LogOut, Settings, Camera
} from "lucide-react";
import { skillSuggestions } from "../constant";

const API_BASE_URL = "http://localhost:8096";

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  targetRole: string;
  experienceYears: number;
  bio: string;
  skills: string[];
  preferredLocation: string;
  githubProfile: string;
  linkedinProfile: string;
  profilePictureUrl: string;
  resumeUrl: string;
  minSalary?: number;
  remoteOnly?: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<null | "profile" | "skills" | "links" | "resume" | "photo">(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  // === Fetch profile ===
  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        if (!data.skills) data.skills = [];
        setUser(data);
      } else {
        toast.error("Please log in.");
        navigate("/login");
      }
    } catch {
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfileData(); }, [navigate]);

  // === Helper: Construct robust Image URL ===
  const getFullImageUrl = (path: string | undefined) => {
    if (!path) return "";
    // If it's already a full URL (e.g. from an external provider), return it
    if (path.startsWith("http")) return path;
    
    // Construct local URL and add timestamp to prevent caching old/broken images
    return `${API_BASE_URL}${path}`; 
  };

  // === File Upload Logic ===
  const uploadFile = async (file: File, endpoint: string, fieldToUpdate: "profilePictureUrl" | "resumeUrl") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${endpoint}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        // Backend returns the string path: "/uploads/..."
        const fileUrl = await response.text();
        
        // 1. Update State IMMEDIATELY to show change in UI
        setUser((prev) => prev ? ({ ...prev, [fieldToUpdate]: fileUrl }) : null);
        
        toast.success("Upload successful!");
        setActiveModal(null);
      } else {
        toast.error("Upload failed.");
      }
    } catch (e) {
      toast.error("Server error.");
    }
  };

  // === Save Text Data ===
  const handleSave = async () => {
    if (!user) return;
    try {
      const payload = {
        ...editData,
        experienceYears: Number(editData.experienceYears),
        minSalary: Number(editData.minSalary || 0),
      };
      const response = await fetch(`${API_BASE_URL}/api/profile/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        toast.success("Profile updated!");
        setActiveModal(null);
        fetchProfileData();
      } else {
        toast.error("Failed to update.");
      }
    } catch { toast.error("Error connecting."); }
  };

  // === Sign Out ===
  const handleSignOut = async () => {
    await fetch(`${API_BASE_URL}/logout`, { method: "POST", credentials: "include" });
    navigate("/");
  };

  const openModal = (type: typeof activeModal) => {
    if (user) setEditData({ ...user });
    setActiveModal(type);
  };

  const handleSkillToggle = (skill: string) => {
    setEditData((prev) => {
      const skills = prev.skills || [];
      return { ...prev, skills: skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill] };
    });
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!user) return <div className="flex justify-center items-center min-h-screen">No Profile Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}><Settings className="h-5 w-5" /></Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => openModal("profile")}><Edit className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              
              {/* === PROFILE PICTURE === */}
              <div className="relative group cursor-pointer" onClick={() => openModal("photo")}>
                <Avatar className="w-24 h-24 border-2 border-slate-200">
                  {/* The key prop forces re-render if URL changes */}
                  <AvatarImage 
                    key={user.profilePictureUrl} 
                    src={getFullImageUrl(user.profilePictureUrl)} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-6 h-6" />
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <p className="text-slate-600">{user.targetRole}</p>
                <p className="text-sm text-slate-500 mt-2">{user.bio}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-sm text-slate-600">
                   <div className="flex items-center gap-1"><MapPin className="w-4 h-4"/>{user.preferredLocation}</div>
                   <div className="flex items-center gap-1"><Briefcase className="w-4 h-4"/>{user.experienceYears} Years</div>
                   <div className="flex items-center gap-1"><Mail className="w-4 h-4"/>{user.email}</div>
                   <div className="flex items-center gap-1"><Phone className="w-4 h-4"/>{user.phoneNumber}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SKILLS */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Skills</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => openModal("skills")}><Edit className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </CardContent>
        </Card>

        {/* RESUME DOWNLOAD SECTION */}
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Resume</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openModal("resume")}><Edit className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
                {user.resumeUrl ? (
                <div className="flex items-center gap-3 p-3 border rounded-md bg-slate-50">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm truncate flex-1">Resume Uploaded</span>
                    <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        // Open in new tab with the correct Base URL
                        window.open(getFullImageUrl(user.resumeUrl), "_blank");
                    }}
                    >
                    Download / View
                    </Button>
                </div>
                ) : <p className="text-sm text-slate-400">No resume uploaded.</p>}
            </CardContent>
        </Card>

        {/* LINKS */}
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Links</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openModal("links")}><Edit className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
                 <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(user.githubProfile, "_blank")} disabled={!user.githubProfile}>
                    <Github className="w-4 h-4"/> GitHub
                 </Button>
                 <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(user.linkedinProfile, "_blank")} disabled={!user.linkedinProfile}>
                    <Linkedin className="w-4 h-4"/> LinkedIn
                 </Button>
            </CardContent>
        </Card>
        
        <Button variant="destructive" className="w-full" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2"/>Sign Out</Button>
      </main>

      {/* MODALS */}
      <Dialog open={activeModal === "profile"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent><DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
             <Input placeholder="Full Name" value={editData.fullName||""} onChange={e=>setEditData({...editData, fullName:e.target.value})}/>
             <Input placeholder="Role" value={editData.targetRole||""} onChange={e=>setEditData({...editData, targetRole:e.target.value})}/>
             <Textarea placeholder="Bio" value={editData.bio||""} onChange={e=>setEditData({...editData, bio:e.target.value})}/>
             <Input placeholder="Phone" value={editData.phoneNumber||""} onChange={e=>setEditData({...editData, phoneNumber:e.target.value})}/>
             <Input placeholder="Location" value={editData.preferredLocation||""} onChange={e=>setEditData({...editData, preferredLocation:e.target.value})}/>
             <div className="flex gap-2">
                <Input type="number" placeholder="Exp (Years)" value={editData.experienceYears||0} onChange={e=>setEditData({...editData, experienceYears:Number(e.target.value)})}/>
                <Input type="number" placeholder="Min Salary" value={editData.minSalary||0} onChange={e=>setEditData({...editData, minSalary:Number(e.target.value)})}/>
             </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "skills"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
           <DialogHeader><DialogTitle>Skills</DialogTitle></DialogHeader>
           <div className="flex flex-wrap gap-2 py-4">{skillSuggestions.map(s=><Badge key={s} variant={editData.skills?.includes(s)?"default":"outline"} onClick={()=>handleSkillToggle(s)} className="cursor-pointer">{s}</Badge>)}</div>
           <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "links"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
            <DialogHeader><DialogTitle>Links</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <Input placeholder="GitHub" value={editData.githubProfile||""} onChange={e=>setEditData({...editData, githubProfile:e.target.value})}/>
                <Input placeholder="LinkedIn" value={editData.linkedinProfile||""} onChange={e=>setEditData({...editData, linkedinProfile:e.target.value})}/>
            </div>
            <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "resume"} onOpenChange={() => setActiveModal(null)}>
         <DialogContent><DialogHeader><DialogTitle>Upload Resume</DialogTitle></DialogHeader>
             <Input type="file" accept=".pdf,.docx" onChange={e=>{if(e.target.files?.[0]) uploadFile(e.target.files[0], "upload-resume", "resumeUrl")}}/>
         </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "photo"} onOpenChange={() => setActiveModal(null)}>
         <DialogContent><DialogHeader><DialogTitle>Update Photo</DialogTitle></DialogHeader>
             <Input type="file" accept="image/*" onChange={e=>{if(e.target.files?.[0]) uploadFile(e.target.files[0], "upload-photo", "profilePictureUrl")}}/>
         </DialogContent>
      </Dialog>

    </div>
  );
};

export default Profile;