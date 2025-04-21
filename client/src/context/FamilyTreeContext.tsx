import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { Person, Relationship, FamilyTreeData, InsertPerson, InsertRelationship } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { buildFamilyTree, flattenTreeForExport, parseImportedTreeData } from "@/lib/treeUtils";
import { useToast } from "@/hooks/use-toast";

interface FamilyTreeContextType {
  data: FamilyTreeData;
  selectedPersonId: number | null;
  isLoading: boolean;
  setSelectedPersonId: (id: number | null) => void;
  addPerson: (person: InsertPerson) => Promise<Person | undefined>;
  updatePerson: (id: number, person: InsertPerson) => Promise<Person | undefined>;
  deletePerson: (id: number) => Promise<boolean>;
  addRelationship: (relationship: InsertRelationship) => Promise<Relationship | undefined>;
  deleteRelationship: (id: number) => Promise<boolean>;
  exportFamilyTree: () => void;
  importFamilyTree: (jsonData: string) => Promise<boolean>;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

const FamilyTreeContext = createContext<FamilyTreeContextType | undefined>(undefined);

interface FamilyTreeProviderProps {
  children: ReactNode;
}

export function FamilyTreeProvider({ children }: FamilyTreeProviderProps) {
  const [data, setData] = useState<FamilyTreeData>({ persons: [], relationships: [] });
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to load from localStorage first
        if (loadFromLocalStorage()) {
          setIsLoading(false);
          return;
        }
        
        // If no local data, fetch from API
        const response = await fetch('/api/familytree');
        if (!response.ok) {
          throw new Error('Failed to fetch family tree data');
        }
        
        const familyTreeData = await response.json();
        setData(familyTreeData);
      } catch (error) {
        console.error('Error fetching family tree data:', error);
        toast({
          title: "Error",
          description: "Failed to load family tree data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addPerson = async (person: InsertPerson): Promise<Person | undefined> => {
    try {
      const response = await apiRequest('POST', '/api/persons', person);
      const newPerson: Person = await response.json();
      
      setData(prev => ({
        ...prev,
        persons: [...prev.persons, newPerson]
      }));
      
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      return newPerson;
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person.",
        variant: "destructive"
      });
      return undefined;
    }
  };

  const updatePerson = async (id: number, person: InsertPerson): Promise<Person | undefined> => {
    try {
      const response = await apiRequest('PUT', `/api/persons/${id}`, person);
      const updatedPerson: Person = await response.json();
      
      setData(prev => ({
        ...prev,
        persons: prev.persons.map(p => p.id === id ? updatedPerson : p)
      }));
      
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      return updatedPerson;
    } catch (error) {
      console.error('Error updating person:', error);
      toast({
        title: "Error",
        description: "Failed to update person.",
        variant: "destructive"
      });
      return undefined;
    }
  };

  const deletePerson = async (id: number): Promise<boolean> => {
    try {
      await apiRequest('DELETE', `/api/persons/${id}`);
      
      setData(prev => ({
        ...prev,
        persons: prev.persons.filter(p => p.id !== id),
        relationships: prev.relationships.filter(
          r => r.personId !== id && r.relatedPersonId !== id
        )
      }));
      
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      return true;
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: "Error",
        description: "Failed to delete person.",
        variant: "destructive"
      });
      return false;
    }
  };

  const addRelationship = async (relationship: InsertRelationship): Promise<Relationship | undefined> => {
    try {
      const response = await apiRequest('POST', '/api/relationships', relationship);
      const newRelationship: Relationship = await response.json();
      
      // Note: The server creates reciprocal relationships, so we'll reload the data
      const familyTreeResponse = await fetch('/api/familytree');
      const familyTreeData = await familyTreeResponse.json();
      setData(familyTreeData);
      
      queryClient.invalidateQueries({ queryKey: ['/api/relationships'] });
      return newRelationship;
    } catch (error) {
      console.error('Error adding relationship:', error);
      toast({
        title: "Error",
        description: "Failed to add relationship.",
        variant: "destructive"
      });
      return undefined;
    }
  };

  const deleteRelationship = async (id: number): Promise<boolean> => {
    try {
      await apiRequest('DELETE', `/api/relationships/${id}`);
      
      // Reload the data as the server also deletes reciprocal relationships
      const familyTreeResponse = await fetch('/api/familytree');
      const familyTreeData = await familyTreeResponse.json();
      setData(familyTreeData);
      
      queryClient.invalidateQueries({ queryKey: ['/api/relationships'] });
      return true;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      toast({
        title: "Error",
        description: "Failed to delete relationship.",
        variant: "destructive"
      });
      return false;
    }
  };

  const exportFamilyTree = () => {
    try {
      const jsonStr = flattenTreeForExport(data);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'family-tree.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Family tree exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting family tree:', error);
      toast({
        title: "Error",
        description: "Failed to export family tree.",
        variant: "destructive"
      });
    }
  };

  const importFamilyTree = async (jsonData: string): Promise<boolean> => {
    try {
      const parsedData = parseImportedTreeData(jsonData);
      if (!parsedData) {
        throw new Error('Invalid data format');
      }
      
      // Reset existing data and replace with imported data
      // In a real app, we'd have more sophisticated merge logic
      
      // First delete all existing data
      setIsLoading(true);
      
      // Add the imported data
      for (const person of parsedData.persons) {
        const { id, ...personData } = person;
        await addPerson(personData);
      }
      
      // Add relationships after all persons are added
      for (const relationship of parsedData.relationships) {
        const { id, ...relationshipData } = relationship;
        await addRelationship(relationshipData);
      }
      
      // Reload data
      const response = await fetch('/api/familytree');
      const familyTreeData = await response.json();
      setData(familyTreeData);
      
      toast({
        title: "Success",
        description: "Family tree imported successfully.",
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error importing family tree:', error);
      toast({
        title: "Error",
        description: "Failed to import family tree. Please check the file format.",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('familyTreeData', JSON.stringify(data));
      toast({
        title: "Success",
        description: "Family tree saved to local storage.",
      });
      return true;
    } catch (error) {
      console.error('Error saving to local storage:', error);
      toast({
        title: "Error",
        description: "Failed to save to local storage.",
        variant: "destructive"
      });
      return false;
    }
  };

  const loadFromLocalStorage = (): boolean => {
    try {
      const savedData = localStorage.getItem('familyTreeData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading from local storage:', error);
      toast({
        title: "Error",
        description: "Failed to load from local storage.",
        variant: "destructive"
      });
      return false;
    }
  };

  const value = {
    data,
    selectedPersonId,
    isLoading,
    setSelectedPersonId,
    addPerson,
    updatePerson,
    deletePerson,
    addRelationship,
    deleteRelationship,
    exportFamilyTree,
    importFamilyTree,
    saveToLocalStorage,
    loadFromLocalStorage
  };

  return (
    <FamilyTreeContext.Provider value={value}>
      {children}
    </FamilyTreeContext.Provider>
  );
}

export function useFamilyTree() {
  const context = useContext(FamilyTreeContext);
  if (context === undefined) {
    throw new Error('useFamilyTree must be used within a FamilyTreeProvider');
  }
  return context;
}
