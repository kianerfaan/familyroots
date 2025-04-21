import { useState, useRef } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FamilyTreeView from "@/components/FamilyTreeView";
import PersonForm from "@/components/PersonForm";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import { Person, PersonForm as PersonFormType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { isLoading } = useFamilyTree();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth >= 768 // Default open on desktop
  );
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  
  // Reference to file input for importing
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { importFamilyTree } = useFamilyTree();
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleOpenPersonModal = (person: Person | null = null) => {
    setEditPerson(person);
    setIsModalOpen(true);
  };
  
  const handleClosePersonModal = () => {
    setEditPerson(null);
    setIsModalOpen(false);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonData = event.target?.result as string;
      if (jsonData) {
        await importFamilyTree(jsonData);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onToggleSidebar={handleToggleSidebar} 
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onAddPerson={() => handleOpenPersonModal()} 
          onEditPerson={(person) => handleOpenPersonModal(person)}
          onImport={handleImportClick}
        />

        <main className="flex-1 overflow-auto relative bg-background p-4" id="family-tree-container">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="space-y-4 w-full max-w-md">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          ) : (
            <FamilyTreeView 
              onPersonClick={(person) => handleOpenPersonModal(person)}
            />
          )}
          
          {/* Toggle sidebar button on mobile */}
          <button 
            onClick={handleToggleSidebar}
            className="md:hidden fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
        </main>

        {/* Person Modal */}
        <PersonForm 
          isOpen={isModalOpen}
          person={editPerson}
          onClose={handleClosePersonModal}
        />
        
        {/* Hidden file input for import */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileImport} 
          accept=".json" 
          className="hidden" 
        />
      </div>
    </div>
  );
}
