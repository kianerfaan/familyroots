import { useFamilyTree } from "@/context/FamilyTreeContext";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { saveToLocalStorage } = useFamilyTree();
  const { toast } = useToast();
  
  const handleSave = () => {
    const success = saveToLocalStorage();
    if (success) {
      toast({
        title: "Success",
        description: "Family tree saved successfully!",
      });
    }
  };
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h1 className="text-xl font-semibold">FamilyTree</h1>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><a href="#" className="hover:text-gray-300 font-medium">Family Tree</a></li>
            <li><a href="#" className="hover:text-gray-300">Person List</a></li>
            <li><a href="#" className="hover:text-gray-300">Help</a></li>
          </ul>
        </nav>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSave}
            className="bg-white text-primary px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
          >
            Save
          </button>
          <button 
            className="md:hidden text-white"
            onClick={onToggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
