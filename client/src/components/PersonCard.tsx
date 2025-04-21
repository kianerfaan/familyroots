import { FamilyTreePerson } from "@shared/schema";
import { getGenderClass, formatDate } from "@/lib/treeUtils";

interface PersonCardProps {
  person: FamilyTreePerson;
  onClick: () => void;
}

export default function PersonCard({ person, onClick }: PersonCardProps) {
  const genderClass = getGenderClass(person.gender);
  
  // Determine relationship label
  const getRelationshipLabel = () => {
    if (!person.gender) return "Person";
    
    if (person.gender.toLowerCase() === 'male') {
      if (person.children && person.children.length > 0) {
        return "Father";
      }
      if (person.parents && person.parents.length > 0) {
        return "Son";
      }
      return "Male";
    } else if (person.gender.toLowerCase() === 'female') {
      if (person.children && person.children.length > 0) {
        return "Mother";
      }
      if (person.parents && person.parents.length > 0) {
        return "Daughter";
      }
      return "Female";
    }
    
    return "Person";
  };
  
  // Get label color class based on gender
  const getLabelClass = () => {
    switch (person.gender?.toLowerCase()) {
      case 'male':
        return 'bg-blue-100 text-blue-700';
      case 'female':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };
  
  return (
    <div 
      className={`person-card bg-white rounded-md shadow-md p-4 w-64 border-t-4 ${genderClass}`}
      onClick={onClick}
    >
      <div className="text-lg font-medium">{person.name}</div>
      <div className="text-sm text-gray-500">
        {formatDate(person.birthDate)}
        {person.deathDate && ` - ${formatDate(person.deathDate)}`}
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className={`text-xs ${getLabelClass()} px-2 py-1 rounded-full`}>
          {getRelationshipLabel()}
        </span>
        <button 
          className="text-gray-400 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>
      
      {person.birthPlace && (
        <div className="mt-1 text-xs text-gray-500">
          Born in: {person.birthPlace}
        </div>
      )}
    </div>
  );
}
