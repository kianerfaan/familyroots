import { useState } from "react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import { formatDate } from "@/lib/treeUtils";
import { Person } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SidebarProps {
  isOpen: boolean;
  onAddPerson: () => void;
  onEditPerson: (person: Person) => void;
  onImport: () => void;
}

export default function Sidebar({ isOpen, onAddPerson, onEditPerson, onImport }: SidebarProps) {
  const { data, selectedPersonId, setSelectedPersonId, exportFamilyTree } = useFamilyTree();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPersons = data.persons.filter(person => 
    person.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handlePersonClick = (person: Person) => {
    setSelectedPersonId(person.id);
    onEditPerson(person);
  };
  
  return (
    <aside 
      className={`w-80 bg-white shadow-md flex-shrink-0 border-r border-gray-200 overflow-y-auto transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static absolute z-10 h-full`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-primary">Family Members</h2>
          <Button 
            onClick={onAddPerson}
            size="sm"
            className="bg-primary text-white p-1 rounded hover:bg-primary-dark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
        
        {/* Search box */}
        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Family members list */}
        <div className="space-y-3">
          {filteredPersons.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No family members found
            </div>
          ) : (
            filteredPersons.map(person => (
              <div 
                key={person.id}
                className={`p-3 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 cursor-pointer border-l-4 ${
                  selectedPersonId === person.id ? 'border-primary' : 'border-transparent'
                } flex items-center justify-between`}
                onClick={() => handlePersonClick(person)}
              >
                <div>
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(person.birthDate)}
                  </div>
                </div>
                <button 
                  className="text-gray-500 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPerson(person);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Import/Export section */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-md font-medium mb-2">Import/Export</h3>
          <div className="flex space-x-2">
            <Button 
              onClick={onImport}
              variant="outline"
              className="flex-1 bg-gray-100 text-accent py-2 text-sm rounded hover:bg-gray-200"
            >
              Import
            </Button>
            <Button 
              onClick={exportFamilyTree}
              variant="outline"
              className="flex-1 bg-gray-100 text-accent py-2 text-sm rounded hover:bg-gray-200"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
