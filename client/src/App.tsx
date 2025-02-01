import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Container,
  Heading,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  VStack,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";

// Define our Dog interface
interface Dog {
  id: number;
  name: string;
  breed: string;
}

const App: React.FC = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [newDog, setNewDog] = useState<Pick<Dog, "name" | "breed">>({
    name: "",
    breed: "",
  });

  const toast = useToast();

  // Fetch the dogs array on first render
  useEffect(() => {
    fetch("/dogs")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch dogs");
        }
        return res.json();
      })
      .then((data: Dog[]) => setDogs(data))
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error fetching dogs",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [toast]);

  // ===============================
  // Handle Editing
  // ===============================
  const handleEdit = (dogId: number) => {
    setEditingRow(dogId);
  };

  const handleChange = (
    dogId: number,
    field: "name" | "breed",
    value: string
  ) => {
    setDogs((prevDogs) =>
      prevDogs.map((dog) =>
        dog.id === dogId ? { ...dog, [field]: value } : dog
      )
    );
  };

  const handleSave = (dogId: number) => {
    const dogToUpdate = dogs.find((d) => d.id === dogId);
    if (!dogToUpdate) return;

    fetch(`/dogs/${dogId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: dogToUpdate.name,
        breed: dogToUpdate.breed,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update dog");
        }
        return res.json();
      })
      .then((updatedDog: Dog) => {
        setDogs((prevDogs) =>
          prevDogs.map((d) => (d.id === updatedDog.id ? updatedDog : d))
        );
        setEditingRow(null);
        toast({
          title: "Dog updated",
          description: `Successfully updated ${updatedDog.name}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error updating dog",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // ===============================
  // Handle Deletion
  // ===============================
  const handleDelete = (dogId: number) => {
    fetch(`/dogs/${dogId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete dog");
        }
        return res.json();
      })
      .then(() => {
        setDogs((prevDogs) => prevDogs.filter((d) => d.id !== dogId));
        toast({
          title: "Dog deleted",
          description: `Dog with ID ${dogId} was deleted.`,
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error deleting dog",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // ===============================
  // Handle Creation
  // ===============================
  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    fetch("/dogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDog),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create dog");
        }
        return res.json();
      })
      .then((createdDog: Dog) => {
        setDogs((prevDogs) => [...prevDogs, createdDog]);
        setNewDog({ name: "", breed: "" });
        toast({
          title: "Dog created",
          description: `New dog added: ${createdDog.name}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error creating dog",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6} size="lg">
        Dog CRUD Demo (Chakra UI)
      </Heading>

      <Box overflowX="auto" mb={8}>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Breed</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {dogs.map((dog) => (
              <Tr key={dog.id}>
                <Td>{dog.id}</Td>
                <Td>
                  {editingRow === dog.id ? (
                    <Input
                      size="sm"
                      value={dog.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(dog.id, "name", e.target.value)
                      }
                    />
                  ) : (
                    dog.name
                  )}
                </Td>
                <Td>
                  {editingRow === dog.id ? (
                    <Input
                      size="sm"
                      value={dog.breed}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(dog.id, "breed", e.target.value)
                      }
                    />
                  ) : (
                    dog.breed
                  )}
                </Td>
                <Td>
                  {editingRow === dog.id ? (
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleSave(dog.id)}
                      mr={2}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      colorScheme="teal"
                      size="sm"
                      onClick={() => handleEdit(dog.id)}
                      mr={2}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleDelete(dog.id)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Heading size="md" mb={3}>
        Add a New Dog
      </Heading>
      <Box as="form" onSubmit={handleCreate}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              value={newDog.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewDog((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Breed</FormLabel>
            <Input
              value={newDog.breed}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewDog((prev) => ({ ...prev, breed: e.target.value }))
              }
            />
          </FormControl>
          <Button type="submit" colorScheme="blue">
            Create
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default App;

