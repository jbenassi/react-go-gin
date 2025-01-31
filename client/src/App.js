import React, { useState, useEffect } from "react";

function App() {
    const [dogs, setDogs] = useState([]);
    const [editingRow, setEditingRow] = useState(null); // store the ID of the dog being edited
    const [newDog, setNewDog] = useState({ name: "", breed: "" });

    // Fetch data on mount
    useEffect(() => {
        fetch("/dogs") // In dev, this is proxied to http://localhost:8080
            .then((res) => res.json())
            .then((data) => setDogs(data))
            .catch((err) => console.error(err));
    }, []);

    // ===============================
    // Edit a doggy in the list
    // ===============================
    const handleEdit = (dogId) => {
        setEditingRow(dogId);
    };

    const handleChange = (dogId, field, value) => {
        // Update the local state to reflect changes in the editable fields
        setDogs((prevDogs) =>
            prevDogs.map((d) =>
                d.id === dogId ? { ...d, [field]: value } : d
            )
        );
    };

    const handleSave = (dogId) => {
        // Find the dog in state
        const dogToUpdate = dogs.find((d) => d.id === dogId);
        // Send a PUT request
        fetch(`/dogs/${dogId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: dogToUpdate.name, breed: dogToUpdate.breed }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to update dog");
                }
                return res.json();
            })
            .then((updatedDog) => {
                // Update local state with updated dog from server
                setDogs((prevDogs) =>
                    prevDogs.map((d) => (d.id === updatedDog.id ? updatedDog : d))
                );
                setEditingRow(null); // exit edit mode
            })
            .catch((err) => console.error(err));
    };

    // ===============================
    // Remove a doggy from list
    // ===============================
    const handleDelete = (dogId) => {
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
                // Remove dog from local state
                setDogs((prevDogs) => prevDogs.filter((d) => d.id !== dogId));
            })
            .catch((err) => console.error(err));
    };

    // ===============================
    // This Creates the new pups
    // ===============================
    const handleCreate = (e) => {
        e.preventDefault();
        // POST to /dogs
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
            .then((createdDog) => {
                setDogs((prevDogs) => [...prevDogs, createdDog]);
                setNewDog({ name: "", breed: "" });
            })
            .catch((err) => console.error(err));
    };

    return (
        <div style={{ fontFamily: "sans-serif", padding: "1em", maxWidth: "600px" }}>
            <h1>Dog CRUD Demo</h1>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Breed</th>
                    <th style={thStyle}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {dogs.map((dog) => (
                    <tr key={dog.id}>
                        <td style={tdStyle}>{dog.id}</td>
                        <td style={tdStyle}>
                            {editingRow === dog.id ? (
                                <input
                                    type="text"
                                    value={dog.name}
                                    onChange={(e) =>
                                        handleChange(dog.id, "name", e.target.value)
                                    }
                                />
                            ) : (
                                dog.name
                            )}
                        </td>
                        <td style={tdStyle}>
                            {editingRow === dog.id ? (
                                <input
                                    type="text"
                                    value={dog.breed}
                                    onChange={(e) =>
                                        handleChange(dog.id, "breed", e.target.value)
                                    }
                                />
                            ) : (
                                dog.breed
                            )}
                        </td>
                        <td style={tdStyle}>
                            {editingRow === dog.id ? (
                                <button onClick={() => handleSave(dog.id)}>Save</button>
                            ) : (
                                <button onClick={() => handleEdit(dog.id)}>Edit</button>
                            )}{" "}
                            <button
                                style={{ marginLeft: "0.5em" }}
                                onClick={() => handleDelete(dog.id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h2>Add a New Dog</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", gap: "1em" }}>
                <div>
                    <label>Name: </label>
                    <input
                        type="text"
                        value={newDog.name}
                        onChange={(e) =>
                            setNewDog((prev) => ({ ...prev, name: e.target.value }))
                        }
                    />
                </div>
                <div>
                    <label>Breed: </label>
                    <input
                        type="text"
                        value={newDog.breed}
                        onChange={(e) =>
                            setNewDog((prev) => ({ ...prev, breed: e.target.value }))
                        }
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    );
}

// Simple styling for demo
const thStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    textAlign: "left",
};

const tdStyle = {
    border: "1px solid #ccc",
    padding: "8px",
};

export default App;
