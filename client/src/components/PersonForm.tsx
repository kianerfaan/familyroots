import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personFormSchema, relationshipFormSchema, Person, PersonForm as PersonFormType } from "@shared/schema";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PersonFormProps {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
}

export default function PersonForm({ isOpen, person, onClose }: PersonFormProps) {
  const { data, addPerson, updatePerson, deletePerson, addRelationship } = useFamilyTree();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [relationshipType, setRelationshipType] = useState<string>("");
  const [relatedPersonId, setRelatedPersonId] = useState<string>("");
  
  // Initialize form with person data or defaults
  const form = useForm<PersonFormType>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      name: person?.name || "",
      gender: person?.gender || "",
      birthDate: person?.birthDate ? new Date(person.birthDate).toISOString().slice(0, 10) : "",
      birthPlace: person?.birthPlace || "",
      deathDate: person?.deathDate ? new Date(person.deathDate).toISOString().slice(0, 10) : "",
      notes: person?.notes || ""
    }
  });
  
  // Reset form when person changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: person?.name || "",
        gender: person?.gender || "",
        birthDate: person?.birthDate ? new Date(person.birthDate).toISOString().slice(0, 10) : "",
        birthPlace: person?.birthPlace || "",
        deathDate: person?.deathDate ? new Date(person.deathDate).toISOString().slice(0, 10) : "",
        notes: person?.notes || ""
      });
      setRelationshipType("");
      setRelatedPersonId("");
    }
  }, [person, isOpen, form]);
  
  // Submit handler
  const onSubmit = async (values: PersonFormType) => {
    try {
      if (person) {
        // Update existing person
        await updatePerson(person.id, values);
      } else {
        // Create new person
        const newPerson = await addPerson(values);
        
        // Add relationship if both fields are selected
        if (newPerson && relationshipType && relatedPersonId) {
          const relatedId = parseInt(relatedPersonId);
          if (!isNaN(relatedId)) {
            await addRelationship({
              type: relationshipType as any,
              personId: newPerson.id,
              relatedPersonId: relatedId
            });
          }
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving person:", error);
    }
  };
  
  // Delete handler
  const handleDelete = async () => {
    if (person) {
      await deletePerson(person.id);
      setIsDeleteDialogOpen(false);
      onClose();
    }
  };
  
  // Get other persons for relationship dropdown
  const otherPersons = data.persons.filter(p => !person || p.id !== person.id);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 md:mx-0">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-primary">
            {person ? `Edit ${person.name}` : 'Add Family Member'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthPlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Place</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deathDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Death Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Relationship section - only show when adding a new person */}
                {!person && otherPersons.length > 0 && (
                  <div className="md:col-span-2">
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Relationship</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="block text-sm text-gray-700 mb-1">Type</FormLabel>
                        <Select
                          onValueChange={setRelationshipType}
                          value={relationshipType}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="parent">Parent of</SelectItem>
                            <SelectItem value="child">Child of</SelectItem>
                            <SelectItem value="spouse">Spouse of</SelectItem>
                            <SelectItem value="sibling">Sibling of</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FormLabel className="block text-sm text-gray-700 mb-1">Person</FormLabel>
                        <Select
                          onValueChange={setRelatedPersonId}
                          value={relatedPersonId}
                          disabled={!relationshipType}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select person" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {otherPersons.map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional information"
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                {person && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Person
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      
      {/* Confirmation dialog for deletion */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {person?.name} and all their relationships from your family tree.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
