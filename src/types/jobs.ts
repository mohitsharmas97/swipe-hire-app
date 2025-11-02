export interface Job {
    id: string;
    title: string;
    company: string;
    companyLogo?: string;
    rating: number;
    location: string;
    jobType: string;
    salary?: {
        amount: number;
        currency: string;
        unit: "month" | "year" | "hour";
    };
    postedAgo: string;
    benefits: string[];
    qualifications: string[];
    fullDescription: {
        category: string;       
        stipend: string;        
        duration: string;       
        workMode: string;       
        description: string[];  
        requirements: string[]; 
    };
    applyUrl: string;
}
